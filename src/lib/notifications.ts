import { getStorage, setStorage, STORAGE_KEYS } from './storage';

export type NotificationType = 'gift' | 'follow' | 'drop' | 'ppv' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  createdAt: number;
  read: boolean;
}

export type NotificationDraft = Omit<Notification, 'id' | 'createdAt' | 'read'> & {
  id?: string;
  createdAt?: number;
  read?: boolean;
};

const TYPES: ReadonlySet<string> = new Set(['gift', 'follow', 'drop', 'ppv', 'system']);

type Listener = () => void;
const listeners = new Set<Listener>();

function emit(): void {
  [...listeners].forEach((fn) => fn());
}

/** Same-tab inbox updates (storage events only fire across tabs). */
export function subscribeNotifications(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

let fallbackId = 0;

function nextId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  fallbackId += 1;
  return `n-${Date.now()}-${fallbackId}`;
}

function isNotification(value: unknown): value is Notification {
  if (!value || typeof value !== 'object') return false;
  const n = value as Record<string, unknown>;
  return (
    typeof n.id === 'string' &&
    TYPES.has(n.type as string) &&
    typeof n.title === 'string' &&
    typeof n.body === 'string' &&
    typeof n.createdAt === 'number' &&
    typeof n.read === 'boolean' &&
    (n.href === undefined || typeof n.href === 'string')
  );
}

function write(list: Notification[]): Notification[] {
  const sorted = [...list].sort((a, b) => b.createdAt - a.createdAt);
  setStorage(STORAGE_KEYS.notifications, sorted);
  emit();
  return sorted;
}

/**
 * Client notification inbox — localStorage seam only.
 *
 * Confirmed gifts/follows are pulled by `syncLiveInbox` after the BTCPay webhook
 * writes `transactions.status='confirmed'`. Seeded items are a preview, not payment truth.
 */
export function getNotifications(): Notification[] {
  const raw = getStorage<unknown>(STORAGE_KEYS.notifications, []);
  if (!Array.isArray(raw)) return [];
  return raw.filter(isNotification).sort((a, b) => b.createdAt - a.createdAt);
}

export function addNotification(draft: NotificationDraft): Notification {
  const existing = getNotifications();
  if (draft.id) {
    const found = existing.find((n) => n.id === draft.id);
    if (found) return found;
  }
  const item: Notification = {
    id: draft.id ?? nextId(),
    type: draft.type,
    title: draft.title,
    body: draft.body,
    createdAt: draft.createdAt ?? Date.now(),
    read: draft.read ?? false,
  };
  if (draft.href) item.href = draft.href;
  write([item, ...existing]);
  return item;
}

export function markRead(id: string): void {
  const next = getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
  write(next);
}

export function markAllRead(): void {
  write(getNotifications().map((n) => (n.read ? n : { ...n, read: true })));
}

export function unreadCount(): number {
  return getNotifications().filter((n) => !n.read).length;
}

/** Tasteful preview items so demo + empty accounts have something to open. */
export function seedDemoNotifications(): Notification[] {
  const existing = getNotifications();
  if (existing.length > 0) return existing;

  const now = Date.now();
  const seeded: Notification[] = [
    {
      id: 'demo-gift-21k',
      type: 'gift',
      title: '21,000 sats gift',
      body: 'Preview of a supporter gift toward your wishlist. Lightning settlement is not live yet.',
      href: '/dashboard',
      createdAt: now - 18 * 60 * 1000,
      read: false,
    },
    {
      id: 'demo-follow',
      type: 'follow',
      title: 'New follower',
      body: 'Someone started following your work. See supporters from your dashboard.',
      href: '/dashboard',
      createdAt: now - 2 * 60 * 60 * 1000,
      read: false,
    },
    {
      id: 'demo-drop-luna',
      type: 'drop',
      title: 'New drop from Luna',
      body: 'Studio Session — Vol. 3 just landed.',
      href: '/wishlist/luna-exclusive-videos',
      createdAt: now - 8 * 60 * 60 * 1000,
      read: false,
    },
    {
      id: 'demo-ppv',
      type: 'ppv',
      title: 'PPV unlock',
      body: 'Preview of a fan unlocking a pay-per-view clip. Live invoices ship with Lightning.',
      href: '/wishlist/luna-exclusive-videos',
      createdAt: now - 26 * 60 * 60 * 1000,
      read: false,
    },
    {
      id: 'demo-system-lightning',
      type: 'system',
      title: 'Add Lightning',
      body: 'Add a Lightning address so gifts can land when invoices go live.',
      href: '/settings',
      createdAt: now - 3 * 24 * 60 * 60 * 1000,
      read: false,
    },
  ];
  return write(seeded);
}
