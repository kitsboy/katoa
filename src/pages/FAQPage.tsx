import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Link } from '../components/Link';
import { PageMeta } from '../components/PageMeta';
import { PageHero } from '../components/PageHero';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { breadcrumbList, toJsonLdScript } from '../lib/jsonLd';

interface FAQItem {
  categoryKey: string;
  qKey?: string;
  aKey?: string;
  question?: string;
  answer?: string;
  link?: string;
}

const faqs: FAQItem[] = [
  { categoryKey: 'faq.cat.gettingStarted', qKey: 'faq.q.whatIs', aKey: 'faq.a.whatIs', link: '/about' },
  { categoryKey: 'faq.cat.gettingStarted', qKey: 'faq.q.createAccount', aKey: 'faq.a.createAccount', link: '/auth' },
  { categoryKey: 'faq.cat.payments', qKey: 'faq.q.lightning', aKey: 'faq.a.lightning', link: '/pricing' },
  { categoryKey: 'faq.cat.payments', qKey: 'faq.q.zeroFees', aKey: 'faq.a.zeroFees', link: '/pricing' },
  { categoryKey: 'faq.cat.payments', qKey: 'faq.q.bolt12', aKey: 'faq.a.bolt12' },
  { categoryKey: 'faq.cat.privacy', qKey: 'faq.q.privacy', aKey: 'faq.a.privacy', link: '/privacy' },
  { categoryKey: 'faq.cat.privacy', qKey: 'faq.q.nostr', aKey: 'faq.a.nostr', link: '/about' },
  { categoryKey: 'faq.cat.privacy', qKey: 'faq.q.kyc', aKey: 'faq.a.kyc' },
  { categoryKey: 'faq.cat.features', qKey: 'faq.q.wishlists', aKey: 'faq.a.wishlists', link: '/explore' },
  { categoryKey: 'faq.cat.features', qKey: 'faq.q.productLinks', aKey: 'faq.a.productLinks', link: '/dashboard' },
  { categoryKey: 'faq.cat.features', qKey: 'faq.q.anonymousGifts', aKey: 'faq.a.anonymousGifts' },
  { categoryKey: 'faq.cat.features', qKey: 'faq.q.p2p', aKey: 'faq.a.p2p' },
  { categoryKey: 'faq.cat.technical', qKey: 'faq.q.zkp', aKey: 'faq.a.zkp' },
  { categoryKey: 'faq.cat.technical', qKey: 'faq.q.lightningWallet', aKey: 'faq.a.lightningWallet' },
  { categoryKey: 'faq.cat.technical', qKey: 'faq.q.openSource', aKey: 'faq.a.openSource', link: 'https://github.com/kitsboy/katoa' },
  { categoryKey: 'faq.cat.security', qKey: 'faq.q.howSecure', aKey: 'faq.a.howSecure', link: '/security' },
  { categoryKey: 'faq.cat.security', qKey: 'faq.q.loseAccess', aKey: 'faq.a.loseAccess' },
  { categoryKey: 'faq.cat.trust', qKey: 'faq.q.whoHoldsSats', aKey: 'faq.a.whoHoldsSats', link: '/security' },
  { categoryKey: 'faq.cat.trust', qKey: 'faq.q.verifyFees', aKey: 'faq.a.verifyFees', link: '/comparison' },
  { categoryKey: 'faq.cat.trust', qKey: 'faq.q.exploreReal', aKey: 'faq.a.exploreReal', link: '/explore' },
  { categoryKey: 'faq.cat.trust', qKey: 'faq.q.roadmap', aKey: 'faq.a.roadmap', link: '/roadmap' },
];

const categories = Array.from(new Set(faqs.map((f) => f.categoryKey)));

function faqCopy(faq: FAQItem, t: (key: string) => string) {
  return {
    category: t(faq.categoryKey),
    question: faq.qKey ? t(faq.qKey) : faq.question ?? '',
    answer: faq.aKey ? t(faq.aKey) : faq.answer ?? '',
  };
}

