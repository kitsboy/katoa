import { useState } from 'react';
import { Link2, Copy, Check } from 'lucide-react';
import { Button } from './Button';
import { copyToClipboard } from '../lib/clipboard';
import { useToast } from './Toast';

export function ReferralLinkGenerator() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const ref = 'katoa-ref';
  const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://katoa.org'}/?utm_source=referral&utm_medium=share&utm_campaign=${ref}`;

  const copy = async () => {
    const result = await copyToClipboard(url);
    const ok = result === 'success';
    setCopied(ok);
    toast(ok ? 'Referral link copied!' : 'Copy failed', ok ? 'success' : 'error');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
      <div className="flex items-center gap-2 mb-2">
        <Link2 size={16} className="text-neon-cyan-400" />
        <span className="text-sm font-semibold text-white">Share KATOA</span>
      </div>
      <p className="text-xs text-gray-400 mb-3">Copy your referral link with UTM tracking.</p>
      <div className="flex gap-2">
        <input readOnly value={url} className="flex-1 min-w-0 px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-gray-300 font-mono truncate" aria-label="Referral URL" />
        <Button variant="outline" size="sm" onClick={copy} className="shrink-0 min-h-[40px]">
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </Button>
      </div>
    </div>
  );
}