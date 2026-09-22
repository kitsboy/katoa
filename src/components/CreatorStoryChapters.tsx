import { useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronDown, FileCheck2, Heart, Sparkles } from 'lucide-react';

export interface StoryChapter {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  detail: string;
}

export function CreatorStoryChapters({ chapters, demo = false }: { chapters: StoryChapter[]; demo?: boolean }) {
  const [open, setOpen] = useState(chapters[0]?.id ?? '');
  return (
    <section className="mb-12" aria-labelledby="creator-story-heading">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-bitcoin-orange-400">The story</p><h2 id="creator-story-heading" className="mt-1 font-display text-2xl font-black text-white">A clearer path from person to impact</h2></div>
        {demo && <span className="rounded-full border border-bitcoin-orange-500/30 bg-bitcoin-orange-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-bitcoin-orange-200">Sample story</span>}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {chapters.map((chapter, index) => {
          const expanded = open === chapter.id;
          return <article key={chapter.id} className={`rounded-2xl border transition-colors ${expanded ? 'border-neon-cyan-500/35 bg-neon-cyan-500/[0.06]' : 'border-white/10 bg-white/[0.03]'}`}>
            <button type="button" className="flex min-h-[76px] w-full items-center gap-3 px-4 py-4 text-left" onClick={() => setOpen(expanded ? '' : chapter.id)} aria-expanded={expanded}>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${expanded ? 'bg-neon-cyan-500/15 text-neon-cyan-300' : 'bg-white/5 text-gray-500'}`} aria-hidden>{index === 0 ? <Heart size={17} /> : index === 1 ? <Sparkles size={17} /> : index === 2 ? <CheckCircle2 size={17} /> : <FileCheck2 size={17} />}</span>
              <span className="min-w-0 flex-1"><span className="block text-[10px] font-black uppercase tracking-wider text-gray-500">{chapter.eyebrow}</span><span className="mt-1 block font-bold text-white">{chapter.title}</span></span>
              <ChevronDown size={17} className={`shrink-0 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden />
            </button>
            {expanded && <div className="border-t border-white/10 px-4 pb-4 pt-3"><p className="text-sm leading-relaxed text-gray-300">{chapter.body}</p><p className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-relaxed text-gray-500">{chapter.detail}</p><button type="button" className="mt-3 inline-flex min-h-[40px] items-center gap-1 text-xs font-bold text-neon-cyan-200 hover:text-white">Explore this chapter <ArrowRight size={14} /></button></div>}
          </article>;
        })}
      </div>
    </section>
  );
}
