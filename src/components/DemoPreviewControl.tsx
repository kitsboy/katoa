import { useEffect, useState } from 'react';
import { Check, RotateCcw, Settings2, SlidersHorizontal } from 'lucide-react';
import { Button } from './Button';
import { Link } from './Link';
import { Modal } from './Modal';
import {
  DEMO_PREVIEW_EVENT,
  DEMO_SCENARIOS,
  getDemoDetailLevel,
  getDemoScenario,
  resetDemoPreview,
  setDemoDetailLevel,
  setDemoScenario,
  type DemoDetailLevel,
  type DemoScenarioId,
} from '../lib/demoPreview';

export function DemoPreviewControl() {
  const [open, setOpen] = useState(false);
  const [scenario, setScenario] = useState<DemoScenarioId>(() => getDemoScenario());
  const [detail, setDetail] = useState<DemoDetailLevel>(() => getDemoDetailLevel());

  useEffect(() => {
    const sync = () => {
      setScenario(getDemoScenario());
      setDetail(getDemoDetailLevel());
    };
    window.addEventListener(DEMO_PREVIEW_EVENT, sync);
    return () => window.removeEventListener(DEMO_PREVIEW_EVENT, sync);
  }, []);

  const selected = DEMO_SCENARIOS.find((item) => item.id === scenario) ?? DEMO_SCENARIOS[0];

  function chooseScenario(id: DemoScenarioId) {
    setScenario(id);
    setDemoScenario(id);
  }

  function chooseDetail(level: DemoDetailLevel) {
    setDetail(level);
    setDemoDetailLevel(level);
  }

  function resetPreview() {
    resetDemoPreview();
    setScenario('community');
    setDetail('rich');
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-bitcoin-orange-300/25 bg-black/20 px-2.5 py-1.5 text-xs font-semibold text-bitcoin-orange-100 hover:bg-black/35 hover:text-white touch-manipulation"
        aria-label="Open demo controls"
      >
        <Settings2 size={14} aria-hidden />
        Demo controls
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Demo controls" size="md">
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-white">Choose a sample story</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-400">This changes the story shortcut only. Everything stays on this device.</p>
              </div>
              <SlidersHorizontal size={18} className="text-neon-cyan-300" aria-hidden />
            </div>
            <div className="mt-3 space-y-2" role="radiogroup" aria-label="Demo scenario">
              {DEMO_SCENARIOS.map((item) => {
                const active = item.id === scenario;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => chooseScenario(item.id)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      active
                        ? 'border-neon-cyan-400/50 bg-neon-cyan-400/10'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-white">{item.label}</span>
                      {active && <Check size={16} className="text-neon-cyan-300" aria-hidden />}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-gray-400">{item.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/10 pt-5">
            <p className="text-sm font-bold text-white">Presentation detail</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-400">Use rich mode for a full walkthrough or quick mode for a faster skim.</p>
            <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Demo detail level">
              {([
                ['rich', 'Rich walkthrough'],
                ['quick', 'Quick skim'],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={detail === id}
                  onClick={() => chooseDetail(id)}
                  className={`min-h-[44px] rounded-xl border px-3 text-sm font-semibold transition-colors ${
                    detail === id
                      ? 'border-bitcoin-orange-400/50 bg-bitcoin-orange-400/10 text-bitcoin-orange-100'
                      : 'border-white/10 bg-white/[0.03] text-gray-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Current preview</p>
            <p className="mt-1 text-sm font-bold text-white">{selected.shortLabel}</p>
            <p className="mt-1 text-xs text-gray-400">{detail === 'rich' ? 'Rich walkthrough enabled' : 'Quick skim enabled'}</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={selected.href} onClick={() => setOpen(false)} className="flex-1">
              <Button className="w-full min-h-[44px]">Open selected story</Button>
            </Link>
            <Button variant="outline" onClick={resetPreview} className="min-h-[44px]" title="Reset local demo data">
              <RotateCcw size={16} className="mr-2" aria-hidden />
              Reset demo
            </Button>
          </div>
          <p className="text-center text-[11px] leading-relaxed text-gray-500">Reset clears only local preview data. It never deletes a live account.</p>
        </div>
      </Modal>
    </>
  );
}
