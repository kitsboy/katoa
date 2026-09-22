import { useState } from 'react';
import { ArrowDown, ArrowUp, Eye, GripVertical, LayoutGrid, Monitor, Smartphone } from 'lucide-react';
import type { StudioCardItem } from './ContentStudio';

export function ContentCanvas({
  cards,
  onCardChange,
  onMoveCard,
}: {
  cards: StudioCardItem[];
  onCardChange: (id: string, next: Pick<StudioCardItem, 'title' | 'description' | 'visibility'>) => void;
  onMoveCard: (id: string, direction: 'up' | 'down') => void;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<'desktop' | 'phone'>('desktop');
  const [selectedId, setSelectedId] = useState(cards[0]?.id ?? null);
  const selected = cards.find((card) => card.id === selectedId) ?? cards[0];

  function dropOn(targetId: string) {
    if (!draggingId || draggingId === targetId) return;
    const from = cards.findIndex((card) => card.id === draggingId);
    const to = cards.findIndex((card) => card.id === targetId);
    if (from < 0 || to < 0) return;
    onMoveCard(draggingId, from < to ? 'down' : 'up');
    setDraggingId(null);
  }

  return (
    <div className="space-y-4" data-testid="content-canvas">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <div className="flex items-center gap-2"><LayoutGrid size={16} className="text-neon-cyan-300" /><div><p className="text-sm font-bold text-white">Visual card canvas</p><p className="text-[11px] text-gray-500">Drag cards to shape the story order.</p></div></div>
        <div className="flex gap-1 rounded-lg border border-white/10 p-1" aria-label="Preview size">
          <button type="button" onClick={() => setPreview('desktop')} aria-pressed={preview === 'desktop'} className={`flex min-h-[36px] items-center gap-1 rounded-md px-2 text-[11px] font-bold ${preview === 'desktop' ? 'bg-white text-charcoal-950' : 'text-gray-400'}`}><Monitor size={14} /> Desktop</button>
          <button type="button" onClick={() => setPreview('phone')} aria-pressed={preview === 'phone'} className={`flex min-h-[36px] items-center gap-1 rounded-md px-2 text-[11px] font-bold ${preview === 'phone' ? 'bg-white text-charcoal-950' : 'text-gray-400'}`}><Smartphone size={14} /> Phone</button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(230px,0.8fr)]">
        <div className="space-y-2" aria-label="Draggable content cards">
          {cards.map((card, index) => (
            <div key={card.id} draggable onDragStart={() => setDraggingId(card.id)} onDragEnd={() => setDraggingId(null)} onDragOver={(event) => event.preventDefault()} onDrop={() => dropOn(card.id)} className={`rounded-2xl border p-3 transition ${selectedId === card.id ? 'border-neon-cyan-500/40 bg-neon-cyan-500/[0.06]' : 'border-white/10 bg-white/[0.03]'} ${draggingId === card.id ? 'opacity-50' : ''}`}>
              <div className="flex items-start gap-2"><button type="button" className="mt-1 cursor-grab text-gray-500 hover:text-white" aria-label={`Drag ${card.title || 'card'}`}><GripVertical size={17} /></button><button type="button" onClick={() => setSelectedId(card.id)} className="min-w-0 flex-1 text-left"><p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Card {index + 1}</p><p className="mt-1 truncate text-sm font-bold text-white">{card.title || 'Untitled card'}</p><p className="mt-1 line-clamp-1 text-xs text-gray-500">{card.description || 'Add an impact description'}</p></button><div className="flex gap-1"><button type="button" onClick={() => onMoveCard(card.id, 'up')} disabled={index === 0} className="flex min-h-[32px] min-w-[32px] items-center justify-center rounded-lg border border-white/10 text-gray-500 hover:text-white disabled:opacity-25" aria-label="Move card up"><ArrowUp size={13} /></button><button type="button" onClick={() => onMoveCard(card.id, 'down')} disabled={index === cards.length - 1} className="flex min-h-[32px] min-w-[32px] items-center justify-center rounded-lg border border-white/10 text-gray-500 hover:text-white disabled:opacity-25" aria-label="Move card down"><ArrowDown size={13} /></button></div></div>
              {selectedId === card.id && <div className="mt-3 space-y-2 border-t border-white/10 pt-3"><label className="block"><span className="sr-only">Card title</span><input value={card.title} onChange={(event) => onCardChange(card.id, { title: event.target.value, description: card.description, visibility: card.visibility })} className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-neon-cyan-400/50" placeholder="Card title" /></label><label className="block"><span className="sr-only">Card impact description</span><textarea value={card.description} onChange={(event) => onCardChange(card.id, { title: card.title, description: event.target.value, visibility: card.visibility })} rows={2} className="w-full resize-y rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-neon-cyan-400/50" placeholder="What does this card unlock?" /></label></div>}
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0c0914] p-3" data-testid={`content-preview-${preview}`}>
          <div className="mb-3 flex items-center justify-between gap-2"><p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-gray-500"><Eye size={13} /> Live preview · {preview}</p><span className="text-[10px] text-gray-600">No publish yet</span></div>
          <div className={`mx-auto overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#24152f] to-[#0e0a18] transition-all ${preview === 'phone' ? 'max-w-[190px]' : 'max-w-full'}`}>
            <div className="h-20 bg-gradient-to-br from-bitcoin-orange-500/50 via-purple-500/30 to-neon-cyan-500/20" /><div className="-mt-5 px-3"><div className="h-10 w-10 rounded-xl border-2 border-[#0e0a18] bg-bitcoin-orange-500" /></div><div className="space-y-2 p-3 pt-2"><div className="h-3 w-2/3 rounded bg-white/20" /><div className="h-2 w-full rounded bg-white/10" /><div className="h-2 w-4/5 rounded bg-white/10" />{selected && <div className="mt-4 rounded-xl border border-neon-cyan-500/25 bg-neon-cyan-500/[0.08] p-3"><p className="text-xs font-bold text-white">{selected.title || 'Your next card'}</p><p className="mt-1 line-clamp-3 text-[10px] leading-relaxed text-gray-400">{selected.description || 'Your impact detail appears here.'}</p></div>}{cards.filter((card) => card.id !== selected?.id).slice(0, 2).map((card) => <div key={card.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3"><p className="truncate text-[10px] font-bold text-gray-300">{card.title || 'Untitled card'}</p></div>)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
