import { Link } from '../components/Link';
import { PageMeta } from '../components/PageMeta';
import { PageHero } from '../components/PageHero';
import { TrustProofStrip } from '../components/TrustProofStrip';
import { useLanguage } from '../contexts/LanguageContext';
import { Shield, KeyRound, Wallet, EyeOff, Server, FileCheck } from 'lucide-react';

const SECTIONS = [
  { icon: Wallet, titleKey: 'security.nonCustodial.title', bodyKey: 'security.nonCustodial.body' },
  { icon: KeyRound, titleKey: 'security.keys.title', bodyKey: 'security.keys.body' },
  { icon: EyeOff, titleKey: 'security.minimalData.title', bodyKey: 'security.minimalData.body' },
  { icon: Server, titleKey: 'security.host.title', bodyKey: 'security.host.body' },
  { icon: FileCheck, titleKey: 'security.openSource.title', bodyKey: 'security.openSource.body' },
  { icon: Shield, titleKey: 'security.safeHarbour.title', bodyKey: 'security.safeHarbour.body' },
] as const;

export function SecurityPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 pb-24">
      <PageMeta
        title={t('security.title')}
        description={t('security.metaDesc')}
        path="/security"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <PageHero title={t('security.title')} subtitle={t('security.metaDesc')} />
        <TrustProofStrip className="mb-10" />

        <div className="space-y-4">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <article
                key={s.titleKey}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-neon-cyan-500/10 border border-neon-cyan-500/20 flex items-center justify-center">
                    <Icon size={20} className="text-neon-cyan-400" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-display font-bold text-white mb-1.5">{t(s.titleKey)}</h2>
                    <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{t(s.bodyKey)}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link
            href="/privacy"
            className="flex-1 text-center min-h-[48px] inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white font-semibold hover:border-neon-cyan-500/40 transition-colors"
          >
            {t('security.privacyPolicy')}
          </Link>
          <a
            href="https://github.com/kitsboy/katoa"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center min-h-[48px] inline-flex items-center justify-center rounded-xl bg-neon-cyan-500 text-charcoal-950 font-bold hover:bg-neon-cyan-400 transition-colors"
          >
            {t('security.viewSource')}
          </a>
        </div>
      </div>
    </div>
  );
}
