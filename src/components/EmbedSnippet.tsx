import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from './Button';
import { copyToClipboard } from '../lib/clipboard';

/** Generate a simple embeddable “Fund on KATOA” button snippet for blogs. */
export function EmbedSnippet({
  path,
  title = 'Support on KATOA',
}: {
  path: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://katoa.org';
  const url = `${origin}${path.startsWith('/') ? path : `/${path}`}`;
  const snippet = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:12px 18px;border-radius:12px;background:#F7931A;color:#050509;font-weight:700;text-decoration:none;font-family:system-ui,sans-serif">${title}</a>`;

  async function copy() {
    const r = await copyToClipboard(snippet);
    if (r === 'success') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Embed button</p>
      <pre className="text-[11px] text-gray-300 overflow-x-auto whitespace-pre-wrap break-all mb-3 font-mono leading-relaxed">
        {snippet}
      </pre>
      <Button variant="outline" size="sm" onClick={copy} className="min-h-[44px]">
        {copied ? <Check size={16} className="mr-2 text-emerald-400" /> : <Copy size={16} className="mr-2" />}
        {copied ? 'Copied' : 'Copy HTML'}
      </Button>
    </div>
  );
}
