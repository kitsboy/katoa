import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Share2, Twitter, Facebook, Linkedin, Link as LinkIcon, MessageCircle, Check } from 'lucide-react';
import { Button } from './Button';
import { copyToClipboard } from '../lib/clipboard';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

export function ShareButton({ url, title, description, className = '' }: ShareButtonProps) {
  const { t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMenu(false);
        triggerRef.current?.querySelector('button')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showMenu]);

  const fullUrl = `${window.location.origin}${url}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || title);

  const shareLinks = {
    twitter: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}%20-%20Support%20this%20wishlist%20with%20Bitcoin!`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
  };

  const handleCopyLink = async () => {
    const result = await copyToClipboard(fullUrl);
    if (result === 'success') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareClick = async () => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title,
          text: description || title,
          url: fullUrl,
        });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }
    setShowMenu(!showMenu);
  };

  return (
    <div className={`relative ${className}`} ref={triggerRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleShareClick}
        className="gap-2 border-white/15 hover:border-neon-cyan-500/50 text-white font-bold bg-white/5 hover:bg-white/10 backdrop-blur-sm"
        aria-expanded={showMenu}
        aria-haspopup="menu"
      >
        <Share2 size={16} />
        {t('share.button')}
      </Button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-charcoal-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl py-2 z-50" role="menu">
            <div className="px-4 py-2 border-b border-white/10">
              <p className="text-sm font-semibold text-white">{t('share.title')}</p>
            </div>

            <div className="py-2">
              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 text-white transition-colors"
                role="menuitem"
              >
                <Twitter size={18} className="text-blue-400" />
                <span className="text-sm">{t('share.twitter')}</span>
              </a>

              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 text-white transition-colors"
              >
                <Facebook size={18} className="text-blue-600" />
                <span className="text-sm">Share on Facebook</span>
              </a>

              <a
                href={shareLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 text-white transition-colors"
              >
                <Linkedin size={18} className="text-blue-500" />
                <span className="text-sm">Share on LinkedIn</span>
              </a>

              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 text-white transition-colors"
              >
                <MessageCircle size={18} className="text-green-500" />
                <span className="text-sm">Share on WhatsApp</span>
              </a>

              <a
                href={shareLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 text-white transition-colors"
              >
                <svg className="w-[18px] h-[18px] text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
                <span className="text-sm">Share on Telegram</span>
              </a>

              <a
                href={shareLinks.reddit}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 text-white transition-colors"
              >
                <svg className="w-[18px] h-[18px] text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.92 11.5c.05.27.08.54.08.82 0 2.22-2.58 4.03-5.77 4.03s-5.77-1.81-5.77-4.03c0-.28.03-.55.08-.82-.42-.26-.7-.72-.7-1.24 0-.82.66-1.48 1.48-1.48.42 0 .8.18 1.08.46 1.02-.66 2.37-1.08 3.88-1.13l.74-3.48c.02-.08.08-.13.16-.13l2.46.52c.14-.32.46-.55.84-.55.51 0 .92.41.92.92s-.41.92-.92.92c-.51 0-.92-.41-.92-.92l-2.18-.46-.65 3.06c1.49.06 2.83.48 3.84 1.14.27-.29.66-.47 1.09-.47.82 0 1.48.66 1.48 1.48 0 .52-.28.98-.7 1.24zM9.5 13.5c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1zm5.07 2.59c-.49.49-1.26.74-2.32.74h-.02c-1.06 0-1.83-.25-2.32-.74-.14-.14-.14-.36 0-.5.14-.14.36-.14.5 0 .35.35.89.53 1.82.53h.02c.93 0 1.47-.18 1.82-.53.14-.14.36-.14.5 0 .14.14.14.36 0 .5zm-.57-1.59c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
                </svg>
                <span className="text-sm">Share on Reddit</span>
              </a>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 text-white transition-colors w-full border-t border-white/10 mt-2 pt-3"
                role="menuitem"
              >
                {copied ? (
                  <>
                    <Check size={18} className="text-green-500" />
                    <span className="text-sm text-green-500">Link copied!</span>
                  </>
                ) : (
                  <>
                    <LinkIcon size={18} className="text-gray-400" />
                    <span className="text-sm">Copy link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
