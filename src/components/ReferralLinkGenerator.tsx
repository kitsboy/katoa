import { useState } from 'react';
import { Link2, Copy, Check } from 'lucide-react';
import { Button } from './Button';
import { copyToClipboard } from '../lib/clipboard';
import { useToast } from './Toast';

export function ReferralLinkGenerator({ campaign }: { campaign?: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const ref = campaign?.replace(/[^a-z0-9_-]/gi, '').slice(0, 40) || 'katoa-ref';
  const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://katoa.org'}/?utm_source=referral&utm_medium=share&utm_campaign=${ref}`;

  const copy = async () => {
    const result = await copyToClipboard(url);
    const ok = result === 'success';
    setCopied(ok);
    toast(ok ? 'Referral link copied!' : 'Copy failed', ok ? 'success' : 'error');
    setTimeout(() => setCopied(false), 2000);
  };

  const tweet = `https://x.com/intent/tweet?text=${encodeURIComponent('Keep 100% of creator earnings on Bitcoin with KATOA — 0% platform fees.')}&url=${encodeURIComponent(url)}`;

  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
      <div className="flex items-center gap-2 mb-2">
        <Link2 size={16} className="text-neon-cyan-400" />
        <span className="text-sm font-semibold text-white">Share KATOA</span>
      </div>
      <p className="text-xs text-gray-400 mb-3">
        Invite creators with a tracked link. Reputation only — no KYC cashback theater.
      </p>
      <div className="flex gap-2 mb-3">
        <input
          readOnly
          value={url}
          className="flex-1 min-w-0 px-3 py-2.5 text-xs bg-white/5 border border-white/10 rounded-lg text-gray-300 font-mono truncate min-h-[44px]"
          aria-label="Referral URL"
        />
        <Button variant="outline" size="sm" onClick={copy} className="shrink-0 min-h-[44px] min-w-[44px]">
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </Button>
      </div>
      <a
        href={tweet}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-full min-h-[44px] rounded-lg border border-white/10 text-xs font-semibold text-gray-200 hover:border-neon-cyan-500/40 transition-colors"
      >
        Share on X
      </a>
    </div>
  );
}