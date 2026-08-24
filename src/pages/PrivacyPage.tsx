import { useLanguage } from '../contexts/LanguageContext';
import { Shield, Lock, Eye, Database, Cookie, Globe, Mail, UserCheck } from 'lucide-react';
import { PageMeta } from '../components/PageMeta';

export function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 text-white pt-6 pb-16">
      <PageMeta
        title={t('privacy.title')}
        description="KATOA Privacy Policy — how we protect your data on our privacy-first Bitcoin wishlist platform."
        path="/privacy"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
            {t('privacy.title')}
          </h1>
          <p className="text-gray-400">{t('privacy.lastUpdated')}</p>
        </div>

        <div className="prose prose-invert prose-blue max-w-none">
          <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 mb-8">
            <div className="flex items-start gap-4">
              <Lock className="text-blue-500 mt-1 flex-shrink-0" size={24} />
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">Your Privacy Matters</h3>
                <p className="text-gray-400 leading-relaxed">
                  Katoa is committed to protecting your privacy and giving you control over your personal information.
                  This Privacy Policy explains how we collect, use, share, and protect your data.
                </p>
              </div>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
              <Database className="text-blue-500" size={28} />
              1. Information We Collect
            </h2>
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">1.1 Information You Provide</h3>
                <p className="mb-3">When you use Katoa, you may provide us with:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-white">Account Information:</strong> Email address, username, password</li>
                  <li><strong className="text-white">Profile Information:</strong> Display name, bio, profile picture</li>
                  <li><strong className="text-white">Wishlist Data:</strong> Wishlist titles, descriptions, item details, images</li>
                  <li><strong className="text-white">Cryptocurrency Addresses:</strong> Bitcoin wallet addresses, Lightning Network payment details</li>
                  <li><strong className="text-white">Communications:</strong> Messages you send to our support team</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">1.2 Information Collected Automatically</h3>
                <p className="mb-3">When you access our Services, we automatically collect:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-white">Usage Data:</strong> Pages viewed, features used, time spent, interaction patterns</li>
                  <li><strong className="text-white">Device Information:</strong> Browser type, operating system, device identifiers</li>
                  <li><strong className="text-white">Location Data:</strong> Approximate location based on IP address (for analytics and fraud prevention)</li>
                  <li><strong className="text-white">Cookies and Similar Technologies:</strong> See Section 6 below</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">1.3 Information from Third Parties</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-white">Social Login:</strong> If you sign in via Google or Nostr, we receive basic profile information</li>
                  <li><strong className="text-white">Blockchain Data:</strong> Publicly available Bitcoin transaction information</li>
                  <li><strong className="text-white">Product URLs:</strong> Metadata from linked products (Amazon, eBay, Etsy)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
              <Eye className="text-blue-500" size={28} />
              2. How We Use Your Information
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>We use the information we collect to:</p>

              <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-6 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 font-bold">•</span>
                  <p><strong className="text-white">Provide and Improve Services:</strong> Operate the platform, process wishlists, enable donations</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 font-bold">•</span>
                  <p><strong className="text-white">Personalization:</strong> Customize your experience based on preferences</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 font-bold">•</span>
                  <p><strong className="text-white">Communications:</strong> Send service updates, notifications, and responses to inquiries</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 font-bold">•</span>
                  <p><strong className="text-white">Security:</strong> Detect and prevent fraud, abuse, and security threats</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 font-bold">•</span>
                  <p><strong className="text-white">Analytics:</strong> Understand usage patterns and improve features</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 font-bold">•</span>
                  <p><strong className="text-white">Compliance:</strong> Comply with legal obligations and enforce our Terms</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 font-bold">•</span>
                  <p><strong className="text-white">Marketing:</strong> Send promotional materials (with your consent, where required)</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
              <Globe className="text-blue-500" size={28} />
              3. How We Share Your Information
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p className="font-semibold text-white">We do NOT sell your personal information to third parties.</p>
              <p>We may share your information in the following circumstances:</p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">3.1 Public Information</h3>
                  <p>
                    Wishlists you mark as "public" and associated information (titles, descriptions, items, Bitcoin addresses)
                    are publicly visible and may be shared via social media, QR codes, and search engines.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">3.2 Service Providers</h3>
                  <p>We share information with trusted third-party service providers who help us operate the platform:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                    <li>Cloud hosting providers (Supabase, Netlify)</li>
                    <li>Analytics services (privacy-focused analytics)</li>
                    <li>Customer support tools</li>
                    <li>Email service providers</li>
                  </ul>
                  <p className="mt-2">These providers are contractually obligated to protect your data.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">3.3 Legal Requirements</h3>
                  <p>We may disclose information if required by law or to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                    <li>Comply with legal process or government requests</li>
                    <li>Protect our rights, property, or safety</li>
                    <li>Enforce our Terms of Service</li>
                    <li>Detect, prevent, or address fraud or security issues</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">3.4 Business Transfers</h3>
                  <p>
                    If Katoa is involved in a merger, acquisition, or sale of assets, your information may be transferred
                    as part of that transaction. We will notify you of any such change.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">3.5 With Your Consent</h3>
                  <p>
                    We may share your information for other purposes with your explicit consent.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
              <Lock className="text-blue-500" size={28} />
              4. Data Security
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>End-to-end encryption for data transmission (HTTPS/TLS)</li>
                <li>Encrypted password storage using bcrypt hashing</li>
                <li>Row-level security policies in our database</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls limiting employee access to personal data</li>
                <li>Automated monitoring for suspicious activity</li>
              </ul>

              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 mt-6">
                <p className="text-sm text-gray-300">
                  <strong className="text-orange-400">Important:</strong> While we take security seriously, no system is 100% secure.
                  You are responsible for maintaining the security of your account credentials and cryptocurrency private keys.
                  We will never ask for your private keys or seed phrases.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
              <UserCheck className="text-blue-500" size={28} />
              5. Your Rights and Choices
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>Depending on your location, you may have the following rights:</p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">5.1 Access and Portability</h3>
                  <p>Request a copy of your personal information in a structured, machine-readable format.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">5.2 Correction</h3>
                  <p>Update or correct inaccurate personal information through your account settings or by contacting us.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">5.3 Deletion</h3>
                  <p>
                    Request deletion of your account and associated data. Note that some information may be retained
                    for legal compliance or legitimate business purposes.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">5.4 Opt-Out</h3>
                  <p>Unsubscribe from marketing emails using the link in emails or through account settings.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">5.5 Object to Processing</h3>
                  <p>Object to certain processing of your personal information where permitted by law.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">5.6 Restrict Processing</h3>
                  <p>Request that we limit how we use your data in certain circumstances.</p>
                </div>
              </div>

              <p className="mt-6">
                To exercise these rights, email us at <a href="mailto:hello@giveabit.io" className="text-blue-400 hover:text-blue-300">hello@giveabit.io</a> with your request.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
              <Cookie className="text-blue-500" size={28} />
              6. Cookies and Tracking Technologies
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maintain your login session</li>
                <li>Remember your preferences (language, theme)</li>
                <li>Analyze usage patterns and improve performance</li>
                <li>Provide security features</li>
              </ul>

              <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-6 mt-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-white mb-1">Essential Cookies</h4>
                  <p className="text-sm">Required for the platform to function (authentication, security)</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Analytics Cookies</h4>
                  <p className="text-sm">Help us understand how users interact with our Services</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Preference Cookies</h4>
                  <p className="text-sm">Remember your settings and choices</p>
                </div>
              </div>

              <p className="mt-4">
                You can control cookies through your browser settings. Note that disabling cookies may limit
                functionality of the Services.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white">7. Data Retention</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>We retain your personal information for as long as:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your account remains active</li>
                <li>Needed to provide you Services</li>
                <li>Required to comply with legal obligations</li>
                <li>Necessary to resolve disputes and enforce our Terms</li>
              </ul>

              <p className="mt-4">
                When you delete your account, we will delete or anonymize your personal information within 90 days,
                except where retention is required by law or for legitimate business purposes (e.g., fraud prevention,
                financial records).
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white">8. Children's Privacy</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Katoa is not intended for users under 18 years of age. We do not knowingly collect personal
                information from children under 18.
              </p>
              <p>
                If we become aware that we have collected personal information from a child under 18, we will
                take steps to delete such information promptly.
              </p>
              <p>
                If you believe a child under 18 has provided us with personal information, please contact us
                at <a href="mailto:hello@giveabit.io" className="text-blue-400 hover:text-blue-300">hello@giveabit.io</a>.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white">9. International Data Transfers</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Katoa operates globally. Your information may be transferred to, stored, and processed in countries
                other than your own, including the United States.
              </p>
              <p>
                We ensure appropriate safeguards are in place to protect your information in accordance with this
                Privacy Policy and applicable data protection laws.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white">10. California Privacy Rights (CCPA)</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                If you are a California resident, you have additional rights under the California Consumer Privacy
                Act (CCPA):
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Right to know what personal information we collect, use, and disclose</li>
                <li>Right to request deletion of your personal information</li>
                <li>Right to opt-out of the sale of personal information (we do not sell your data)</li>
                <li>Right to non-discrimination for exercising your privacy rights</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us at <a href="mailto:hello@giveabit.io" className="text-blue-400 hover:text-blue-300">hello@giveabit.io</a>.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white">11. European Privacy Rights (GDPR)</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                If you are in the European Economic Area (EEA), United Kingdom, or Switzerland, you have rights under
                the General Data Protection Regulation (GDPR):
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Right to access, rectification, erasure, and data portability</li>
                <li>Right to restrict or object to processing</li>
                <li>Right to withdraw consent</li>
                <li>Right to lodge a complaint with a supervisory authority</li>
              </ul>

              <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-6 mt-4">
                <h4 className="font-semibold text-white mb-2">Legal Basis for Processing</h4>
                <p className="text-sm">We process your data based on:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm mt-2">
                  <li>Contract performance (to provide Services)</li>
                  <li>Legitimate interests (security, analytics, improvements)</li>
                  <li>Legal obligations (compliance, fraud prevention)</li>
                  <li>Your consent (marketing, optional features)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white">12. Changes to This Privacy Policy</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of material changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Posting the updated policy on our website</li>
                <li>Updating the "Last Updated" date</li>
                <li>Sending you an email notification (for significant changes)</li>
              </ul>
              <p className="mt-4">
                Your continued use of the Services after changes become effective constitutes acceptance of the
                updated Privacy Policy.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
              <Mail className="text-blue-500" size={28} />
              13. Contact Us
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices,
                please contact us:
              </p>
              <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-6 mt-4">
                <p className="font-semibold text-white mb-3">Katoa Privacy Team</p>
                <p><strong className="text-white">Email:</strong> privacy@katoa.org</p>
                <p><strong className="text-white">Website:</strong> https://katoa.org/contact</p>
                <p className="mt-3 text-sm">Response time: We aim to respond within 48 hours</p>
              </div>
            </div>
          </section>

          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-600/10 border border-blue-500/30 rounded-2xl p-8 mt-12">
            <p className="text-sm text-gray-400 leading-relaxed">
              <strong className="text-white">Legal Disclaimer:</strong> This is a template Privacy Policy document
              provided as a starting point. It should be reviewed and customized by qualified legal counsel to ensure
              compliance with applicable laws in your jurisdiction. Katoa makes no representations or warranties
              regarding the legal adequacy or compliance of this document.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
