import { useState } from 'react';
import { Link } from './Link';
import { useLanguage } from '../contexts/LanguageContext';
import { Bitcoin, Twitter, Github, Mail, Heart, X, Copy, Check, ChevronDown } from 'lucide-react';
import packageJson from '../../package.json';

export function Footer() {
  const { t } = useLanguage();
  const [showDonation, setShowDonation] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mock BOLT12 address - replace with real one later
  const mockBolt12 = "lno1pg257enxv4ezqcneype82um50ynhxgrwdajx293pqe5zv4ezqmnw33j";

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(mockBolt12);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <footer className="relative bg-gradient-to-b from-night-blue-500 to-night-blue-500 border-t border-night-blue-500">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-9 mb-9">
            {/* Brand Section */}
            <div className="md:col-span-5">
              <div className="flex items-center gap-2 mb-4">
                <img src="/sats.png" alt="KATOA" className="w-7 h-7 rounded-full" />
                <span className="text-lg font-bold bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
                  KATOA
                </span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed mb-4 max-w-md">
                A movement to democratize giving using Bitcoin. Anyone with a smartphone can now support causes worldwide, instantly, privately, and directly.
              </p>
              {/* Social Links */}
              <div className="flex items-center gap-3">
                <a
                  href="https://twitter.com/katoa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-night-blue-500 border border-night-blue-400 hover:border-orange-500 hover:bg-orange-500/10 transition-all duration-300 group"
                >
                  <Twitter size={24} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                </a>
                <a
                  href="https://github.com/katoa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-night-blue-500 border border-night-blue-400 hover:border-orange-500 hover:bg-orange-500/10 transition-all duration-300 group"
                >
                  <Github size={24} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                </a>
                <a
                  href="mailto:hello@katoa.org"
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-night-blue-500 border border-night-blue-400 hover:border-orange-500 hover:bg-orange-500/10 transition-all duration-300 group"
                >
                  <Mail size={24} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                </a>
              </div>
            </div>

            {/* Navigation Columns */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/about" className="text-gray-400 hover:text-orange-500 text-sm transition-colors duration-200">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="text-gray-400 hover:text-orange-500 text-sm transition-colors duration-200">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-gray-400 hover:text-orange-500 text-sm transition-colors duration-200">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Product</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/explore" className="text-gray-400 hover:text-orange-500 text-sm transition-colors duration-200">
                      Explore
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="text-gray-400 hover:text-orange-500 text-sm transition-colors duration-200">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="text-gray-400 hover:text-orange-500 text-sm transition-colors duration-200">
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/terms" className="text-gray-400 hover:text-orange-500 text-sm transition-colors duration-200">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-gray-400 hover:text-orange-500 text-sm transition-colors duration-200">
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="pt-6 border-t border-night-blue-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>&copy; {new Date().getFullYear()} KATOA (katoa.org). All rights reserved.</span>
                <span className="text-gray-700">•</span>
                <span className="text-gray-600 font-mono text-[10px]">v{packageJson.version}</span>
              </div>

              <button
                onClick={() => setShowDonation(!showDonation)}
                className="flex items-center gap-2 text-base text-gray-400 hover:text-orange-500 transition-colors duration-200 cursor-pointer group"
              >
                <span>Made with</span>
                <Heart size={20} className="text-orange-500 fill-orange-500 group-hover:animate-pulse" />
                <span>and</span>
                <Bitcoin size={20} className="text-orange-500" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Sliding Donation Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ease-out ${
          showDonation ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="relative bg-gradient-to-t from-night-blue-500 via-night-blue-400 to-night-blue-500 border-t-2 border-orange-500/50 shadow-[0_-10px_50px_rgba(249,115,22,0.3)]">
          {/* Close Button */}
          <button
            onClick={() => setShowDonation(false)}
            className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-night-blue-500 hover:bg-orange-500/20 border border-night-blue-400 hover:border-orange-500 text-gray-400 hover:text-orange-500 transition-all duration-200"
          >
            <ChevronDown size={20} />
          </button>

          <div className="max-w-md mx-auto px-6 py-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-yellow-600 mb-3">
                <Heart size={24} className="text-white fill-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Support FOSS Development</h3>
              <p className="text-gray-400 text-xs">
                Help keep KATOA free and open-source
              </p>
            </div>

            <div className="flex items-start gap-4">
              {/* QR Code */}
              <div className="flex-shrink-0">
                <div className="w-36 h-36 bg-white p-2 rounded-lg">
                  <img
                    src="/donations-qr.png"
                    alt="Donation QR Code"
                    className="w-full h-full object-contain"
                    style={{ imageRendering: 'crisp-edges' }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* BOLT12 Address */}
                <div className="bg-night-blue-400/80 border border-night-blue-500 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">BOLT12</span>
                    <button
                      onClick={handleCopyAddress}
                      className="flex items-center gap-1 text-[10px] text-orange-500 hover:text-orange-400 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check size={12} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <code className="text-[10px] text-gray-300 break-all font-mono block leading-tight">
                    {mockBolt12}
                  </code>
                </div>

                {/* Caption */}
                <p className="text-xs text-gray-400 leading-relaxed mb-2">
                  Your <span className="text-orange-500 font-semibold">sats</span> help us build free tools for the Bitcoin community.
                </p>
                <p className="text-[10px] text-gray-500">
                  Scan with your Lightning wallet
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {showDonation && (
        <div
          onClick={() => setShowDonation(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300"
        />
      )}
    </>
  );
}
