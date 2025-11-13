import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'What is KATOA?',
    answer: 'KATOA is a privacy-centric, zero-fee decentralized marketplace powered by Bitcoin Lightning Network and Nostr protocol. It enables peer-to-peer gifting, wishlists, and commerce while maintaining complete privacy as a foundational right.'
  },
  {
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer: 'You can create an account using email, Google authentication, or Nostr. Simply click "Get Started" and choose your preferred sign-up method. With Nostr, you maintain complete control of your identity.'
  },
  {
    category: 'Payments',
    question: 'What is the Lightning Network?',
    answer: 'The Lightning Network is a layer-2 payment protocol built on Bitcoin that enables instant, low-cost transactions. KATOA uses Lightning Network to provide zero-fee payments for all transactions.'
  },
  {
    category: 'Payments',
    question: 'Are there really zero fees?',
    answer: 'Yes! KATOA does not charge any platform fees. All Lightning Network transactions are processed directly peer-to-peer with minimal network fees (typically less than 1 satoshi).'
  },
  {
    category: 'Payments',
    question: 'What is BOLT 12?',
    answer: 'BOLT 12 is the latest Lightning Network specification that enables reusable payment requests, enhanced privacy, and improved user experience. KATOA supports BOLT 12 for cutting-edge payment functionality.'
  },
  {
    category: 'Privacy',
    question: 'How does KATOA protect my privacy?',
    answer: 'KATOA implements zero-knowledge proofs, encrypted communications via Nostr, and optional Pynym integration for enhanced privacy. We do not track user behavior, require KYC, or store unnecessary personal data.'
  },
  {
    category: 'Privacy',
    question: 'What is Nostr and why does it matter?',
    answer: 'Nostr is a censorship-resistant communication protocol that gives you complete control over your identity and data. KATOA uses Nostr to enable decentralized, private interactions between users without relying on centralized servers.'
  },
  {
    category: 'Privacy',
    question: 'Do I need to provide personal information?',
    answer: 'No. KATOA does not require KYC (Know Your Customer) verification. You can use the platform with just a username or Nostr identity, maintaining complete pseudonymity.'
  },
  {
    category: 'Features',
    question: 'How do wishlists work?',
    answer: 'Create a wishlist with items you want, set Bitcoin prices, and share your wishlist URL. Anyone can contribute to your wishlist items using Lightning Network payments instantly and privately.'
  },
  {
    category: 'Features',
    question: 'Can I receive gifts without revealing my identity?',
    answer: 'Yes! KATOA supports anonymous gifting through Lightning Network payments and Nostr-based communications. Senders can contribute without knowing your real identity.'
  },
  {
    category: 'Features',
    question: 'What is peer-to-peer commerce?',
    answer: 'Peer-to-peer commerce means transactions happen directly between users without intermediaries. KATOA facilitates these connections while maintaining your privacy and charging zero fees.'
  },
  {
    category: 'Technical',
    question: 'What are zero-knowledge proofs?',
    answer: 'Zero-knowledge proofs (ZKPs) are cryptographic methods that prove something is true without revealing the underlying information. KATOA uses ZKPs to verify transactions while maintaining complete privacy.'
  },
  {
    category: 'Technical',
    question: 'How do I set up a Lightning wallet?',
    answer: 'To receive payments on KATOA, you need a Lightning Network wallet. Popular options include Phoenix, Wallet of Satoshi, Muun, or self-hosted solutions like LND or CLN. Add your Lightning address in your settings.'
  },
  {
    category: 'Technical',
    question: 'Is KATOA open source?',
    answer: 'Yes! KATOA is committed to transparency and community development. Our codebase is open source, allowing anyone to audit, contribute, or run their own instance.'
  },
  {
    category: 'Security',
    question: 'How secure is KATOA?',
    answer: 'KATOA uses industry-standard encryption, Lightning Network security, and Nostr protocol protection. We do not store your private keys or control your funds - you maintain complete custody.'
  },
  {
    category: 'Security',
    question: 'What if I lose access to my account?',
    answer: 'If using Nostr authentication, your identity is controlled by your Nostr keys. Always backup your keys securely. For email accounts, use the password recovery feature.'
  }
];

const categories = Array.from(new Set(faqs.map(faq => faq.category)));

export function FAQPage() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFAQs = selectedCategory === 'all'
    ? faqs
    : faqs.filter(faq => faq.category === selectedCategory);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-night-blue-shadow-700 via-night-blue-500 to-night-blue-shadow-700">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Navbar />

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to know about KATOA's privacy-first, zero-fee Bitcoin marketplace
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-night-blue-500 text-gray-300 hover:bg-night-blue-400'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category
                  ? 'bg-orange-500 text-white'
                  : 'bg-night-blue-500 text-gray-300 hover:bg-night-blue-400'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-night-blue-500 rounded-lg border border-night-blue-500 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-night-blue-500/50 transition-colors"
              >
                <div>
                  <div className="text-xs text-orange-400 mb-1">{faq.category}</div>
                  <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                </div>
                {openIndex === index ? (
                  <ChevronUp className="text-gray-400 flex-shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="text-gray-400 flex-shrink-0 ml-4" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-night-blue-shadow-700/50 border-t border-night-blue-500">
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Still have questions?</h2>
          <p className="text-gray-300 mb-6">
            Join our community or reach out directly. We're here to help.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/contact"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              Contact Us
            </a>
            <a
              href="https://github.com/kitsboy/Katoa"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-night-blue-500 hover:bg-night-blue-400 text-white rounded-lg font-medium transition-colors"
            >
              GitHub Community
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
