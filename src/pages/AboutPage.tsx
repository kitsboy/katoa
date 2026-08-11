import { useState } from 'react';
import { Shield, Zap, Globe, Users, Heart, TrendingUp, Lock, DollarSign, X, ChevronDown } from 'lucide-react';
import { Card } from '../components/Card';
import { Link } from '../components/Link';
import { Button } from '../components/Button';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '../contexts/LanguageContext';
import { TrustProofStrip } from '../components/TrustProofStrip';
import { FamilyLinks } from '../components/FamilyLinks';

const PROBLEM_PLATFORMS = [
  { id: 'onlyfans', fee: '20%', name: 'OnlyFans', cardClass: 'bg-red-900/20 border-red-500/30', feeClass: 'text-red-400', reqClass: 'text-red-300', borderClass: 'border-red-500/20', bodyKey: 'about.problem.onlyfans.body', requiresKey: 'about.problem.onlyfans.requires' },
  { id: 'throne', fee: '10%', name: 'Throne', cardClass: 'bg-orange-900/20 border-orange-500/30', feeClass: 'text-orange-400', reqClass: 'text-orange-300', borderClass: 'border-orange-500/20', bodyKey: 'about.problem.throne.body', requiresKey: 'about.problem.throne.requires' },
  { id: 'linktree', fee: '9%', name: 'Linktree', cardClass: 'bg-yellow-900/20 border-yellow-500/30', feeClass: 'text-yellow-400', reqClass: 'text-yellow-300', borderClass: 'border-yellow-500/20', bodyKey: 'about.problem.linktree.body', requiresKey: 'about.problem.linktree.requires' },
  { id: 'kickstarter', fee: '8-10%', name: 'Kickstarter', cardClass: 'bg-blue-900/20 border-blue-500/30', feeClass: 'text-blue-400', reqClass: 'text-blue-300', borderClass: 'border-blue-500/20', bodyKey: 'about.problem.kickstarter.body', requiresKey: 'about.problem.kickstarter.requires' },
  { id: 'indiegogo', fee: '8-15%', name: 'Indiegogo', cardClass: 'bg-cyan-900/20 border-cyan-500/30', feeClass: 'text-cyan-400', reqClass: 'text-cyan-300', borderClass: 'border-cyan-500/20', bodyKey: 'about.problem.indiegogo.body', requiresKey: 'about.problem.indiegogo.requires' },
];

const COMPETITOR_CARDS = [
  { id: 'onlyfans', emoji: '💰', cardClass: 'from-red-900/20', borderClass: 'border-red-500/30', xClass: 'text-red-400', titleKey: 'about.competitors.onlyfans.title', bodyKey: 'about.competitors.onlyfans.body', cons: ['about.competitors.con.bankKyc', 'about.competitors.con.payout7', 'about.competitors.con.censorship', 'about.competitors.con.countries'] },
  { id: 'kickstarter', emoji: '🚀', cardClass: 'from-blue-900/20', borderClass: 'border-blue-500/30', xClass: 'text-blue-400', titleKey: 'about.competitors.kickstarter.title', bodyKey: 'about.competitors.kickstarter.body', cons: ['about.competitors.con.bankKyc', 'about.competitors.con.payout14', 'about.competitors.con.fulfillment', 'about.competitors.con.oneTime'] },
  { id: 'indiegogo', emoji: '🎯', cardClass: 'from-cyan-900/20', borderClass: 'border-cyan-500/30', xClass: 'text-cyan-400', titleKey: 'about.competitors.indiegogo.title', bodyKey: 'about.competitors.indiegogo.body', cons: ['about.competitors.con.bankKyc', 'about.competitors.con.payout14', 'about.competitors.con.holdback', 'about.competitors.con.fulfillmentReq'] },
  { id: 'linktree', emoji: '🔗', cardClass: 'from-yellow-900/20', borderClass: 'border-yellow-500/30', xClass: 'text-yellow-400', titleKey: 'about.competitors.linktree.title', bodyKey: 'about.competitors.linktree.body', cons: ['about.competitors.con.processor', 'about.competitors.con.geoRestrict', 'about.competitors.con.feesOrSub', 'about.competitors.con.countries50'] },
  { id: 'throne', emoji: '🎁', cardClass: 'from-orange-900/20', borderClass: 'border-orange-500/30', xClass: 'text-orange-400', titleKey: 'about.competitors.throne.title', bodyKey: 'about.competitors.throne.body', cons: ['about.competitors.con.bankKyc', 'about.competitors.con.withdraw7', 'about.competitors.con.countries10', 'about.competitors.con.conversion'] },
];

