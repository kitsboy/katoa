import { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useLanguage } from '../contexts/LanguageContext';
import { Mail, MessageSquare, Send } from 'lucide-react';

export function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create mailto link with "From Katoa" prefix
    const emailSubject = `From Katoa - ${formData.subject}`;
    const emailBody = `From Katoa Contact Form\n\nName: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`;
    const mailtoLink = `mailto:hello@giveabit.io?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    // Open mail client
    window.location.href = mailtoLink;

    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-night-blue-500 via-night-blue-500 to-black pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">{t('contact.title')}</h1>
          <p className="text-xl text-gray-400">{t('contact.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500/20 rounded-full mb-4">
              <Mail className="text-orange-500" size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Email</h3>
            <p className="text-gray-400 text-sm">hello@giveabit.io</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500/20 rounded-full mb-4">
              <MessageSquare className="text-orange-500" size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Discord</h3>
            <p className="text-gray-400 text-sm">Join our community</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500/20 rounded-full mb-4">
              <svg className="text-orange-500" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Twitter</h3>
            <p className="text-gray-400 text-sm">@KatoaOrg</p>
          </Card>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>

          {submitted ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                <Send className="text-green-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
              <p className="text-gray-400">We'll get back to you as soon as possible.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Subject"
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                <Send size={20} className="mr-2" />
                Send Message
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
