import { Briefcase, MapPin, Send, Sparkles } from 'lucide-react';
import { footerJobs, buildJobMailto } from '../data/footerJobs';
import { Button } from './Button';

export function FooterJobBoard() {
  return (
    <section className="relative">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-bitcoin-orange-500/15 border border-bitcoin-orange-500/30">
          <Briefcase size={22} className="text-bitcoin-orange-500" />
        </div>
        <div>
          <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
            Open Roles
            <Sparkles size={16} className="text-neon-cyan-500" />
          </h3>
          <p className="text-xs text-gray-500">Build sovereign gifting infrastructure · Paid in sats or fiat</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {footerJobs.map((job) => (
          <article
            key={job.id}
            className="group relative p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-neon-cyan/30 hover:bg-white/[0.05] transition-all duration-300 hover:shadow-[0_0_30px_rgba(20,230,255,0.08)]"
          >
            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-bitcoin-orange-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="text-sm font-bold text-white leading-snug group-hover:text-neon-cyan-400 transition-colors">
                {job.title}
              </h4>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                Hiring
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-3">{job.summary}</p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-charcoal-900 border border-white/10 text-gray-400 font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
              <div className="text-[10px] text-gray-500">
                <span className="block font-medium text-gray-400">{job.type}</span>
                <span className="flex items-center gap-1 mt-0.5">
                  <MapPin size={10} className="text-bitcoin-orange-500" />
                  {job.location}
                </span>
              </div>
              <a href={buildJobMailto(job)} className="shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs px-3 py-1.5 min-h-0 h-auto border-neon-cyan-500/40 hover:bg-neon-cyan-500/10"
                >
                  <Send size={12} className="mr-1.5" />
                  Apply
                </Button>
              </a>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-gray-500">
        All applications email{' '}
        <a href="mailto:hello@giveabit.io" className="text-neon-cyan-500 hover:underline">
          hello@giveabit.io
        </a>{' '}
        with subject line{' '}
        <code className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 font-mono">
          Katoa job-[role]
        </code>
      </p>
    </section>
  );
}