import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { join } from 'node:path';

const home = fs.readFileSync(join('src', 'pages', 'HomePage.tsx'), 'utf8');

describe('HomePage route-context fingerprint', () => {
  it('wraps the whole route in one <article className="lp-page" data-theme="dark" aria-labelledby="home-hero-title">', () => {
    expect(home).toContain('<article className="lp-page" data-theme="dark" aria-labelledby="home-hero-title">');
  });

  it('closes the root article after the last section, not a bare </div>', () => {
    expect(home).toContain('      </section>\n    </article>\n  );\n}');
  });

  it('declares a stable sr-only heading tied to that aria-labelledby id', () => {
    expect(home).toContain('aria-labelledby="home-hero-title"');
    expect(home).toContain('<span id="home-hero-title" className="sr-only">');
  });
});
