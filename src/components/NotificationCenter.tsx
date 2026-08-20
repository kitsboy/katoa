import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Bell, Gift, Lock, Sparkles, UserPlus, Zap } from 'lucide-react';
import { Link } from './Link';
import { DemoBadge } from './DemoBadge';
import { useAuth } from '../contexts/AuthContext';
import { formatRelativeTime } from '../lib/i18nFormat';
import {
  getNotifications,
  markAllRead,
  markRead,
  seedDemoNotifications,
  subscribeNotifications,
  type Notification,
  type NotificationType,
} from '../lib/notifications';

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  gift: Gift,
  follow: UserPlus,
  drop: Sparkles,
  ppv: Lock,
  system: Zap,
};

function refreshList(): Notification[] {
  const existing = getNotifications();
  if (existing.length > 0) return existing;
  return seedDemoNotifications();
}

function NotificationRow({
  item,
  onOpen,
}: {
  item: Notification;
  onOpen: (item: Notification) => void;
}) {
  const Icon = TYPE_ICON[item.type];
  const time = formatRelativeTime(new Date(item.createdAt));
  const inner = (
    <>
      <span
        className={`mt-0.5 shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border ${
          item.read
            ? 'bg-white/5 border-white/10 text-gray-400'
            : 'bg-bitcoin-orange-500/15 border-bitcoin-orange-500/30 text-bitcoin-orange-400'
        }`}
        aria-hidden
      >
        <Icon size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-semibold leading-snug ${item.read ? 'text-gray-300' : 'text-white'}`}>
          {item.title}
        </span>
        <span className="block text-xs text-gray-400 mt-0.5 leading-relaxed">{item.body}</span>
        <span className="block text-[10px] uppercase tracking-wider text-gray-500 mt-1.5">{time}</span>
      </span>
      {!item.read && (
        <span className="mt-2 shrink-0 w-2 h-2 rounded-full bg-bitcoin-orange-500" aria-hidden />
      )}
    </>
  );

  const className = `flex items-start gap-3 w-full px-4 py-3 text-left transition-colors hover:bg-white/[0.05] ${
    item.read ? '' : 'bg-bitcoin-orange-500/[0.06]'
  }`;

  if (item.href) {
    return (
      <Link href={item.href} className={className} onClick={() => onOpen(item)}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={() => onOpen(item)}>
      {inner}
    </button>
  );
}

function InboxList({
  items,
  onOpen,
}: {
  items: Notification[];
  onOpen: (item: Notification) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="px-5 py-10 text-center" role="status">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
          <Bell size={20} className="text-gray-500" aria-hidden />
        </div>
        <p className="text-sm font-semibold text-white">You&apos;re all caught up</p>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">No notifications yet.</p>
      </div>
    );
  }

  return (
    <ul role="list" className="divide-y divide-white/10">
      {items.map((item) => (
        <li key={item.id}>
          <NotificationRow item={item} onOpen={onOpen} />
        </li>
      ))}
    </ul>
  );
}

export function NotificationCenter({
  variant = 'popover',
  onNavigate,
}: {
  variant?: 'popover' | 'inline';
  onNavigate?: () => void;
}) {
  const { isDemoUser } = useAuth();
  const panelId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(getNotifications);
  const unread = items.filter((n) => !n.read).length;

  const sync = useCallback(() => {
    setItems(getNotifications());
  }, []);

  useEffect(() => {
    setItems(refreshList());
    return subscribeNotifications(sync);
  }, [sync]);

  useEffect(() => {
    if (variant !== 'popover' || !open) return;

    const onPointer = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, variant]);

  const handleOpen = (item: Notification) => {
    markRead(item.id);
    sync();
    setOpen(false);
    onNavigate?.();
  };

  const handleMarkAll = () => {
    markAllRead();
    sync();
  };

  const badgeLabel = unread > 0 ? `${unread > 9 ? '9+' : unread}` : null;

  if (variant === 'inline') {
    return (
      <section
        className="rounded-2xl border border-white/10 bg-charcoal-950/80 overflow-hidden"
        aria-label="Notifications"
      >
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative shrink-0 w-9 h-9 rounded-xl bg-bitcoin-orange-500/15 border border-bitcoin-orange-500/30 flex items-center justify-center">
              <Bell size={16} className="text-bitcoin-orange-400" aria-hidden />
              {badgeLabel && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-bitcoin-orange-500 text-charcoal-950 text-[9px] font-black flex items-center justify-center">
                  {badgeLabel}
                </span>
              )}
            </span>
            <h2 className="text-sm font-bold text-white">Notifications</h2>
            {isDemoUser && <DemoBadge title="Preview inbox — not live events" />}
          </div>
          {unread > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="shrink-0 text-[11px] font-semibold text-bitcoin-orange-400 hover:text-bitcoin-orange-300 min-h-[44px] px-2"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto overscroll-contain">
          <InboxList items={items} onOpen={handleOpen} />
        </div>
      </section>
    );
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className="nav-link-pill relative inline-flex items-center justify-center min-h-[44px] min-w-[44px] p-0"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={18} aria-hidden />
        {badgeLabel && (
          <span
            className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-bitcoin-orange-500 text-charcoal-950 text-[10px] font-black"
            aria-hidden
          >
            {badgeLabel}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Notifications"
          tabIndex={-1}
          className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-1.5rem))] max-h-[min(28rem,70vh)] flex flex-col rounded-2xl border border-white/10 bg-charcoal-950/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden z-[60]"
        >
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-sm font-bold text-white">Notifications</h2>
              {isDemoUser && <DemoBadge title="Preview inbox — not live events" />}
              {unread > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-bitcoin-orange-400">
                  {unread} new
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-[11px] font-semibold text-bitcoin-orange-400 hover:text-bitcoin-orange-300 min-h-[44px] px-2 shrink-0"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="overflow-y-auto overscroll-contain flex-1">
            <InboxList items={items} onOpen={handleOpen} />
          </div>
        </div>
      )}
    </div>
  );
}
