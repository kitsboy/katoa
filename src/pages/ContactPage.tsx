import { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { PageMeta } from '../components/PageMeta';
import { PageHero } from '../components/PageHero';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../components/Toast';
import { copyToClipboard } from '../lib/clipboard';
import { Mail, MessageSquare, Send, Copy, CheckCircle2 } from 'lucide-react';

const EMAIL = 'hello@giveabit.io';

export function ContactPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [lastMailto, setLastMailto] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = t('contact.error.name');
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = t('contact.error.email');
    if (!formData.subject.trim()) e.subject = t('contact.error.subject');
    if (formData.message.trim().length < 10) e.message = t('contact.error.message');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.website) return;
    if (!validate()) return;
    const emailSubject = `From Katoa - ${formData.subject}`;
    const emailBody = `From Katoa Contact Form\n\nName: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`;
    const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    void copyToClipboard(`${emailSubject}\n\n${emailBody}`).then((result) => {
      if (result === 'success') toast(t('contact.messageCopied'), 'success');
    });
    window.location.href = mailto;
    toast(t('contact.openingMail'));
    setLastMailto(mailto);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '', website: '' });
  };

  const startNewMessage = () => {
    setSubmitted(false);
    setLastMailto('');
    setErrors({});
  };

  const reopenMail = () => {
    if (!lastMailto) return;
    window.location.href = lastMailto;
    toast(t('contact.openingMail'));
  };

  const copyEmail = async () => {
    const result = await copyToClipboard(EMAIL);
    toast(result === 'success' ? t('contact.copySuccess') : t('contact.copyFail'), result === 'success' ? 'success' : 'error');
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 pb-20 md:pb-16">
      <PageMeta title={t('contact.metaTitle')} description={t('contact.metaDesc')} path="/contact" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHero title={t('contact.title')} subtitle={t('contact.subtitle')} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <Card variant="glass" className="p-5 text-center">
            <div className="inline-flex w-12 h-12 bg-bitcoin-orange-500/20 rounded-full items-center justify-center mb-3">
              <Mail className="text-bitcoin-orange-400" size={22} />
            </div>
            <h3 className="font-bold text-white mb-1">{t('contact.email')}</h3>
            <p className="text-gray-400 text-sm mb-3">{EMAIL}</p>
            <Button variant="ghost" size="sm" onClick={copyEmail} className="touch-manipulation">
              <Copy size={14} className="mr-1" /> {t('contact.copy')}
            </Button>
          </Card>
          <Card variant="glass" className="p-5 text-center">
            <div className="inline-flex w-12 h-12 bg-neon-cyan-500/20 rounded-full items-center justify-center mb-3">
              <MessageSquare className="text-neon-cyan-400" size={22} />
            </div>
            <h3 className="font-bold text-white mb-1">{t('contact.community')}</h3>
            <a
              href="https://github.com/kitsboy/katoa/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 text-sm hover:text-neon-cyan-400 transition-colors"
            >
              {t('contact.githubIssues')}
            </a>
          </Card>
          <Card variant="glass" className="p-5 text-center">
            <div className="inline-flex w-12 h-12 bg-emerald-500/20 rounded-full items-center justify-center mb-3">
              <Send className="text-emerald-400" size={22} />
            </div>
            <h3 className="font-bold text-white mb-1">{t('contact.response')}</h3>
            <p className="text-gray-400 text-sm">{t('contact.responseTime')}</p>
          </Card>
        </div>

        {submitted ? (
        <Card variant="glass" className="p-6 sm:p-8">
          <div className="text-center py-4">
            <div className="inline-flex w-14 h-14 bg-emerald-500/20 rounded-full items-center justify-center mb-4">
              <CheckCircle2 className="text-emerald-400" size={28} />
            </div>
            <h2 className="text-xl font-display font-bold text-white mb-2">{t('contact.successTitle')}</h2>
            <p className="text-gray-300 mb-1">
              {t('contact.successTo')}{' '}
              <a className="text-neon-cyan-400 font-medium underline" href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </p>
            <p className="text-gray-400 text-sm mb-6">{t('contact.responseTime')}</p>
            <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">{t('contact.messageCopied')}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="bitcoin" className="min-h-[48px] flex-1 touch-manipulation" onClick={reopenMail}>
                <Send size={18} className="mr-2" /> {t('contact.composeAgain')}
              </Button>
              <Button variant="ghost" className="min-h-[48px] flex-1 touch-manipulation" onClick={startNewMessage}>
                {t('contact.newMessage')}
              </Button>
            </div>
          </div>
        </Card>
        ) : (
        <Card variant="glass" className="p-6 sm:p-8">
          <h2 className="text-xl font-display font-bold text-white mb-6">{t('contact.sendMessage')}</h2>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input label={t('contact.name')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} error={errors.name} required autoComplete="name" />
              <Input label={t('contact.email')} type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} error={errors.email} required autoComplete="email" />
            </div>
            <Input label={t('contact.subject')} value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} error={errors.subject} required autoComplete="off" />
            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-gray-300 mb-2">{t('contact.message')}</label>
              <textarea
                id="contact-message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className={`w-full px-4 py-3 min-h-[140px] bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan-500/50 resize-none text-base ${
                  errors.message ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10'
                }`}
                rows={5}
                required
                autoComplete="off"
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={errors.message ? 'contact-message-error' : undefined}
              />
              {errors.message && <p id="contact-message-error" className="mt-1 text-sm text-red-400" role="alert">{errors.message}</p>}
            </div>
            <Button type="submit" variant="bitcoin" className="w-full min-h-[52px] touch-manipulation">
              <Send size={18} className="mr-2" /> {t('contact.send')}
            </Button>
          </form>
        </Card>
        )}
      </div>
    </div>
  );
}