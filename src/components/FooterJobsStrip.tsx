import { Briefcase, Send } from 'lucide-react';
import { footerJobs, buildJobMailto } from '../data/footerJobs';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Compact one-row job strip for the footer. Replaces the full job-board grid
 * so the footer stays professional and short; full role details live in the
 * mailto subject (role slug) and can move to a /careers page later.
 */
export function FooterJobsStrip() {
  const { t } = useLanguage();

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5" aria-label={t('footer.openRoles')}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          <Briefcase size={13} className="text-bitcoin-orange-500" aria-hidden />
          {t('footer.openRoles')}
        </span>
        <span className="text-xs text-gray-500 truncate">{t('footer.jobsTagline')}</span>
        <span className="ml-auto hidden md:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
          {footerJobs.length} {t('footer.openRolesCount')}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5" role="list">
        {footerJobs.map((job) => (
          <a
            key={job.id}
            href={buildJobMailto(job)}
            role="listitem"
            className="group inline-flex min-h-[34px] items-center gap-1.5 rounded-full border border-white/10 bg-charcoal-900 px-3 text-xs text-gray-300 transition-all hover:border-bitcoin-orange-500/40 hover:bg-bitcoin-orange-500/10 hover:text-white touch-manipulation"
            title={`${job.type} · ${job.location}`}
            aria-label={`${job.title} — ${t('footer.apply')}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" aria-hidden />
            <span className="max-w-[16rem] truncate">{job.title}</span>
            <Send
              size={11}
              className="opacity-0 group-hover:opacity-100 text-bitcoin-orange-400 transition-opacity shrink-0"
              aria-hidden
            />
          </a>
        ))}
      </div>

      <p className="mt-3 text-[11px] text-gray-500">
        {t('footer.applyEmailPrefix')}{' '}
        <a href="mailto:hello@giveabit.io" className="text-neon-cyan-500 hover:underline">
          hello@giveabit.io
        </a>
      </p>
    </section>
  );
}