export function AboutPage() {
  const { t } = useLanguage();
  const [openProblem, setOpenProblem] = useState<string | null>(null);

  const values = [
    { icon: Heart, titleKey: 'about.values.creators.title', descKey: 'about.values.creators.desc', color: 'from-pink-500 to-rose-600' },
    { icon: Shield, titleKey: 'about.values.privacy.title', descKey: 'about.values.privacy.desc', color: 'from-purple-500 to-indigo-600' },
    { icon: Globe, titleKey: 'about.values.global.title', descKey: 'about.values.global.desc', color: 'from-cyan-500 to-blue-600' },
    { icon: Lock, titleKey: 'about.values.censorship.title', descKey: 'about.values.censorship.desc', color: 'from-emerald-500 to-green-600' },
  ];

  const audiences = [
    { emoji: '🌍', titleKey: 'about.audience.unbanked.title', bodyKey: 'about.audience.unbanked.body', statKey: 'about.audience.unbanked.stat', statClass: 'text-emerald-400' },
    { emoji: '🔒', titleKey: 'about.audience.privacy.title', bodyKey: 'about.audience.privacy.body', statKey: 'about.audience.privacy.stat', statClass: 'text-purple-400' },
    { emoji: '💰', titleKey: 'about.audience.ambitious.title', bodyKey: 'about.audience.ambitious.body', statKey: 'about.audience.ambitious.stat', statClass: 'text-orange-400' },
  ];

  const promises = ['about.team.promise1', 'about.team.promise2', 'about.team.promise3', 'about.team.promise4'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 text-white pt-16">
      <PageMeta
        title={t('about.title')}
        description="Learn about KATOA's mission — zero-fee, privacy-first Bitcoin commerce built by creators for creators."
        path="/about"
      />

      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
            {t('about.hero.line1')}
            <br />
            <span className="text-gradient-emerald">{t('about.hero.highlight')}</span>
          </h1>

          <p className="text-2xl text-gray-300 mb-8 leading-relaxed">{t('about.hero.subtitle')}</p>

          <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-300 font-semibold">{t('about.hero.badge')}</span>
          </div>
          <TrustProofStrip />
        </div>
      </section>

      <section className="py-20 px-6 bg-charcoal-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('about.problem.title')}</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">{t('about.problem.subtitle')}</p>
          </div>

          <div className="md:hidden space-y-2 mb-6">
            {PROBLEM_PLATFORMS.map((p) => (
              <Card key={p.id} className={`overflow-hidden ${p.cardClass}`}>
                <button
                  type="button"
                  onClick={() => setOpenProblem(openProblem === p.id ? null : p.id)}
                  className="w-full p-4 flex items-center justify-between text-left min-h-[48px] touch-manipulation"
                  aria-expanded={openProblem === p.id}
                >
                  <span className="font-bold text-white">{p.name} — <span className={p.feeClass}>{p.fee}</span></span>
                  <ChevronDown size={20} className={`text-gray-400 transition-transform ${openProblem === p.id ? 'rotate-180' : ''}`} />
                </button>
                {openProblem === p.id && (
                  <div className="px-4 pb-4 border-t border-white/10 pt-3">
                    <p className="text-gray-300 text-sm leading-relaxed mb-3">{t(p.bodyKey)}</p>
                    <p className="text-xs text-gray-400"><span className={`${p.reqClass} font-semibold`}>{t('about.problem.requires')}</span> {t(p.requiresKey)}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROBLEM_PLATFORMS.map((p) => (
              <Card key={p.id} className={`p-8 ${p.cardClass}`}>
                <div className={`text-6xl font-black ${p.feeClass} mb-4`}>{p.fee}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{p.name}</h3>
                <p className="text-gray-300 leading-relaxed mb-3">{t(p.bodyKey)}</p>
                <div className={`text-sm text-gray-400 border-t ${p.borderClass} pt-3 mt-3`}>
                  <span className={`${p.reqClass} font-semibold`}>{t('about.problem.requires')}</span> {t(p.requiresKey)}
                </div>
              </Card>
            ))}

            <Card className="p-8 bg-emerald-900/30 border-emerald-500/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-bl-lg">YOU</div>
              <div className="text-6xl font-black text-emerald-400 mb-4">0%</div>
              <h3 className="text-2xl font-bold text-white mb-3">KATOA</h3>
              <p className="text-gray-300 leading-relaxed mb-3">{t('about.problem.katoa.body')}</p>
              <div className="text-sm text-emerald-300 border-t border-emerald-500/20 pt-3 mt-3 font-semibold">{t('about.problem.katoa.requires')}</div>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Card className="inline-block p-8 bg-charcoal-900 border-2 border-red-500/30">
              <div className="flex items-center gap-4 mb-6">
                <TrendingUp size={40} className="text-red-400" />
                <div className="text-left">
                  <div className="text-gray-400 text-sm">{t('about.problem.avgLoss')}</div>
                  <div className="text-4xl font-black text-red-400">{t('about.problem.avgLossAmount')}</div>
                </div>
              </div>
              <div className="text-gray-300 text-lg mb-4">
                <span className="text-white font-bold">{t('about.problem.allRequire')}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-left">
                {[t('about.problem.bankAccount'), t('about.problem.kyc'), t('about.problem.processors'), t('about.problem.geoLimits')].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-gray-400">
                    <X size={20} className="text-red-400" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="text-emerald-400 font-bold text-xl mb-2">{t('about.problem.katoaRequires')}</div>
                <div className="text-gray-400">{t('about.problem.katoaWallet')}</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('about.solution.title')}</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">{t('about.solution.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 animate-glow">
                <Zap size={32} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">{t('about.solution.lightning.title')}</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">{t('about.solution.lightning.body')}</p>
              <ul className="space-y-3">
                {['about.solution.lightning.item1', 'about.solution.lightning.item2', 'about.solution.lightning.item3', 'about.solution.lightning.item4'].map((key) => (
                  <li key={key} className="flex items-center gap-3 text-gray-400">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                    {t(key)}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 animate-glow">
                <Shield size={32} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">{t('about.solution.nostr.title')}</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">{t('about.solution.nostr.body')}</p>
              <ul className="space-y-3">
                {['about.solution.nostr.item1', 'about.solution.nostr.item2', 'about.solution.nostr.item3', 'about.solution.nostr.item4'].map((key) => (
                  <li key={key} className="flex items-center gap-3 text-gray-400">
                    <div className="w-2 h-2 bg-purple-400 rounded-full" />
                    {t(key)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Card className="p-12 bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 border-emerald-500/30 text-center">
            <DollarSign size={64} className="text-emerald-400 mx-auto mb-6" />
            <h3 className="text-4xl font-bold text-white mb-4">{t('about.solution.result.title')}</h3>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">{t('about.solution.result.body')}</p>
          </Card>
        </div>
      </section>

      <section className="py-20 px-6 bg-charcoal-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('about.values.title')}</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <Card key={value.titleKey} className="p-8 bg-white/[0.03] backdrop-blur-md border-white/10 hover:border-emerald-500/50 transition-all hover-lift text-center">
                <div className={`w-16 h-16 mx-auto bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mb-6 animate-glow`}>
                  <value.icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t(value.titleKey)}</h3>
                <p className="text-gray-400 leading-relaxed">{t(value.descKey)}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-b from-charcoal-900/50 to-charcoal-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('about.competitors.title')}</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">{t('about.competitors.subtitle')}</p>
          </div>

          <div className="space-y-8">
            {COMPETITOR_CARDS.map((card) => (
              <Card key={card.id} className={`p-8 bg-gradient-to-r ${card.cardClass} to-charcoal-950/60 ${card.borderClass}`}>
                <div className="flex items-start gap-6">
                  <div className="text-5xl">{card.emoji}</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3">{t(card.titleKey)}</h3>
                    <p className="text-gray-300 mb-4 leading-relaxed">{t(card.bodyKey)}</p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      {card.cons.map((conKey) => (
                        <div key={conKey} className="flex items-center gap-2 text-gray-400">
                          <X size={16} className={card.xClass} />
                          {t(conKey)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-12 p-12 bg-gradient-to-br from-emerald-900/30 to-cyan-900/30 border-emerald-500/50 text-center">
            <Shield size={64} className="text-emerald-400 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-white mb-4">{t('about.competitors.katoa.title')}</h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">{t('about.competitors.katoa.body')}</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {[
                { title: 'about.competitors.katoa.fee', desc: 'about.competitors.katoa.feeDesc' },
                { title: 'about.competitors.katoa.payout', desc: 'about.competitors.katoa.payoutDesc' },
                { title: 'about.competitors.katoa.bank', desc: 'about.competitors.katoa.bankDesc' },
                { title: 'about.competitors.katoa.global', desc: 'about.competitors.katoa.globalDesc' },
              ].map((item) => (
                <div key={item.title} className="p-4 bg-white/[0.03] backdrop-blur-md rounded-lg border border-emerald-500/30">
                  <div className="text-emerald-400 font-bold mb-2">{t(item.title)}</div>
                  <div className="text-sm text-gray-400">{t(item.desc)}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('about.audience.title')}</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">{t('about.audience.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {audiences.map((audience) => (
              <Card key={audience.titleKey} className="p-8 bg-white/[0.03] backdrop-blur-md border-white/10">
                <div className="text-5xl mb-6">{audience.emoji}</div>
                <h3 className="text-2xl font-bold text-white mb-4">{t(audience.titleKey)}</h3>
                <p className="text-gray-300 leading-relaxed mb-4">{t(audience.bodyKey)}</p>
                <div className={`${audience.statClass} font-semibold`}>{t(audience.statKey)}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-b from-charcoal-900/50 to-charcoal-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">{t('about.team.title')}</h2>

          <Card className="p-12 bg-white/[0.03] backdrop-blur-md border-white/10 mb-12">
            <Users size={64} className="text-emerald-400 mx-auto mb-6" />
            <p className="text-xl text-gray-300 leading-relaxed mb-6">{t('about.team.body1')}</p>
            <p className="text-lg text-gray-400 leading-relaxed">{t('about.team.body2')}</p>
          </Card>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">{t('about.team.promise')}</h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              {promises.map((promiseKey) => (
                <div key={promiseKey} className="flex items-start gap-3 p-4 bg-charcoal-900 rounded-lg border border-white/10">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield size={14} className="text-white" />
                  </div>
                  <span className="text-gray-300 text-lg">{t(promiseKey)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <FamilyLinks />
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">{t('about.cta.title')}</h2>

          <p className="text-2xl text-gray-300 mb-12 leading-relaxed">
            {t('about.cta.subtitle')}
            <br />
            <span className="text-emerald-400 font-bold">{t('about.cta.highlight')}</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="min-w-[240px] h-16 text-xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700">
                {t('about.cta.start')}
              </Button>
            </Link>
            <Link href="/comparison">
              <Button size="lg" variant="outline" className="min-w-[240px] h-16 text-xl font-bold border-2 border-white/20 hover:border-neon-cyan-500/50 hover:border-emerald-500">
                {t('about.cta.compare')}
              </Button>
            </Link>
          </div>

          <p className="text-gray-500 text-sm mt-8">{t('about.cta.footer')}</p>
        </div>
      </section>
    </div>
  );
}