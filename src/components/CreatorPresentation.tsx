import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { StoryChapter } from './CreatorStoryChapters';
import { DemoPreviewBadge } from './DemoPreviewBadge';

export function CreatorPresentation({ chapters, index, onIndexChange, onClose, demo = false }: { chapters: StoryChapter[]; index: number; onIndexChange: (index: number) => void; onClose: () => void; demo?: boolean }) {
  const chapter = chapters[index];
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onIndexChange(Math.min(chapters.length - 1, index + 1));
      if (event.key === 'ArrowLeft') onIndexChange(Math.max(0, index - 1));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [chapters.length, index, onClose, onIndexChange]);
  if (!chapter) return null;
  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#08060e]/95 p-4 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Creator story presentation">
    <div className="absolute inset-x-4 top-4 flex items-center justify-between sm:inset-x-8"><div>{demo && <DemoPreviewBadge />}</div><button type="button" onClick={onClose} className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-white" aria-label="Close presentation"><X size={20} /></button></div>
    <div className="w-full max-w-3xl">
      <div className="mb-7 flex gap-1.5" aria-label="Presentation progress">{chapters.map((item, itemIndex) => <button key={item.id} type="button" onClick={() => onIndexChange(itemIndex)} aria-label={`Go to ${item.title}`} aria-current={itemIndex === index ? 'step' : undefined} className={`h-1.5 flex-1 rounded-full ${itemIndex <= index ? 'bg-bitcoin-orange-400' : 'bg-white/15'}`} />)}</div>
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.02] p-6 shadow-2xl sm:p-12">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-bitcoin-orange-300">Chapter {index + 1} · {chapter.eyebrow}</p><h2 className="mt-4 font-display text-3xl font-black leading-tight text-white sm:text-5xl">{chapter.title}</h2><p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">{chapter.body}</p><div className="mt-8 rounded-2xl border border-neon-cyan-500/20 bg-neon-cyan-500/[0.06] p-4 text-sm leading-relaxed text-neon-cyan-100">{chapter.detail}</div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3"><button type="button" onClick={() => onIndexChange(Math.max(0, index - 1))} disabled={index === 0} className="flex min-h-[48px] items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-bold text-gray-300 disabled:opacity-30"><ChevronLeft size={18} /> Previous</button><span className="text-xs text-gray-500">Use ← → or Esc</span><button type="button" onClick={() => onIndexChange(Math.min(chapters.length - 1, index + 1))} disabled={index === chapters.length - 1} className="flex min-h-[48px] items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-charcoal-950 disabled:opacity-30">Next <ChevronRight size={18} /></button></div>
    </div>
  </div>;
}
