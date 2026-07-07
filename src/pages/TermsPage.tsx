import { useLanguage } from '../contexts/LanguageContext';
import { FileText, Shield, AlertCircle, Scale } from 'lucide-react';
import { PageMeta } from '../components/PageMeta';

export function TermsPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 text-white pt-24 pb-16">
      <PageMeta
        title={t('terms.metaTitle')}
        description={t('terms.metaDesc')}
        path="/terms"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-yellow-600 mb-4">
            <Scale size={32} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
            {t('footer.terms')}
          </h1>
          <p className="text-gray-400">{t('terms.lastUpdated')}</p>
        </div>

        <div className="prose prose-invert prose-orange max-w-none">
          <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <AlertCircle className="text-orange-500 mt-1 flex-shrink-0" size={24} />
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">Important Notice</h3>
                <p className="text-gray-400 leading-relaxed">
                  By accessing or using Katoa (katoa.org), you agree to be bound by these Terms of Service.
                  If you do not agree to these terms, please do not use our platform.
                </p>
              </div>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
              <FileText className="text-orange-500" size={28} />
              1. Acceptance of Terms
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                These Terms of Service govern your access to and use of Katoa's services, including our website,
                mobile applications, and any related services (collectively, the "Services").
              </p>
              <p>
                By creating an account or using our Services, you represent that you are at least 18 years old
                and have the legal capacity to enter into these Terms.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white">2. Description of Services</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Katoa is a platform that enables users to create, share, and manage wishlists for charitable
                giving and personal fundraising using Bitcoin and other cryptocurrencies. Our Services include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Creating and managing public or private wishlists</li>
                <li>Accepting Bitcoin and Lightning Network donations</li>
                <li>Sharing wishlists via social media and QR codes</li>
                <li>Tracking funding progress and managing received donations</li>
                <li>Media uploads and wishlist item management</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white">3. User Accounts and Responsibilities</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <h3 className="text-lg font-semibold text-white">3.1 Account Creation</h3>
              <p>
                To use certain features of our Services, you must create an account. You agree to provide accurate,
                current, and complete information during registration and to update such information as necessary.
              </p>

              <h3 className="text-lg font-semibold text-white mt-6">3.2 Account Security</h3>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all
                activities that occur under your account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use a strong, unique password</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Not share your account credentials with third parties</li>
                <li>Log out after each session when accessing from a shared device</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mt-6">3.3 Acceptable Use</h3>
              <p>You agree not to use the Services to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Engage in fraudulent, deceptive, or misleading activities</li>
                <li>Infringe upon intellectual property rights of others</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Impersonate any person or entity</li>
                <li>Scrape, crawl, or collect data without authorization</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
              <Shield className="text-orange-500" size={28} />
              4. Cryptocurrency Transactions
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-orange-400 mb-3">Important Cryptocurrency Notice</h3>
                <p className="text-gray-300">
                  All cryptocurrency transactions are irreversible and final. Katoa does not control, custody,
                  or manage any cryptocurrency funds. You are solely responsible for managing your private keys
                  and wallet addresses.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-white mt-6">4.1 No Custody</h3>
              <p>
                Katoa is a non-custodial platform. We do not hold, control, or have access to your cryptocurrency
                or private keys. All donations go directly to wallet addresses you provide.
              </p>

              <h3 className="text-lg font-semibold text-white mt-6">4.2 Transaction Fees</h3>
              <p>
                Network transaction fees (Bitcoin miner fees, Lightning routing fees) are determined by the respective
                blockchain networks and are beyond our control. You are responsible for all such fees.
              </p>

              <h3 className="text-lg font-semibold text-white mt-6">4.3 Tax Obligations</h3>
              <p>
                You are solely responsible for determining what, if any, taxes apply to your cryptocurrency transactions.
                Katoa is not responsible for determining or collecting taxes owed on your behalf.
              </p>

              <h3 className="text-lg font-semibold text-white mt-6">4.4 No Refunds</h3>
              <p>
                Due to the irreversible nature of cryptocurrency transactions, we cannot process refunds. All donations
                and transactions are final.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white">5. Intellectual Property Rights</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <h3 className="text-lg font-semibold text-white">5.1 Our Content</h3>
              <p>
                The Services and their original content, features, and functionality are owned by Katoa and are
                protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>

              <h3 className="text-lg font-semibold text-white mt-6">5.2 Your Content</h3>
              <p>
                You retain ownership of content you upload to the Services. By posting content, you grant Katoa
                a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content
                for the purpose of operating and promoting the Services.
              </p>

              <h3 className="text-lg font-semibold text-white mt-6">5.3 Third-Party Links</h3>
              <p>
                Our Services may contain links to third-party websites (such as product URLs from Amazon, eBay, etc.).
                We are not responsible for the content, accuracy, or practices of these external sites.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white">6. Disclaimers and Limitations of Liability</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <h3 className="text-lg font-semibold text-white">6.1 Service Availability</h3>
              <p>
                The Services are provided "as is" and "as available" without warranties of any kind, either express
                or implied. We do not guarantee that the Services will be uninterrupted, secure, or error-free.
              </p>

              <h3 className="text-lg font-semibold text-white mt-6">6.2 No Financial Advice</h3>
              <p>
                Katoa does not provide financial, investment, tax, or legal advice. Any information provided through
                the Services is for informational purposes only and should not be relied upon for financial decisions.
              </p>

              <h3 className="text-lg font-semibold text-white mt-6">6.3 Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, Katoa shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages, including loss of profits, data, or cryptocurrency,
                arising out of or related to your use of the Services.
              </p>

              <h3 className="text-lg font-semibold text-white mt-6">6.4 Maximum Liability</h3>
              <p>
                Our total liability for any claims arising from your use of the Services shall not exceed the amount
                you paid to Katoa in the twelve months preceding the claim, or $100, whichever is greater.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white">7. Indemnification</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                You agree to indemnify, defend, and hold harmless Katoa and its officers, directors, employees,
                and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising
                from:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your use of the Services</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Any content you submit or transmit through the Services</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white">8. Termination</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                We reserve the right to suspend or terminate your account and access to the Services at our sole
                discretion, without notice, for conduct that we believe:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violates these Terms or applicable laws</li>
                <li>Could harm other users, Katoa, or third parties</li>
                <li>Could subject us to legal liability</li>
                <li>Is otherwise inappropriate</li>
              </ul>
              <p className="mt-4">
                Upon termination, your right to use the Services will immediately cease. You may terminate your
                account at any time by contacting us or using account settings.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white">9. Governing Law and Dispute Resolution</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <h3 className="text-lg font-semibold text-white">9.1 Governing Law</h3>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction
                in which Katoa operates, without regard to conflict of law provisions.
              </p>

              <h3 className="text-lg font-semibold text-white mt-6">9.2 Arbitration</h3>
              <p>
                Any dispute arising from these Terms or the Services shall be resolved through binding arbitration
                rather than in court, except that you may assert claims in small claims court if they qualify.
              </p>

              <h3 className="text-lg font-semibold text-white mt-6">9.3 Class Action Waiver</h3>
              <p>
                You agree that any arbitration or legal proceeding shall be conducted on an individual basis and not
                as a class action, consolidated action, or representative action.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white">10. Changes to Terms</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of material changes
                by posting the updated Terms on the Services and updating the "Last Updated" date.
              </p>
              <p>
                Your continued use of the Services after changes become effective constitutes acceptance of the
                modified Terms. If you do not agree to the modified Terms, you must stop using the Services.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white">11. Miscellaneous</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <h3 className="text-lg font-semibold text-white">11.1 Entire Agreement</h3>
              <p>
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and
                Katoa regarding the Services.
              </p>

              <h3 className="text-lg font-semibold text-white mt-6">11.2 Severability</h3>
              <p>
                If any provision of these Terms is found to be unenforceable, the remaining provisions will continue
                in full force and effect.
              </p>

              <h3 className="text-lg font-semibold text-white mt-6">11.3 Waiver</h3>
              <p>
                No waiver of any term shall be deemed a further or continuing waiver of such term or any other term.
              </p>

              <h3 className="text-lg font-semibold text-white mt-6">11.4 Assignment</h3>
              <p>
                You may not assign or transfer these Terms without our prior written consent. We may assign these
                Terms without restriction.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white">12. Contact Information</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                If you have questions about these Terms, please contact us at:
              </p>
              <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-6 mt-4">
                <p className="font-semibold text-white mb-2">Katoa Legal Team</p>
                <p>Email: hello@giveabit.io</p>
                <p>Website: https://katoa.org/contact</p>
              </div>
            </div>
          </section>

          <div className="bg-gradient-to-r from-orange-500/10 to-yellow-600/10 border border-orange-500/30 rounded-2xl p-8 mt-12">
            <p className="text-sm text-gray-400 leading-relaxed">
              <strong className="text-white">Legal Disclaimer:</strong> This is a template Terms of Service document
              provided as a starting point. It should be reviewed and customized by qualified legal counsel before use.
              Katoa makes no representations or warranties regarding the legal adequacy or compliance of this document.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
