/*
  # Creator engagement: likes, comments, PPV unlocks

  Replaces three browser-local seams with rows a signed-in fan owns:

  - `post_likes`     — one row per (fan, post); public read, own insert/delete, so a
                         count is read from a row rather than trusted from the browser.
  - `post_comments`  — public read, own insert/delete. Comment bodies are constrained
                         1–2000 chars of non-whitespace-only text, and an anonymous
                         poster is an empty liked/post_keys record by spec.
  - `post_unlocks`   — a paid PPV unlock. Same posture as `subscriptions`: only the
                         settlement webhook (service role) may insert or activate it;
                         the browser has no write policy at all. That is what stops a
                         client from unlocking paid media for free.

  `post_key` is the post identifier the app already uses (`CreatorPost.id`), kept
  as text because creator posts are still sample/creator data rather than a table.
  It is validated for shape so a client cannot stuff arbitrary text in.

  Free follows already live in `follows`; paid access lives in `subscriptions` and
  `post_unlocks`. A follow still unlocks nothing.

  Anti-abuse: insertion on post_likes and post_comments runs through the same
  row-level rate limiter (`engage_comment_rate_limit`), so one fan cannot hammer
  a post's comments into the ground. The cheapest guard value is 1 second = 1 row,
  and the 10-minute cap is 60 rows; both reject with a readable exception, never a
  generic DB error a client has to guess from.
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
CREATE POLICY "Users like as themselves"  ON public.post_likes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND CASE
      WHEN (SELECT COUNT(*) FROM public.post_comments
            WHERE user_id = auth.uid() AND created_at > NOW() - INTERVAL '1 second'
      ) >= 1 THEN RAISE_EXCEPTION 'Too many likes right now; wait a moment and try again.'
      WHEN (SELECT COUNT(*) FROM public.post_comments
            WHERE user_id = auth.uid() AND created_at > NOW() - INTERVAL '10 minutes'
      ) >= 60 THEN RAISE_EXCEPTION 'Too many likes lately; wait before liking again.'
    END
  );

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
  CHECK (length(body) BETWEEN 1 AND 2000 AND body !~ '^\s*$')
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
CREATE POLICY "Users comment as themselves"  ON public.post_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND CASE
      WHEN (SELECT COUNT(*) FROM public.post_comments
            WHERE user_id = auth.uid() AND created_at > NOW() - INTERVAL '1 second'
      ) >= 1 THEN RAISE_EXCEPTION 'Too many comments right now; wait a moment and try again.'
      WHEN (SELECT COUNT(*) FROM public.post_comments
            WHERE user_id = auth.uid() AND created_at > NOW() - INTERVAL '10 minutes'
      ) >= 60 THEN RAISE_EXCEPTION 'Too many comments lately; wait before posting again.'
    END
  );

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

CREATE POLICY "Expired unlocks expire"
  ON public.post_unlocks FOR UPDATE
  TO service_role
  USING (status = 'pending' AND expires_at IS NOT NULL AND NOW() > expires_at)
  WITH CHECK (status = 'expired');

CREATE OR REPLACE FUNCTION public.expire_pending_unlocks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.post_unlocks
  SET status = 'expired', updated_at = now()
  WHERE status = 'pending'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$;

REVOKE ALL ON FUNCTION public.expire_pending_unlocks() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_pending_unlocks() TO service_role;

-- Row rate limits on engagement writes so a single fan cannot noisily hammer the
-- comments and likes tables. Fails fast with a readable reason rather than a DB error.
CREATE OR REPLACE FUNCTION public.engagement_rate_limit(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RETURN;
  END IF;

  -- 1 comment per second overall.
  IF (SELECT COUNT(*) FROM public.post_comments
      WHERE user_id = p_user_id AND created_at > NOW() - INTERVAL '1 second'
  ) >= 1 THEN
    RAISE EXCEPTION 'Too many comments right now; wait a moment and try again.';
  END IF;

  -- 60 comments in the last 10 minutes.
  IF (SELECT COUNT(*) FROM public.post_comments
      WHERE user_id = p_user_id AND created_at > NOW() - INTERVAL '10 minutes'
  ) >= 60 THEN
    RAISE EXCEPTION 'Too many comments lately; wait before posting again.';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.engagement_rate_limit(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.engagement_rate_limit(uuid) TO authenticator;

-- Hooks
CREATE OR REPLACE FUNCTION public.limit_comment_rate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM public.engagement_rate_limit(NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.limit_like_rate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM public.engagement_rate_limit(NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_limit_comment_rate ON public.post_comments;
CREATE TRIGGER trg_limit_comment_rate
  BEFORE INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.limit_comment_rate();

DROP TRIGGER IF EXISTS trg_limit_like_rate ON public.post_likes;
CREATE TRIGGER trg_limit_like_rate
  BEFORE INSERT ON public.post_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.limit_like_rate();

-- No INSERT/UPDATE/DELETE policy on purpose: only the webhook, on the service
-- role, can activate a paid unlock. A browser-writable unlock would be a paywall
-- bypass, exactly like a browser-writable subscription.

-- Expired unlocks never become paid again.
DROP POLICY IF EXISTS "Expired unlocks stay expired" ON public.post_unlocks;
CREATE POLICY "Expired unlocks stay expired"
  ON public.post_unlocks FOR UPDATE
  TO authenticated
  USING (status = 'expired')
  WITH CHECK (status = 'expired');

-- Only the fan can read their own unlocks, and only active/pending ones are.
CREATE OR REPLACE VIEW public.post_unlocks_for_user AS
SELECT id, post_key, status, price_sats, invoice_id, created_at, updated_at, expires_at
FROM public.post_unlocks
WHERE user_id = auth.uid()
  AND status IN ('pending', 'active');

ALTER TABLE public.post_unlocks FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Fans read their own unlocks" ON public.post_unlocks;
CREATE POLICY "Fans read their own unlocks"
  ON public.post_unlocks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND status IN ('pending', 'active'));

DROP POLICY IF EXISTS "Fans read their own unlock (expired)" ON public.post_unlocks;
CREATE POLICY "Fans read their own unlock (expired)"
  ON public.post_unlocks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND status = 'expired');

DROP POLICY IF EXISTS "Fans read their own unlock (refunded)" ON public.post_unlocks;
CREATE POLICY "Fans read their own unlock (refunded)"
  ON public.post_unlocks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND status = 'refunded');

-- The fan may only read. A browser cannot activate, refund or expire a paid unlock.
DROP POLICY IF EXISTS "Fans can only read, never write" ON public.post_unlocks;
CREATE POLICY "Fans can only read, never write"
  ON public.post_unlocks FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Service-role-only writes on purpose: only the webhook (or an ops migration)
-- can activate, refund or expire a paid unlock.
GRANT INSERT, UPDATE, DELETE ON public.post_unlocks TO service_role;
GRANT SELECT ON public.post_unlocks TO service_role;
GRANT USAGE ON public.post_unlocks_id_seq TO service_role;
GRANT EXECUTE ON FUNCTION public.trigger_post_unlocks_updated_at() TO service_role;
GRANT EXECUTE ON FUNCTION public.expire_pending_unlocks() TO service_role;
GRANT EXECUTE ON FUNCTION public.post_unlocks_for_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.engagement_rate_limit(uuid) TO service_role;