export function FAQPage() {
  const { t } = useLanguage();
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  const resolvedFaqs = useMemo(() => faqs.map((faq) => ({ faq, ...faqCopy(faq, t) })), [t]);

  const filteredFAQs = useMemo(() => {
    let list = selectedCategory === 'all' ? resolvedFaqs : resolvedFaqs.filter((f) => f.faq.categoryKey === selectedCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
    }
    return list;
  }, [selectedCategory, search, resolvedFaqs]);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: resolvedFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  const crumbs = breadcrumbList([
    { name: t('breadcrumb.home'), item: '/' },
    { name: t('faq.title'), item: '/faq' },
  ]);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 pb-20 md:pb-16">
      <PageMeta title={t('faq.metaTitle')} description={t('faq.metaDesc')} path="/faq" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLdScript(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLdScript(crumbs) }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs items={[{ label: t('faq.title') }]} className="mb-6 text-left" />
        <PageHero title={t('faq.title')} subtitle={t('faq.subtitle')} />

        <div className="mb-6">
          <Input
            icon={<Search size={18} />}
            placeholder={t('faq.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t('faq.search')}
          />
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {['all', ...categories].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              aria-pressed={selectedCategory === cat}
              className={`shrink-0 snap-start px-4 py-2.5 min-h-[44px] rounded-full text-sm font-medium transition-colors touch-manipulation ${
                selectedCategory === cat ? 'bg-bitcoin-orange-500 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {cat === 'all' ? t('faq.all') : t(cat)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpenIndices(new Set(filteredFAQs.map((_, i) => i)))}
          >
            {t('faq.expandAll')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpenIndices(new Set())}
          >
            {t('faq.collapseAll')}
          </Button>
        </div>

        <div className="space-y-3">
          {filteredFAQs.map((item, index) => {
            const isOpen = openIndices.has(index);
            const panelId = `faq-panel-${index}`;
            const triggerId = `faq-trigger-${index}`;
            const isExternalLink = item.faq.link?.startsWith('http');
            return (
              <div key={`${item.question}-${index}`} className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
                <button
                  id={triggerId}
                  type="button"
                  onClick={() => {
                    setOpenIndices((prev) => {
                      const next = new Set(prev);
                      if (next.has(index)) next.delete(index);
                      else next.add(index);
                      return next;
                    });
                  }}
                  className="w-full px-4 sm:px-6 py-4 flex items-center justify-between text-left hover:bg-white/[0.04] transition-colors min-h-[56px] touch-manipulation"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <div className="pr-4">
                    <div className="text-xs text-bitcoin-orange-400 mb-1 font-medium">{item.category}</div>
                    <h3 className="text-base sm:text-lg font-semibold text-white">{item.question}</h3>
                  </div>
                  {isOpen ? <ChevronUp className="text-gray-400 shrink-0" size={20} /> : <ChevronDown className="text-gray-400 shrink-0" size={20} />}
                </button>
                {isOpen && (
                  <div id={panelId} role="region" aria-labelledby={triggerId} className="px-4 sm:px-6 py-4 border-t border-white/10 bg-charcoal-900/50">
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{item.answer}</p>
                    {item.faq.link && (
                      isExternalLink ? (
                        <a href={item.faq.link} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-sm text-neon-cyan-400 hover:underline">
                          {t('faq.learnMore')}
                        </a>
                      ) : (
                        <Link href={item.faq.link} className="inline-block mt-3 text-sm text-neon-cyan-400 hover:underline">
                          {t('faq.learnMore')}
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredFAQs.length === 0 && (
          <p className="text-center text-gray-400 py-12">{t('faq.noResults')}</p>
        )}

        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-bitcoin-orange-500/10 border border-bitcoin-orange-500/30 text-center">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-3">{t('faq.stillHaveQuestions')}</h2>
          <p className="text-gray-300 mb-6 text-sm sm:text-base">{t('faq.reachOut')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact"><Button variant="bitcoin">{t('faq.contactUs')}</Button></Link>
            <a href="https://github.com/kitsboy/katoa" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full sm:w-auto">{t('faq.github')}</Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}