#!/usr/bin/env node
/**
 * Write public/feed.xml from the public pages already in the sitemap list.
 * Dates are the file mtime of this generator's first ship — not fake news dates.
 */
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SITE = 'https://katoa.org'
const DAY = '2026-10-19'
const PAGES = [
  ['/', 'Katoa', 'Zero-fee creator support on Bitcoin Lightning. No bank account. No KYC.'],
  ['/explore', 'Explore', 'Creators you can support, listed in the open.'],
  ['/about', 'About', 'What Katoa is, and what it refuses to charge.'],
  ['/pricing', 'Pricing', 'The fee is zero. This page says what that means.'],
  ['/faq', 'FAQ', 'Plain answers: fees, KYC, and how a payment lands.'],
  ['/creators', 'For creators', 'How a creator receives support.'],
  ['/creators/guidelines', 'Creator guidelines', 'The rules a creator page has to follow.'],
  ['/verify', 'Verify', 'Check a creator page before you pay.'],
  ['/comparison', 'Comparison', 'How Katoa sits next to a platform that takes a cut.'],
  ['/security', 'Security', 'How the site treats keys and payments.'],
]

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const items = PAGES.map(([path, title, desc]) => {
  const link = path === '/' ? SITE + '/' : SITE + path
  return `    <item>
      <title>${esc(title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(DAY + 'T12:00:00Z').toUTCString()}</pubDate>
      <description>${esc(desc)}</description>
    </item>`
}).join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Katoa — zero-fee creator support</title>
    <link>${SITE}</link>
    <description>Creator pages and the rules around them. Own pages only. Sibling news is not mixed in.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`
writeFileSync(join(ROOT, 'public', 'feed.xml'), xml)
console.log(`feed.xml ${PAGES.length} items`)
