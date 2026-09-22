import { useEffect, useMemo, useState } from 'react';
import { ArrowUp, Eye, History, LayoutGrid, List, PanelRight, RotateCcw, Save, X } from 'lucide-react';
import { Button } from './Button';
import { DemoPreviewBadge } from './DemoPreviewBadge';
import { loadStudioDraft, loadStudioVersions, saveStudioDraft, saveStudioVersion, type StudioDraft } from '../lib/contentStudio';

export interface StudioCardItem {
  id: string;
  title: string;
  description: string;
  visibility: string;
}

export interface StudioProjectValue {
  title: string;
  description: string;
  visibility: string;
}

interface ContentStudioProps {
  projectId: string;
  project: StudioProjectValue;
  cards: StudioCardItem[];
  isDemo: boolean;
  onProjectChange: (next: StudioProjectValue) => void;
  onCardChange: (id: string, next: Pick<StudioCardItem, 'title' | 'description' | 'visibility'>) => void;
  onMoveCard: (id: string, direction: 'up') => void;
  onSave: () => void;
  onPreview: () => void;
  onClose: () => void;
}

type StudioTab = 'project' | 'cards';
type DraftValue = { project: StudioProjectValue; cards: StudioCardItem[] };

function formatSavedAt(value: string | undefined): string {
  if (!value) return 'No saved draft';
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ContentStudio({
  projectId,
  project,
  cards,
  isDemo,
  onProjectChange,
  onCardChange,
  onMoveCard,
  onSave,
  onPreview,
  onClose,
}: ContentStudioProps) {
  const [tab, setTab] = useState<StudioTab>('project');
  const [layout, setLayout] = useState<'expanded' | 'compact'>('expanded');
  const [draft, setDraft] = useState<StudioDraft<DraftValue> | null>(() => loadStudioDraft<DraftValue>(projectId));
  const versions = loadStudioVersions<DraftValue>(projectId);
  const current = useMemo<DraftValue>(() => ({ project, cards }), [project, cards]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDraft(saveStudioDraft(projectId, current));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [projectId, current]);

  function restore(value: DraftValue) {
    onProjectChange(value.project);
    value.cards.forEach((card) => onCardChange(card.id, {
      title: card.title,
      description: card.description,
      visibility: card.visibility,
    }));
    setDraft(saveStudioDraft(projectId, value));
  }

  function save() {
    const version = saveStudioVersion(projectId, current);
    setDraft(version);
    onSave();
  }

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-labelledby="content-studio-title">
      <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-label="Close content studio" />
      <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-charcoal-950 shadow-2xl animate-slide-in-right">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-charcoal-950/95 px-4 py-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-cyan-400/10 text-neon-cyan-300"><PanelRight size={19} aria-hidden /></span>
            <div>
              <div className="flex items-center gap-2"><h2 id="content-studio-title" className="text-lg font-black text-white">Content Studio</h2>{isDemo && <DemoPreviewBadge compact />}</div>
              <p className="text-xs text-gray-500">{draft ? `Autosaved ${formatSavedAt(draft.savedAt)}` : 'Edit without losing your story'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-gray-400 hover:bg-white/10 hover:text-white" aria-label="Close content studio"><X size={21} /></button>
        </div>

        <div className="space-y-5 p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1" role="tablist" aria-label="Content studio sections">
            {(['project', 'cards'] as const).map((item) => (
              <button key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => setTab(item)} className={`min-h-[44px] rounded-lg text-sm font-bold capitalize ${tab === item ? 'bg-white text-charcoal-950' : 'text-gray-400 hover:text-white'}`}>{item === 'project' ? 'Project story' : `Content cards (${cards.length})`}</button>
            ))}
          </div>

          {tab === 'project' ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-bitcoin-orange-300">Hero story</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">Keep the first screen focused: who you are, what you need, and why it matters.</p>
              </div>
              <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Title</span><input value={project.title} onChange={(e) => onProjectChange({ ...project, title: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-neon-cyan-400/50" /></label>
              <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Story summary</span><textarea value={project.description} onChange={(e) => onProjectChange({ ...project, description: e.target.value })} rows={5} className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-neon-cyan-400/50" /></label>
              <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Visibility</span><select value={project.visibility} onChange={(e) => onProjectChange({ ...project, visibility: e.target.value })} className="w-full rounded-xl border border-white/10 bg-charcoal-900 px-4 py-3 text-white outline-none focus:border-neon-cyan-400/50"><option value="draft">Draft</option><option value="private">Private</option><option value="public">Public</option></select></label>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold text-white">Card order and detail</p><p className="text-xs text-gray-500">Move important content higher without deleting anything.</p></div><div className="flex gap-1 rounded-lg border border-white/10 p-1"><button type="button" onClick={() => setLayout('expanded')} aria-pressed={layout === 'expanded'} className={`min-h-[36px] min-w-[36px] rounded-md ${layout === 'expanded' ? 'bg-white text-charcoal-950' : 'text-gray-400'}`}><LayoutGrid size={16} className="mx-auto" /><span className="sr-only">Expanded cards</span></button><button type="button" onClick={() => setLayout('compact')} aria-pressed={layout === 'compact'} className={`min-h-[36px] min-w-[36px] rounded-md ${layout === 'compact' ? 'bg-white text-charcoal-950' : 'text-gray-400'}`}><List size={16} className="mx-auto" /><span className="sr-only">Compact cards</span></button></div></div>
              {cards.map((card, index) => (
                <div key={card.id} className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 ${layout === 'compact' ? 'sm:flex sm:items-center sm:gap-3' : ''}`}>
                  <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Card {index + 1}</p><p className="mt-1 font-bold text-white">{card.title || 'Untitled card'}</p></div>{index > 0 && <button type="button" onClick={() => onMoveCard(card.id, 'up')} className="flex min-h-[36px] items-center gap-1 rounded-lg border border-white/10 px-2 text-xs text-gray-400 hover:text-white" title="Move card up"><ArrowUp size={14} /> Up</button>}</div>
                  {layout === 'expanded' && <div className="mt-3 space-y-2"><input value={card.title} onChange={(e) => onCardChange(card.id, { title: e.target.value, description: card.description, visibility: card.visibility })} className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-neon-cyan-400/50" placeholder="Card title" /><textarea value={card.description} onChange={(e) => onCardChange(card.id, { title: card.title, description: e.target.value, visibility: card.visibility })} rows={2} className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-neon-cyan-400/50" placeholder="What does this card unlock?" /></div>}
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-white/10 pt-5">
            <div className="flex flex-col gap-2 sm:flex-row"><Button onClick={save} variant="bitcoin" className="flex-1 min-h-[48px]"><Save size={17} className="mr-2" /> Save changes</Button><Button onClick={onPreview} variant="outline" className="min-h-[48px]"><Eye size={17} className="mr-2" /> Preview</Button></div>
            {versions.length > 0 && <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400"><History size={14} /> Recent versions</div><div className="mt-2 space-y-1">{versions.slice(0, 3).map((version) => <button key={version.savedAt} type="button" onClick={() => restore(version.value)} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs text-gray-500 hover:bg-white/5 hover:text-white"><span>{new Date(version.savedAt).toLocaleString()}</span><RotateCcw size={13} /></button>)}</div></div>}
            <p className="mt-3 text-center text-[11px] text-gray-600">{isDemo ? 'Demo edits stay on this device.' : 'Draft autosave is local until you save to your account.'}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
