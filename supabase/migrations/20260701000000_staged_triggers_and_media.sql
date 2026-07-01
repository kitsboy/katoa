/*
  STAGED MIGRATION — Run after provisioning new Supabase project.
  Combines roadmap triggers + media columns not yet in all environments.
*/

-- Video support on wishlists and items (idempotent)
ALTER TABLE wishlists ADD COLUMN IF NOT EXISTS cover_video_url text;
ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS video_url text;

-- Normalize transaction status values
UPDATE transactions SET status = 'confirmed' WHERE status = 'completed';

-- Auto-update funding totals when gifts are confirmed
CREATE OR REPLACE FUNCTION update_funding_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.item_id IS NOT NULL THEN
    UPDATE wishlist_items
    SET
      sats_raised = (
        SELECT COALESCE(SUM(amount_sats), 0)
        FROM transactions
        WHERE item_id = NEW.item_id AND status IN ('confirmed', 'completed')
      ),
      is_funded = (
        SELECT COALESCE(SUM(amount_sats), 0) >= price_sats
        FROM transactions
        WHERE item_id = NEW.item_id AND status IN ('confirmed', 'completed')
      ),
      updated_at = NOW()
    WHERE id = NEW.item_id;
  END IF;

  UPDATE wishlists
  SET
    total_sats_raised = (
      SELECT COALESCE(SUM(amount_sats), 0)
      FROM transactions
      WHERE wishlist_id = NEW.wishlist_id AND status IN ('confirmed', 'completed')
    ),
    updated_at = NOW()
  WHERE id = NEW.wishlist_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_funding ON transactions;
CREATE TRIGGER trg_update_funding
  AFTER INSERT OR UPDATE OF status ON transactions
  FOR EACH ROW
  WHEN (NEW.status IN ('confirmed', 'completed'))
  EXECUTE FUNCTION update_funding_totals();

-- View counter
CREATE OR REPLACE FUNCTION increment_view_count(wishlist_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE wishlists
  SET view_count = COALESCE(view_count, 0) + 1, updated_at = NOW()
  WHERE id = wishlist_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Notification helper
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message)
  VALUES (p_user_id, p_type, p_title, p_message)
  RETURNING id INTO notification_id;
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-notify on gift
CREATE OR REPLACE FUNCTION notify_on_gift()
RETURNS TRIGGER AS $$
DECLARE
  wishlist_owner_id UUID;
  wishlist_title TEXT;
  item_title TEXT;
BEGIN
  SELECT creator_id, title INTO wishlist_owner_id, wishlist_title
  FROM wishlists WHERE id = NEW.wishlist_id;

  IF NEW.item_id IS NOT NULL THEN
    SELECT title INTO item_title FROM wishlist_items WHERE id = NEW.item_id;
  END IF;

  PERFORM create_notification(
    wishlist_owner_id,
    'gift_received',
    'New Gift Received!',
    CASE
      WHEN item_title IS NOT NULL THEN
        format('%s contributed %s sats to "%s" in "%s"', NEW.contributor_name, NEW.amount_sats, item_title, wishlist_title)
      ELSE
        format('%s contributed %s sats to "%s"', NEW.contributor_name, NEW.amount_sats, wishlist_title)
    END
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_on_gift ON transactions;
CREATE TRIGGER trg_notify_on_gift
  AFTER INSERT ON transactions
  FOR EACH ROW
  WHEN (NEW.status IN ('confirmed', 'completed'))
  EXECUTE FUNCTION notify_on_gift();

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_wishlist_item ON transactions(wishlist_id, item_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_public ON wishlists(visibility) WHERE visibility = 'public';
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist ON wishlist_items(wishlist_id);