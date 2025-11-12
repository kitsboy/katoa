import { Card } from '../components/Card';
import { useLanguage } from '../contexts/LanguageContext';
import { Heart, Globe, Shield, Zap } from 'lucide-react';

export function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">{t('about.title')}</h1>
          <p className="text-xl text-gray-400">{t('about.subtitle')}</p>
        </div>

        <Card className="p-8 mb-8">
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              BitWish is a global platform that connects dreams with supporters through the power of Bitcoin.
              We believe that everyone deserves the opportunity to pursue their goals, whether it's education,
              creative projects, community development, or personal aspirations.
            </p>

            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              By leveraging Bitcoin's borderless nature, we enable people from any country to receive support
              directly, without the barriers of traditional financial systems. No matter where you are in the
              world, your story can reach supporters who believe in your mission.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/20 rounded-full mb-4">
                  <Globe className="text-orange-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Global Access</h3>
                <p className="text-gray-400">
                  Receive Bitcoin donations from anywhere in the world, instantly and securely.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/20 rounded-full mb-4">
                  <Shield className="text-orange-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Transparent</h3>
                <p className="text-gray-400">
                  Every transaction is recorded on the Bitcoin blockchain, ensuring full transparency.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/20 rounded-full mb-4">
                  <Zap className="text-orange-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
                <p className="text-gray-400">
                  Instant Bitcoin transfers via Lightning Network for minimal fees and maximum speed.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/20 rounded-full mb-4">
                  <Heart className="text-orange-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Community Driven</h3>
                <p className="text-gray-400">
                  Built by the community, for the community. Your feedback shapes our platform.
                </p>
              </div>
            </div>

            <div className="mt-12 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-gray-300 leading-relaxed">
                We envision a world where financial borders don't limit human potential. Where a student in
                Guatemala can receive textbooks, a musician in Nashville can get a new guitar, and a community
                in Nigeria can build a well—all funded directly by people who believe in their cause. Bitcoin
                makes this possible, and BitWish makes it simple.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
