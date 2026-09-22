/**
 * Katoa's fake payment plug. Demo only. Income lands on wallet `katoa`
 * and UTXO set `utxo:katoa`. The browser must not mark this paid.
 */
import { createFakePlug } from './family-payment-core.mjs';

export const paymentPlug = createFakePlug('katoa');
