import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { languageFlags, languageNames } from '../../contexts/LanguageContext';

// Vitest runs from the project root; import.meta.url is a jsdom HTTP URL here.
const PROJECT_ROOT = resolve(process.cwd());

/**
 * Anything a Chinese or Japanese label would use: kana, CJK ideographs,
 * CJK punctuation and fullwidth forms.
 */
const CJK = /[\u3000-\u303f\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uff00-\uffef]/;

/**
 * UI code that must stay English-only. Translation dictionaries are excluded on
 * purpose: `src/i18n/*` and the locale blocks inside `src/contexts/LanguageContext.tsx`
 * and `src/main.tsx` legitimately carry CJK copy for the zh/ja locales.
 */
const ENGLISH_ONLY_DIRS = ['src/components', 'src/pages', 'src/lib', 'src/data'];

const SCANNED_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.json']);

function collectFiles(dir: string): string[] {
  const absolute = resolve(PROJECT_ROOT, dir);
  const found: string[] = [];
  if (!existsSync(absolute)) {
    throw new Error(`Expected ${dir} to exist under ${PROJECT_ROOT} so the English-only guard can scan it`);
  }
  for (const entry of readdirSync(absolute)) {
    const full = join(absolute, entry);
    if (statSync(full).isDirectory()) {
      found.push(...collectFiles(join(dir, entry)));
      continue;
    }
    if (SCANNED_EXTENSIONS.has(extname(entry))) found.push(full);
  }
  return found;
}

describe('English-only UI', () => {
  it('language picker labels contain no CJK characters', () => {
    for (const [code, label] of Object.entries(languageNames)) {
      expect(CJK.test(label), `languageNames.${code} = ${label} must be an English label`).toBe(false);
    }
  });

  it('every language keeps a flag so the locale stays visible with English labels', () => {
    expect(Object.keys(languageFlags).sort()).toEqual(Object.keys(languageNames).sort());
    for (const flag of Object.values(languageFlags)) {
      expect(flag.length).toBeGreaterThan(0);
    }
  });

  it('no CJK characters are written into component, page, lib, or data code', () => {
    const offenders: string[] = [];
    for (const dir of ENGLISH_ONLY_DIRS) {
      for (const file of collectFiles(dir)) {
        const lines = readFileSync(file, 'utf8').split('\n');
        lines.forEach((line, index) => {
          if (CJK.test(line)) {
            offenders.push(`${file.replace(`${PROJECT_ROOT}/`, '')}:${index + 1}`);
          }
        });
      }
    }
    expect(offenders, `CJK found in English UI code:\n${offenders.join('\n')}`).toEqual([]);
  });
});
