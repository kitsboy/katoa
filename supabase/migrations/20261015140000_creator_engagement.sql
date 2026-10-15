/*
  # Creator engagement: likes, comments, PPV unlocks

  Replaces three browser-local seams with rows a signed-in fan owns:

  - `post_likes`     — one row per (fan, post); public read so counts are honest.
  - `post_comments`  — public read, own write/delete.
  - `post_unlocks`   — a paid PPV unlock. Same posture as `subscriptions`:
                       nobody can insert an active row from a browser, only the
                       settlement webhook (service role) writes one. That is what
                       stops a client from unlocking paid media for free.

  `post_key` is the post identifier the app already uses (`CreatorPost.id`), kept
  as text because creator posts are still sample/creator data rather than a table.
  It is validated for shape so a client cannot stuff arbitrary text in.

  Free follows already live in `follows`; paid access lives in `subscriptions` and
  `post_unlocks`. A follow still unlocks nothing.
*/

CREATE TABLE IF NOT EXISTS public.post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, post_key),
  CHECK (post_key <> '' AND length(post_key) <= 200)
);

CREATE INDEX IF NOT EXISTS post_likes_post_key_idx ON public.post_likes (post_key);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Likes are public to read" ON public.post_likes;
CREATE POLICY "Likes are public to read"
  ON public.post_likes FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Users like as themselves" ON public.post_likes;
CREATE POLICY "Users like as themselves"
  ON public.post_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users remove their own like" ON public.post_likes;
CREATE POLICY "Users remove their own like"
  ON public.post_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_key text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (post_key <> '' AND length(post_key) <= 200),
  CHECK (length(btrim(body)) BETWEEN 1 AND 2000)
);

CREATE INDEX IF NOT EXISTS post_comments_post_key_idx
  ON public.post_comments (post_key, created_at DESC);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments are public to read" ON public.post_comments;
CREATE POLICY "Comments are public to read"
  ON public.post_comments FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Users comment as themselves" ON public.post_comments;
CREATE POLICY "Users comment as themselves"
  ON public.post_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete their own comment" ON public.post_comments;
CREATE POLICY "Users delete their own comment"
  ON public.post_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.post_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_key text NOT NULL,
  price_sats bigint NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  invoice_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, post_key),
  CHECK (post_key <> '' AND length(post_key) <= 200),
  CHECK (price_sats > 0),
  CHECK (status IN ('pending', 'active', 'expired', 'refunded'))
);

CREATE UNIQUE INDEX IF NOT EXISTS post_unlocks_invoice_unique
  ON public.post_unlocks (invoice_id)
  WHERE invoice_id IS NOT NULL;

ALTER TABLE public.post_unlocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Fans read their own unlocks" ON public.post_unlocks;
CREATE POLICY "Fans read their own unlocks"
  ON public.post_unlocks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policy on purpose: only the webhook, on the service
-- role, can activate a paid unlock. A browser-writable unlock would be a paywall
-- bypass, exactly like a browser-writable subscription.
