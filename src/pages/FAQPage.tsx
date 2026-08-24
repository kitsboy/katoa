import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Link } from '../components/Link';
import { PageMeta } from '../components/PageMeta';
import { PageHero } from '../components/PageHero';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { toJsonLdScript } from '../lib/jsonLd';

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
  { categoryKey: 'faq.cat.features', question: 'How do wishlists work?', answer: 'Add items, set sat prices, share your link. Supporters fund items via Lightning — or buy the product from Amazon/other shops when you attach a product URL.', link: '/explore' },
  { categoryKey: 'faq.cat.features', question: 'Can I add Amazon or clothing product links?', answer: 'Yes. On your project, open a wishlist and tap “Add product from link”. Paste any product URL (Amazon, Nike, Etsy, Shopify stores, etc.). KATOA reads the title/image when possible; supporters get a Buy button to purchase and ship to you, plus Fund with sats.', link: '/dashboard' },
  { categoryKey: 'faq.cat.features', question: 'Can I receive gifts anonymously?', answer: 'Yes. Lightning payments can be pseudonymous. Public wishlists show only what you choose to share.' },
  { categoryKey: 'faq.cat.features', question: 'What is peer-to-peer commerce?', answer: 'Money flows directly from supporter to creator wallet — KATOA never custodies funds.' },
  { categoryKey: 'faq.cat.technical', question: 'What are zero-knowledge proofs?', answer: 'Cryptographic proofs that verify facts without revealing underlying data — part of our privacy roadmap.' },
  { categoryKey: 'faq.cat.technical', question: 'How do I set up a Lightning wallet?', answer: 'Use Phoenix, Wallet of Satoshi, Muun, or self-hosted LND/CLN. Add your Lightning address in Settings.' },
  { categoryKey: 'faq.cat.technical', question: 'Is KATOA open source?', answer: 'Yes — MIT licensed. Audit, fork, or self-host the frontend.', link: 'https://github.com/kitsboy/katoa' },
  { categoryKey: 'faq.cat.security', question: 'How secure is KATOA?', answer: 'We never hold your keys or funds. Industry-standard encryption for account data. Read the full model on the Security page.', link: '/security' },
  { categoryKey: 'faq.cat.security', question: 'What if I lose access?', answer: 'Email accounts can use password recovery. If you linked Nostr in Settings, your extension keys still control Nostr identity — app login uses email/Google until secure Nostr auth ships.' },
  { categoryKey: 'faq.cat.trust', question: 'Who holds the sats during a gift?', answer: 'Nobody intermediate. You pay the creator’s Lightning address or on-chain wallet. KATOA does not operate a hot wallet for user funds.', link: '/security' },
  { categoryKey: 'faq.cat.trust', question: 'How do I verify 0% fees?', answer: 'There is no platform take rate in product design. Compare legacy fee math on Why KATOA, audit the open-source frontend, and watch sats land in the creator wallet you control.', link: '/comparison' },
  { categoryKey: 'faq.cat.trust', question: 'Are explore projects real?', answer: 'Some catalog entries are labeled Demo for product preview. Live creator accounts use real payment destinations once wallets are configured. Demo badges appear on sample content.', link: '/explore' },
  { categoryKey: 'faq.cat.trust', question: 'What is on the public roadmap?', answer: 'Shipped work and next priorities are listed on the in-app roadmap and in docs/ROADMAP.md on GitHub.', link: '/roadmap' },
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

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 pb-20 md:pb-16">
      <PageMeta title={t('faq.metaTitle')} description={t('faq.metaDesc')} path="/faq" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLdScript(faqSchema) }} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
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
      </main>
    </div>
  );
}