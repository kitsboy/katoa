import { useState } from 'react';
import { useToast } from './Toast';
import { Link } from './Link';
import { useLanguage } from '../contexts/LanguageContext';
import { FooterBitcoinStrip } from './FooterBitcoinStrip';
import { FooterJobBoard } from './FooterJobBoard';
import { ContributorsWall } from './ContributorsWall';
import { DonateQRModal } from './DonateQRModal';
import {
  Bitcoin,
  Twitter,
  Mail,
  Heart,
  Copy,
  Check,
  ChevronDown,
  Github,
  Sparkles,
  Zap,
  Globe,
  Code2,
  ExternalLink,
  BookOpen,
  Shield,
} from 'lucide-react';
import packageJson from '../../package.json';

const bitcoinAddress = 'bc1qhm5ndfjhqxdk3cx0pngyps4f5nnwdckulmge6c8keyf2pk0neqtshjn8ad';

const apiLinks = [
  { label: 'Supabase API', href: 'https://supabase.com/docs/guides/api', icon: DatabaseIcon },
  { label: 'BTC Map API', href: 'https://api.btcmap.org/v2/areas', icon: Globe },
  { label: 'Mempool.space', href: 'https://mempool.space/api', icon: BlocksIcon },
  { label: 'Nostr NIPs', href: 'https://github.com/nostr-protocol/nips', icon: BookOpen },
];

function DatabaseIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return <Code2 size={size} className={className} />;
}

function BlocksIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return <Shield size={size} className={className} />;
}

