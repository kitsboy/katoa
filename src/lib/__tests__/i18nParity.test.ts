import { describe, expect, it } from 'vitest';
import { translations, type Language } from '../../contexts/LanguageContext';

const LOCALES: Language[] = ['en', 'es', 'pt', 'fr', 'de', 'ja', 'zh'];

const CRITICAL_KEYS = [
  'home.pillar1.title',
  'footer.press',
  'trust.proof.zeroFees',
  'home.cta.note',
] as const;

describe('i18n parity', () => {
  it('critical keys exist in every locale with a real value', () => {
    for (const lang of LOCALES) {
      for (const key of CRITICAL_KEYS) {
        const value = translations[lang][key];
        expect(value, `${lang}:${key}`).toBeTruthy();
        expect(value, `${lang}:${key} should not fall back to the key`).not.toBe(key);
      }
    }
  });

  it('non-English locales have present values for critical keys (not empty)', () => {
    for (const lang of LOCALES.filter((l) => l !== 'en')) {
      for (const key of CRITICAL_KEYS) {
        const value = translations[lang][key];
        expect(value.trim().length, `${lang}:${key}`).toBeGreaterThan(0);
      }
    }
  });
});
