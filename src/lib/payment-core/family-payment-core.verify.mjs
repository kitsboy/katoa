import assert from 'node:assert/strict';
import test from 'node:test';
import { INCOME_STREAMS, assertUniqueIncomeStreams, createFakePlug, paymentLabel } from './family-payment-core.mjs';

const SITES = ['giveabit', 'satohash', 'stranded', 'sherpacarta', 'openstrata', 'tadbuy', 'katoa', 'motopass'];

test('wallets and UTXO sets are unique', () => {
  assert.doesNotThrow(() => assertUniqueIncomeStreams());
  assert.equal(INCOME_STREAMS.hq.receives, false);
});

test('each site gets its own demo label, wallet, and UTXO set', async () => {
  const labels = [];
  const wallets = [];
  const utxo = [];
  for (const site of SITES) {
    const plug = createFakePlug(site);
    const intent = await plug.createIntent({ amountSats: 1000, rail: 'lightning', kind: 'donation' });
    assert.equal(intent.state, 'pending');
    assert.equal(intent.provider, INCOME_STREAMS[site].plug);
    assert.equal(intent.metadata.mode, 'demo');
    assert.equal(intent.metadata.walletId, INCOME_STREAMS[site].walletId);
    assert.equal(intent.metadata.utxoSet, INCOME_STREAMS[site].utxoSet);
    assert.match(intent.metadata.reference, /-demo$/);
    assert.match(intent.metadata.label, /-DEMO /);
    assert.equal(intent.metadata.label.includes('KATOA'), site === 'katoa');
    labels.push(intent.metadata.label);
    wallets.push(intent.metadata.walletId);
    utxo.push(intent.metadata.utxoSet);
    const status = await plug.getStatus(intent.id);
    assert.equal(status.state, 'pending');
    const events = await plug.listEvents(intent.id);
    assert.equal(events.length, 1);
    const settled = await plug.settleForFixture(intent.id);
    assert.equal(settled.state, 'settled');
    assert.equal(settled.metadata.mode, 'demo');
  }
  assert.equal(new Set(labels).size, SITES.length);
  assert.equal(new Set(wallets).size, SITES.length);
  assert.equal(new Set(utxo).size, SITES.length);
});

test('on-chain fake settle passes through confirming', async () => {
  const plug = createFakePlug('openstrata');
  const intent = await plug.createIntent({ amountSats: 500, rail: 'onchain' });
  await plug.settleForFixture(intent.id);
  const events = await plug.listEvents(intent.id);
  assert.ok(events.some((event) => event.state === 'confirming'));
  assert.equal((await plug.getStatus(intent.id)).state, 'settled');
});

test('HQ cannot receive', () => {
  assert.throws(() => createFakePlug('hq'), /does not receive/);
});

test('motopass label is not Katoa', () => {
  const label = paymentLabel({ site: 'motopass', kind: 'gift', seq: 1, demo: true });
  assert.equal(label, 'MOTOPASS-DEMO mp-g-000001-demo');
  assert.equal(label.includes('KATOA'), false);
});