export function Footer() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [showDonation, setShowDonation] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrExpanded, setQrExpanded] = useState(false);
  const [jobsExpanded, setJobsExpanded] = useState(false);

  const handleCopyAddress = async () => {
    const { copyToClipboard } = await import('../lib/clipboard');
    const result = await copyToClipboard(bitcoinAddress);
    if (result === 'success') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast(t('footer.copyFailed'), 'error');
    }
  };

  return (
    <>
      <footer className="relative mt-auto overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-neon-cyan-500/40 to-transparent" />
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-bitcoin-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-20 right-1/4 w-72 h-72 bg-neon-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <FooterBitcoinStrip />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 mb-12">
            {/* Brand */}
            <div className="lg:col-span-3">
              <Link href="/" className="inline-flex items-center gap-3 mb-5 group">
                <img
                  src="/logo2.png" style={{ objectFit: "cover" }}
                  alt="KATOA"
                  className="w-11 h-11 rounded-full ring-2 ring-bitcoin-orange-500/30 group-hover:ring-neon-cyan-500/50 transition-all"
                />
                <div>
                  <span className="text-xl font-display font-black bg-gradient-to-r from-bitcoin-orange-400 via-amber-300 to-neon-cyan-400 bg-clip-text text-transparent">
                    KATOA
                  </span>
                  <p className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">Keep All That's Owed Always</p>
                </div>
              </Link>

              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {t('footer.tagline')}. A movement to democratize giving using Bitcoin—anyone with a smartphone can support
                causes worldwide, instantly, privately, and directly. Zero platform fees. Forever.
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                <a
                  href="https://x.com/give_bit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/5 border border-white/10 hover:border-neon-cyan-500/40 hover:bg-neon-cyan-500/10 transition-all group"
                  aria-label="Twitter"
                >
                  <Twitter size={20} className="text-gray-400 group-hover:text-neon-cyan-400" />
                </a>
                <a
                  href="https://github.com/kitsboy/katoa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all group"
                  aria-label="GitHub"
                >
                  <Github size={20} className="text-gray-400 group-hover:text-white" />
                </a>
                <a
                  href="mailto:hello@giveabit.io"
                  className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/5 border border-white/10 hover:border-bitcoin-orange-500/40 hover:bg-bitcoin-orange-500/10 transition-all group"
                  aria-label="Email"
                >
                  <Mail size={20} className="text-gray-400 group-hover:text-bitcoin-orange-400" />
                </a>
                <button
                  type="button"
                  onClick={() => setShowDonation(true)}
                  className="flex items-center gap-2 px-4 h-11 rounded-xl bg-gradient-to-r from-bitcoin-orange-500/20 to-amber-600/20 border border-bitcoin-orange-500/30 hover:border-bitcoin-orange-500/60 text-bitcoin-orange-400 text-sm font-semibold transition-all"
                >
                  <Bitcoin size={18} />
                  Donate sats
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2 flex items-center gap-1.5">
                  <Zap size={12} className="text-neon-cyan-500" />
                  {t('footer.apis')}
                </p>
                <ul className="space-y-2">
                  {apiLinks.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-gray-400 hover:text-neon-cyan-400 transition-colors group"
                      >
                        <item.icon size={14} className="text-gray-600 group-hover:text-neon-cyan-500" />
                        <span className="flex-1">{item.label}</span>
                        <ExternalLink size={10} className="opacity-0 group-hover:opacity-100" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Nav */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-white font-display font-bold mb-4 text-xs uppercase tracking-widest text-gray-300">
                  {t('footer.company')}
                </h3>
                <ul className="space-y-2.5">
                  <FooterLink href="/about">{t('footer.about')}</FooterLink>
                  <FooterLink href="/pricing">{t('footer.pricing')}</FooterLink>
                  <FooterLink href="/contact">{t('footer.contact')}</FooterLink>
                  <FooterLink href="/comparison">Why Katoa</FooterLink>
                  <FooterLink href="/pitch">Pitch</FooterLink>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-display font-bold mb-4 text-xs uppercase tracking-widest text-gray-300">
                  {t('footer.product')}
                </h3>
                <ul className="space-y-2.5">
                  <FooterLink href="/explore">Explore</FooterLink>
                  <FooterLink href="/explore?videos=1">Video Creators</FooterLink>
                  <FooterLink href="/templates">Templates</FooterLink>
                  <FooterLink href="/dashboard">Dashboard</FooterLink>
                  <FooterLink href="/faq">FAQ</FooterLink>
                  <FooterLink href="/roadmap">Roadmap</FooterLink>
                  <FooterLink href="/auth">Sign In</FooterLink>
                </ul>
              </div>
              <div className="col-span-2">
                <h3 className="text-white font-display font-bold mb-4 text-xs uppercase tracking-widest text-gray-300">
                  {t('footer.legal')}
                </h3>
                <ul className="space-y-2.5 sm:flex sm:flex-wrap sm:gap-x-6 sm:gap-y-2.5 sm:space-y-0">
                  <FooterLink href="/security">Security</FooterLink>
                  <FooterLink href="/terms">{t('footer.terms')}</FooterLink>
                  <FooterLink href="/privacy">{t('footer.privacy')}</FooterLink>
                </ul>
              </div>
            </div>

            {/* Jobs */}
            <div className="lg:col-span-7">
              <button
                type="button"
                onClick={() => setJobsExpanded(!jobsExpanded)}
                className="lg:hidden w-full flex items-center justify-between mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-white font-semibold touch-manipulation"
                aria-expanded={jobsExpanded}
              >
                <span className="flex items-center gap-2">
                  Open Roles
                  <Sparkles size={16} className="text-neon-cyan-500" />
                </span>
                <ChevronDown size={18} className={`transition-transform ${jobsExpanded ? 'rotate-180' : ''}`} />
              </button>
              <div className={`${jobsExpanded ? 'block' : 'hidden'} lg:block`}>
                <FooterJobBoard />
              </div>
            </div>
          </div>

          {/* Contributors */}
          <div className="mb-12">
            <h3 className="text-white font-display font-bold mb-4 text-xs uppercase tracking-widest text-gray-300">
              Contributors
            </h3>
            <ContributorsWall />
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-2 text-xs text-gray-500">
                <span>&copy; {new Date().getFullYear()} KATOA (katoa.org)</span>
                <span className="hidden sm:inline text-gray-700">·</span>
                <span className="font-mono text-[10px] text-gray-600">v{packageJson.version}</span>
                <span className="hidden sm:inline text-gray-700">·</span>
                <a
                  href="https://giveabit.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-neon-cyan-400 transition-colors"
                >
                  A Give A Bit project
                </a>
                <a
                  href="https://github.com/kitsboy/katoa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all text-gray-400 hover:text-white"
                  aria-label="KATOA on GitHub — MIT License"
                >
                  <Github size={14} />
                  <span className="font-mono text-[10px] tracking-wide">MIT</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => setShowDonation(!showDonation)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-bitcoin-orange-400 transition-colors group"
              >
                <span>Made with</span>
                <Heart size={18} className="text-bitcoin-orange-500 fill-bitcoin-orange-500 group-hover:animate-pulse" />
                <span>and</span>
                <Bitcoin size={18} className="text-bitcoin-orange-500" />
                <span className="text-gray-600">·</span>
                <span className="font-mono text-neon-cyan-500/80">₿ FOSS</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      <DonateQRModal
        isOpen={qrExpanded}
        onClose={() => setQrExpanded(false)}
        address={bitcoinAddress}
      />

      {/* Donation drawer — preserved */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ease-out ${
          showDonation ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="relative bg-gradient-to-t from-charcoal-950 via-charcoal-900 to-charcoal-950 border-t-2 border-bitcoin-orange-500/50 shadow-[0_-10px_50px_rgba(247,147,26,0.25)] pb-safe">
          <button
            type="button"
            onClick={() => setShowDonation(false)}
            aria-label="Close donation drawer"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all"
          >
            <ChevronDown size={20} />
          </button>

          <div className="max-w-lg mx-auto px-6 py-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-bitcoin-orange-500 to-amber-600 mb-3">
                <Heart size={24} className="text-white fill-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Support FOSS Development</h3>
              <p className="text-gray-400 text-xs">Help keep KATOA free and open-source</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="mx-auto sm:mx-0 shrink-0 flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setQrExpanded(true)}
                  className="w-36 h-36 bg-white p-2 rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all touch-manipulation ring-2 ring-transparent hover:ring-bitcoin-orange-500/30"
                  aria-label="Expand donation QR code"
                  aria-expanded={qrExpanded}
                >
                  <img
                    src="/donations-qr.png"
                    alt="Donation QR"
                    className="w-full h-full object-contain"
                    style={{ imageRendering: 'crisp-edges' }}
                  />
                </button>
                <p className="text-[10px] text-gray-500 sm:hidden">Tap to enlarge</p>
              </div>
              <div className="flex-1 min-w-0 w-full">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs text-white uppercase tracking-wider font-semibold">Bitcoin Main Chain</span>
                    <button
                      type="button"
                      onClick={handleCopyAddress}
                      className="flex items-center gap-1 text-[10px] text-bitcoin-orange-400 hover:text-bitcoin-orange-300"
                    >
                      {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </div>
                  <code className="text-xs text-gray-400 break-all font-mono block leading-tight">{bitcoinAddress}</code>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Your <span className="text-bitcoin-orange-500 font-semibold">sats</span> fund free tools for the Bitcoin
                  community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDonation && (
        <div
          role="presentation"
          onClick={() => setShowDonation(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}
    </>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-gray-400 hover:text-neon-cyan-400 text-sm transition-colors duration-200 inline-flex items-center gap-1 group"
      >
        <span className="w-0 group-hover:w-1.5 h-px bg-neon-cyan-500 transition-all duration-200" />
        {children}
      </Link>
    </li>
  );
}