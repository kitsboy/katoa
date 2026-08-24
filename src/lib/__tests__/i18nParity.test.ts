import { describe, expect, it } from 'vitest';
import { translations, type Language } from '../../contexts/LanguageContext';

const LOCALES: Language[] = ['en', 'es', 'pt', 'fr', 'de', 'ja', 'zh'];

const CRITICAL_KEYS = [
  'home.pillar1.title',
  'footer.press',
  'trust.proof.zeroFees',
  'home.cta.note',
] as const;

const PREFIXES = ['nav.', 'notfound.', 'errorBoundary.'] as const;
const EXTRA_KEYS = ['footer.press'] as const;

function keysForPrefix(prefix: string): string[] {
  return Object.keys(translations.en).filter((k) => k.startsWith(prefix));
}

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

  it('nav.*, notfound.*, errorBoundary.*, footer.press exist in every locale with a real value', () => {
    const keys = [...PREFIXES.flatMap(keysForPrefix), ...EXTRA_KEYS];
    expect(keys.length, 'expected nav/notfound/errorBoundary keys in EN').toBeGreaterThan(10);
    for (const lang of LOCALES) {
      for (const key of keys) {
        const value = translations[lang][key];
        expect(value, `${lang}:${key}`).toBeTruthy();
        expect(value, `${lang}:${key} should not fall back to the key`).not.toBe(key);
        expect(value.trim().length, `${lang}:${key}`).toBeGreaterThan(0);
      }
    }
  });
});
