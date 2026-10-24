/**
 * Guard: every translation key the UI asks for exists, and every group of keys one control
 * renders together is translated in all seven locales.
 *
 * `t()` falls back to English and then to the key itself
 * (`translations[lang][key] || translations.en[key] || key`), so a renamed or mistyped key does
 * not throw — it renders the raw key into the interface, and a key that only English defines
 * silently renders one card in English inside an otherwise translated page. `i18nParity.test.ts`
 * cannot see either class because it only compares the dictionaries to each other, never to what
 * the UI uses.
 *
 * Rules:
 *  - Every literal key passed to `t('…')` in `src/` must exist in English with a non-empty value.
 *  - No locale may carry a key English does not have; a dead entry hides drift in the other
 *    direction (someone renames in one locale and thinks it is done).
 *  - Every key group the UI uses must be complete in all seven locales. A group is the parent
 *    path of the key (`cover.image` for `cover.image.title`), which is the unit a control renders
 *    together, so a locale cannot cover half a card and fall back to English for the rest.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { translations, type Language } from '../../contexts/LanguageContext';

const LOCALES: Language[] = ['en', 'es', 'pt', 'fr', 'de', 'ja', 'zh'];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (entry === '__tests__') continue;
      walk(path, out);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      out.push(path);
    }
  }
  return out;
}

/** `t('some.key')` only — keys built at runtime (`t(prefix + id)`) cannot be checked statically. */
const T_CALL = /\bt\(\s*'([^']+)'\s*\)/g;

const uiFiles = walk('src');
const keyFiles = new Map<string, Set<string>>();
for (const file of uiFiles) {
  for (const match of readFileSync(file, 'utf8').matchAll(T_CALL)) {
    const files = keyFiles.get(match[1]) ?? new Set<string>();
    files.add(file);
    keyFiles.set(match[1], files);
  }
}

/** `cover.image` for `cover.image.title` — the siblings one control renders together. */
function groupOf(key: string): string {
  return key.split('.').slice(0, -1).join('.');
}

const groups = new Map<string, string[]>();
for (const key of keyFiles.keys()) {
  const group = groupOf(key);
  groups.set(group, [...(groups.get(group) ?? []), key].sort());
}

function hasValue(lang: Language, key: string): boolean {
  const value = translations[lang][key];
  return Boolean(value && value.trim() && value.trim() !== key);
}

function usage(key: string): string {
  return [...(keyFiles.get(key) ?? [])].join(', ');
}

describe('translation keys used by the UI exist in the dictionary', () => {
  it('scans a meaningful share of the UI', () => {
    // Sanity: if the walk or the pattern breaks, the guards below would pass vacuously.
    expect(uiFiles.length).toBeGreaterThan(100);
    expect(keyFiles.size).toBeGreaterThan(500);
    expect(groups.size).toBeGreaterThan(80);
    expect(groups.get('cover.image')?.length).toBe(8);
    expect(groups.get('video.upload')?.length).toBe(8);
    expect(keyFiles.get('video.upload.drop')).toContain('src/components/CoverVideoUpload.tsx');
  });

  it('defines an English value for every literal t() key', () => {
    const missing = [...keyFiles]
      .filter(([key]) => !(key in translations.en))
      .map(([key]) => `${key} (${usage(key)})`);
    expect(missing).toEqual([]);
  });

  it('has a non-empty English value that is not the key itself', () => {
    const stubs = Object.entries(translations.en)
      .filter(([key, value]) => !value || !value.trim() || value.trim() === key)
      .map(([key]) => key);
    expect(stubs).toEqual([]);
  });

  it('has no locale key that English does not define', () => {
    const orphans = LOCALES.filter((lang) => lang !== 'en').flatMap((lang) =>
      Object.keys(translations[lang])
        .filter((key) => !(key in translations.en))
        .map((key) => `${lang}:${key}`),
    );
    expect(orphans).toEqual([]);
  });

  it('renders every UI key group in all seven locales', () => {
    const gaps = LOCALES.filter((lang) => lang !== 'en').flatMap((lang) =>
      [...groups]
        .sort(([a], [b]) => a.localeCompare(b))
        .flatMap(([group, keys]) => {
          const missing = keys.filter((key) => !hasValue(lang, key));
          if (!missing.length) return [];
          return [`${lang} · ${group}: ${missing.map((key) => `${key} (${usage(key)})`).join(', ')}`];
        }),
    );
    expect(gaps).toEqual([]);
  });
});
