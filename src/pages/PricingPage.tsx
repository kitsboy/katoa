import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { Check, Zap } from 'lucide-react';

export function PricingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">{t('pricing.title')}</h1>
          <p className="text-xl text-gray-400">{t('pricing.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 mt-8">
          <Card className="p-8 hover:border-orange-500 transition-colors">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
              <p className="text-gray-400">For individuals</p>
            </div>

            <div className="text-center mb-8">
              <div className="text-4xl font-bold text-white mb-2">
                0<span className="text-xl text-gray-400">%</span>
              </div>
              <p className="text-gray-400">Platform fee</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="text-green-500 flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-300">Create unlimited wishlists</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="text-green-500 flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-300">Receive Bitcoin donations</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="text-green-500 flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-300">Share on social media</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="text-green-500 flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-300">Basic analytics</span>
              </li>
            </ul>

            <Button variant="outline" className="w-full">
              Get Started
            </Button>
          </Card>

          <Card className="p-8 border-orange-500 border-2 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
              Most Popular
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Creator</h3>
              <p className="text-gray-400">For serious creators</p>
            </div>

            <div className="text-center mb-8">
              <div className="text-4xl font-bold text-white mb-2">
                2<span className="text-xl text-gray-400">%</span>
              </div>
              <p className="text-gray-400">Platform fee</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="text-green-500 flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-300">Everything in Free</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="text-green-500 flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-300">Custom wishlist themes</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="text-green-500 flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-300">Advanced analytics</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="text-green-500 flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-300">Email supporter updates</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="text-green-500 flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-300">Priority support</span>
              </li>
            </ul>

            <Button className="w-full">
              <Zap size={20} className="mr-2" />
              Upgrade to Creator
            </Button>
          </Card>

          <Card className="p-8 hover:border-orange-500 transition-colors">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Non-Profit</h3>
              <p className="text-gray-400">For organizations</p>
            </div>

            <div className="text-center mb-8">
              <div className="text-4xl font-bold text-white mb-2">
                1<span className="text-xl text-gray-400">%</span>
              </div>
              <p className="text-gray-400">Platform fee</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="text-green-500 flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-300">Everything in Creator</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="text-green-500 flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-300">Team collaboration</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="text-green-500 flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-300">Tax receipts for donors</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="text-green-500 flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-300">Verified badge</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="text-green-500 flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-300">Dedicated account manager</span>
              </li>
            </ul>

            <Button variant="outline" className="w-full">
              Contact Sales
            </Button>
          </Card>
        </div>

        <Card className="p-8 bg-gray-800/50">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500 text-white rounded-full font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Create Your Wishlist</h3>
              <p className="text-gray-400 text-sm">
                Set up your profile and create wishlists for your projects or causes.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500 text-white rounded-full font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Share Your Story</h3>
              <p className="text-gray-400 text-sm">
                Share your wishlist link with your network and on social media.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500 text-white rounded-full font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Receive Bitcoin</h3>
              <p className="text-gray-400 text-sm">
                Get instant Bitcoin donations directly to your Lightning wallet.
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-slate-700 rounded-lg border border-gray-700 text-center">
            <p className="text-gray-300">
              <span className="font-bold text-white">No hidden fees.</span> We only charge when you receive
              donations. Network fees (Lightning) are minimal and paid by supporters.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
