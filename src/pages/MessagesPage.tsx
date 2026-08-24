import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from '../components/Link';
import { PageMeta } from '../components/PageMeta';
import { PageHero } from '../components/PageHero';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  getDmOptInLocal,
  setDmOptInLocal,
  loadPrivateMessages,
  sendPrivateMessage,
  shortNpub,
  hasNip44,
  type ChatMessage,
} from '../lib/nostrChat';
import { hasNip07, nip07UserMessage, nostrService } from '../lib/nostr';
import {
  blockPubkey,
  getBlockedPubkeys,
  isBlocked,
  markMessagesRead,
  unblockPubkey,
} from '../lib/dmPrefs';
import { MessageCircle, Shield, Loader2, Send, Ban, UserX } from 'lucide-react';

/**
 * Optional private chat — creators/fans opt in.
 * Uses NIP-17 gift-wrap when extension supports NIP-44; else NIP-04.
 * Local blocklist + unread tracking (this device only).
 */
export function MessagesPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [optIn, setOptIn] = useState(getDmOptInLocal);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [peer, setPeer] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [myPub, setMyPub] = useState<string | null>(null);
  const [activePeer, setActivePeer] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string[]>(() => getBlockedPubkeys());

  const refresh = useCallback(async () => {
    if (!hasNip07() || !optIn) {
      setMessages([]);
      return;
    }
    setLoading(true);
    try {
      const pk = await window.nostr!.getPublicKey();
      setMyPub(pk);
      const list = await loadPrivateMessages(60);
      setMessages(list);
    } catch (e) {
      toast(nip07UserMessage(e), 'error');
    } finally {
      setLoading(false);
    }
  }, [optIn, toast]);

  useEffect(() => {
    if (optIn) void refresh();
  }, [optIn, refresh]);

  const threads = useMemo(() => {
    if (!myPub) return [] as string[];
    const set = new Set<string>();
    for (const m of messages) {
      const peerHex = m.from === myPub ? m.to : m.from;
      if (peerHex && !isBlocked(peerHex)) set.add(peerHex);
    }
    return [...set];
  }, [messages, myPub, blocked]);

  const threadMessages = useMemo(() => {
    if (!activePeer || !myPub) return [];
    return messages
      .filter((m) => m.from === activePeer || m.to === activePeer)
      .sort((a, b) => a.created_at - b.created_at);
  }, [messages, activePeer, myPub]);

  // Mark open thread as read
  useEffect(() => {
    if (!activePeer || threadMessages.length === 0) return;
    markMessagesRead(threadMessages.map((m) => m.id));
  }, [activePeer, threadMessages]);

  async function toggleOptIn(next: boolean) {
    setOptIn(next);
    setDmOptInLocal(next);
    if (next && hasNip07()) {
      try {
        const result = await nostrService.publishProfile({
          katoa_accept_dms: 'true',
          name: profile?.username,
          about: profile?.bio || undefined,
          lud16: profile?.lightning_address || undefined,
          picture: profile?.avatar_url || undefined,
        });
        if (!result.ok) {
          toast(result.message || 'Could not publish opt-in flag', 'error');
        } else {
          toast('Private messages enabled. Fans with your npub can message you.', 'success');
        }
        void refresh();
      } catch (e) {
        toast(nip07UserMessage(e), 'error');
      }
    } else if (!next) {
      toast('Private messages disabled on this device', 'info');
    }
  }

  function handleBlock(hex: string) {
    blockPubkey(hex);
    setBlocked(getBlockedPubkeys());
    if (activePeer === hex) setActivePeer(null);
    toast(t('messages.blocked'), 'info');
  }

  function handleUnblock(hex: string) {
    unblockPubkey(hex);
    setBlocked(getBlockedPubkeys());
    toast(t('messages.unblock'), 'success');
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSending(true);
    try {
      let recipient = peer.trim() || activePeer || '';
      if (!recipient) {
        toast('Enter a recipient npub or hex pubkey', 'error');
        return;
      }
      recipient = nostrService.normalizePubkey(recipient);
      if (isBlocked(recipient)) {
        toast(t('messages.blocked'), 'error');
        return;
      }
      const result = await sendPrivateMessage({
        recipientPubkey: recipient,
        message: draft.trim(),
        conversationTitle: 'KATOA',
      });
      if (!result.ok) {
        toast(result.message || 'Send failed', 'error');
        return;
      }
      toast(result.message || 'Sent', 'success');
      setDraft('');
      setPeer(nostrService.encodeNpub(recipient));
      setActivePeer(recipient);
      void refresh();
    } catch (err) {
      toast(nip07UserMessage(err), 'error');
    } finally {
      setSending(false);
    }
  }

  // Prefill peer from ?to=
  useEffect(() => {
    const to = new URLSearchParams(window.location.search).get('to');
    if (to) {
      setPeer(to);
      try {
        setActivePeer(nostrService.normalizePubkey(to));
      } catch {
        /* leave as-is */
      }
    }
  }, []);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 pb-28 md:pb-16">
      <PageMeta
        title={t('messages.pageTitle')}
        description={t('messages.pageSubtitle')}
        path="/messages"
        noindex
      />
      <div
        className="max-w-3xl mx-auto px-4 sm:px-6 py-8"
        aria-label={t('a11y.messagesMain')}
      >
        <PageHero title={t('messages.pageTitle')} subtitle={t('messages.pageSubtitle')} />

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 mb-6">
          <div className="flex items-start gap-3">
            <Shield size={20} className="text-neon-cyan-400 shrink-0 mt-0.5" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-300 leading-relaxed mb-3">
                <strong className="text-white">Optional feature.</strong> Off by default. Uses your browser Nostr
                extension (Alby / nos2x). Prefer gift-wrap when NIP-44 is available
                {hasNip44() ? ' (detected)' : ' (not detected — NIP-04 fallback)'}.
              </p>
              <label
                className="flex items-center gap-3 min-h-[48px] cursor-pointer touch-manipulation"
                htmlFor="messages-opt-in"
              >
                <input
                  id="messages-opt-in"
                  type="checkbox"
                  className="w-5 h-5 rounded border-white/20"
                  checked={optIn}
                  onChange={(e) => void toggleOptIn(e.target.checked)}
                  data-testid="messages-opt-in"
                />
                <span className="text-sm font-semibold text-white">{t('messages.enable')}</span>
              </label>
            </div>
          </div>
        </div>

        {!hasNip07() && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100"
          >
            Install a Nostr extension to use chat.{' '}
            <a className="underline font-semibold" href="https://getalby.com" target="_blank" rel="noreferrer">
              Alby
            </a>{' '}
            or nos2x. We never ask for your private key.
          </div>
        )}

        {optIn && (
          <div className="grid md:grid-cols-[200px_1fr] gap-4">
            <aside
              className="rounded-2xl border border-white/10 bg-black/20 p-3 max-h-[50vh] overflow-y-auto"
              aria-label="Conversation threads"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Threads</p>
                <button
                  type="button"
                  className="text-[10px] text-neon-cyan-400 min-h-[32px] min-w-[44px]"
                  onClick={() => void refresh()}
                  disabled={loading}
                  aria-label="Refresh messages"
                >
                  {loading ? '…' : 'Refresh'}
                </button>
              </div>
              {threads.length === 0 && (
                <p className="text-xs text-gray-500 py-4">No messages yet. Start a conversation below.</p>
              )}
              <ul className="space-y-1" role="list">
                {threads.map((hex) => (
                  <li key={hex}>
                    <button
                      type="button"
                      onClick={() => {
                        setActivePeer(hex);
                        setPeer(nostrService.encodeNpub(hex));
                      }}
                      className={`w-full text-left px-2 py-2.5 rounded-lg text-xs font-mono min-h-[44px] touch-manipulation ${
                        activePeer === hex
                          ? 'bg-neon-cyan-500/15 text-neon-cyan-300 border border-neon-cyan-500/30'
                          : 'text-gray-400 hover:bg-white/5'
                      }`}
                      aria-current={activePeer === hex ? 'true' : undefined}
                    >
                      {shortNpub(hex)}
                    </button>
                  </li>
                ))}
              </ul>
            </aside>

            <section
              className="rounded-2xl border border-white/10 bg-black/20 flex flex-col min-h-[360px]"
              aria-label="Active conversation"
            >
              {activePeer && (
                <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-white/10">
                  <p className="text-xs font-mono text-gray-400 truncate">{shortNpub(activePeer)}</p>
                  <button
                    type="button"
                    onClick={() => handleBlock(activePeer)}
                    className="inline-flex items-center gap-1.5 text-xs text-rose-300 hover:text-rose-200 min-h-[40px] px-2 touch-manipulation"
                    aria-label={`${t('messages.block')} ${shortNpub(activePeer)}`}
                  >
                    <Ban size={14} aria-hidden />
                    {t('messages.block')}
                  </button>
                </div>
              )}
              <div
                className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 max-h-[50vh]"
                role="log"
                aria-live="polite"
                aria-relevant="additions"
              >
                {loading && (
                  <p className="text-center text-gray-500 text-sm py-8">
                    <Loader2 className="inline animate-spin mr-2" size={16} aria-hidden /> Loading…
                  </p>
                )}
                {!loading && threadMessages.length === 0 && (
                  <p className="text-center text-gray-500 text-sm py-8">
                    <MessageCircle className="inline mb-1" size={18} aria-hidden />
                    <br />
                    No messages in this thread.
                  </p>
                )}
                {threadMessages.map((m) => {
                  const mine = myPub && m.from === myPub;
                  return (
                    <div
                      key={m.id}
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        mine
                          ? 'ml-auto bg-bitcoin-orange-500/20 border border-bitcoin-orange-500/30 text-white'
                          : 'mr-auto bg-white/5 border border-white/10 text-gray-200'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {m.transport.toUpperCase()} · {new Date(m.created_at * 1000).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSend} className="border-t border-white/10 p-3 space-y-2" aria-label="Compose message">
                <Input
                  value={peer}
                  onChange={(e) => setPeer(e.target.value)}
                  placeholder="Recipient npub1… or hex"
                  className="font-mono text-xs min-h-[44px]"
                  aria-label="Recipient pubkey"
                />
                <div className="flex gap-2">
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write a private message…"
                    className="flex-1 min-h-[48px]"
                    aria-label="Message"
                  />
                  <Button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="min-h-[48px] min-w-[48px] px-4"
                    aria-label="Send"
                  >
                    {sending ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <Send size={18} aria-hidden />}
                  </Button>
                </div>
              </form>
            </section>
          </div>
        )}

        {blocked.length > 0 && (
          <section
            className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            aria-labelledby="blocked-list-heading"
          >
            <h2 id="blocked-list-heading" className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <UserX size={16} className="text-rose-400" aria-hidden />
              {t('messages.blockedList')}
            </h2>
            <ul className="space-y-2" role="list">
              {blocked.map((hex) => (
                <li
                  key={hex}
                  className="flex items-center justify-between gap-2 text-xs font-mono text-gray-400 min-h-[44px]"
                >
                  <span className="truncate">{shortNpub(hex)}</span>
                  <button
                    type="button"
                    onClick={() => handleUnblock(hex)}
                    className="text-neon-cyan-400 hover:text-neon-cyan-300 min-h-[40px] px-2 shrink-0 touch-manipulation"
                  >
                    {t('messages.unblock')}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!optIn && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Prefer open tips only? Stay on wishlists —{' '}
            <Link href="/explore" className="text-neon-cyan-400 hover:underline">
              Explore
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
