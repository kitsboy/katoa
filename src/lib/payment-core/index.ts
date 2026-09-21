/**
 * Family Payment Core (Katoa reference lane).
 *
 * Barrel export so consumers import from one place and the provider names stay
 * behind this boundary.
 */
export * from './provider-interface';
export * from './demo-badge';
export * from './payment-labelling';
export { FakeBTCPayRail } from './fake-btcpay-rail';
export type { FakeBTCPayRailOptions } from './fake-btcpay-rail';
