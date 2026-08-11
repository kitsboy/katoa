/**
 * scripts/generate-metrics.ts — Katoa
 *
 * Reads app data (wishlists, creators) and writes gab.product-metrics.v1
 * envelope to public/metrics.json. Called by `npm run generate-metrics`
 * and runs on prebuild so CF Pages deploys stay current.
 *
 * Run: npx tsx scripts/generate-metrics.ts
 */
import fs from 'fs';
import path from 'path';
import { mockWishlistItems } from '../src/data/mockWishlists';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'public', 'metrics.json');

interface KPI { key: string; label: string; value: number; format: string; priority: number; hint?: string; }

interface Envelope {
  schema: string; productId: string; name: string; updatedAt: string;
  window: { label: string; from: string; to: string };
  health: { status: string; message: string; latencyMs: number; uptimePct24h: number; dependencies: Array<{ id: string; status: string; detail: string }>; };
  kpis: KPI[]; series: Array<Record<string, unknown>>; funnels: Array<Record<string, unknown>>;
  segments: Array<Record<string, unknown>>; offers: Array<Record<string, unknown>>;
  education: Array<Record<string, unknown>>; links: Array<{ label: string; url: string }>; raw: Record<string, unknown>;
}

function main() {
  const now = new Date();
  const allItems = [];
  const creatorIds = Object.keys(mockWishlistItems);
  for (const id of creatorIds) allItems.push(...(mockWishlistItems[id] || []));
  const funded = allItems.filter(i => i.is_funded);
  const satsRaised = allItems.reduce((s, i) => s + (i.sats_raised || 0), 0);
  const totalTarget = allItems.reduce((s, i) => s + (i.price_sats || 0), 0);
  const envelope: Envelope = {
    schema: 'gab.product-metrics.v1', productId: 'katoa', name: 'Katoa',
    updatedAt: now.toISOString(),
    window: { label: '30d', from: new Date(now.getTime() - 30*86400000).toISOString(), to: now.toISOString() },
    health: { status: 'green', message: 'Generated from app state', latencyMs: 15, uptimePct24h: 99.5,
      dependencies: [{ id: 'cloudflare-pages', status: 'green', detail: 'Auto-deploy' }, { id: 'supabase', status: 'green', detail: 'Data' }] },
    kpis: [
      { key: 'creators_total', label: 'Creators', value: creatorIds.length, format: 'number', priority: 1 },
      { key: 'campaigns_active', label: 'Active campaigns', value: allItems.filter(i => !i.is_funded).length, format: 'number', priority: 1 },
      { key: 'wishlists_total', label: 'Wishlists', value: allItems.length, format: 'number', priority: 2 },
      { key: 'sats_raised_total', label: 'Sats raised', value: satsRaised, format: 'number', priority: 2 },
      { key: 'campaigns_funded', label: 'Funded campaigns', value: funded.length, format: 'number', priority: 3 },
      { key: 'avg_campaign_sats', label: 'Avg campaign', value: allItems.length ? Math.round(totalTarget / allItems.length) : 0, format: 'number', priority: 3 },
      { key: 'funding_rate', label: 'Funding rate', value: allItems.length ? Math.round(funded.length / allItems.length * 100) : 0, format: 'percent', priority: 3 },
    ],
    series: [], funnels: [{ key: 'creator_funnel', label: 'Creator pipeline',
      stages: [{ key: 'visit', label: 'Visit', value: 100 }, { key: 'creator', label: 'Creator', value: creatorIds.length },
        { key: 'wishlist', label: 'Has wishlist', value: allItems.length ? creatorIds.length : 0 },
        { key: 'funded', label: 'Funded', value: funded.length ? Math.min(creatorIds.length, funded.length) : 0 }] }],
    segments: [], offers: [], education: [], links: [],
    raw: {
      demo: true,
      source: 'scripts/generate-metrics.ts + mockWishlists.ts',
      note: 'Sample catalog metrics until Supabase product counters are wired. UI labels these as demo/sample.',
    },
  };
  fs.writeFileSync(OUT, JSON.stringify(envelope, null, 2) + '\n', 'utf-8');
  console.log('public/metrics.json written');
}

main();
