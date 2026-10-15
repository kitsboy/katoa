import { supabase, asRows, isSupabaseConfigured } from './supabase';
import { getStorage, setStorage, STORAGE_KEYS } from './storage';
import { usablePaymentAddress, validateSilentPaymentDescriptor } from './validateAddress';
import type { WalletAddress, WalletAddressType } from '../types/database';

/**
 * One place that answers "how can this creator actually get paid?".
 *
 * A creator establishes payment channels in profile settings (Settings → Payment
 * Methods). Lightning, on-chain Bitcoin and silent-payment descriptors all count.
 * The wallet table is the source of truth; device-local wallets are the honest
 * fallback when the live table is unavailable (demo / offline / not configured).
 */

export type ReceiveChannelKind = 'lightning' | 'onchain' | 'silent';

export const RECEIVE_CHANNEL_KINDS: readonly ReceiveChannelKind[] = ['lightning', 'onchain', 'silent'];

/** Minimal shape shared by live rows, local rows, and test fixtures. */
export interface ReceiveAddressLike {
  address_value: string | null;
  address_type: string;
  is_active?: boolean | null;
}

export type ReceiveChannelStatus = Record<ReceiveChannelKind, boolean>;

export function emptyReceiveChannels(): ReceiveChannelStatus {
  return { lightning: false, onchain: false, silent: false };
}

/**
 * A silent-payment descriptor only counts when it is a real descriptor:
 * `silent:`/`sp:` prefixed and not a placeholder.
 */
export function usableSilentPaymentDescriptor(value: string | null | undefined): string | null {
  const trimmed = usablePaymentAddress(value);
  if (!trimmed) return null;
  return validateSilentPaymentDescriptor(trimmed) === null ? trimmed : null;
}

function usableValueForKind(kind: ReceiveChannelKind, value: string | null | undefined): string | null {
  return kind === 'silent' ? usableSilentPaymentDescriptor(value) : usablePaymentAddress(value);
}

/**
 * Which payment channels this creator has really established.
 * Active wallets win; a profile Lightning address still counts as a Lightning channel.
 */
export function establishedReceiveChannels(
  wallets: ReceiveAddressLike[],
  profileLightning?: string | null
): ReceiveChannelStatus {
  const active = wallets.filter((w) => w.is_active !== false);
  const has = (kind: ReceiveChannelKind) =>
    active.some((w) => w.address_type === kind && usableValueForKind(kind, w.address_value) !== null);

  return {
    lightning: has('lightning') || usablePaymentAddress(profileLightning) !== null,
    onchain: has('onchain'),
    silent: has('silent'),
  };
}

export function hasAnyReceiveChannel(channels: ReceiveChannelStatus): boolean {
  return channels.lightning || channels.onchain || channels.silent;
}

export function establishedChannelCount(channels: ReceiveChannelStatus): number {
  return RECEIVE_CHANNEL_KINDS.filter((kind) => channels[kind]).length;
}

/** Device-local wallets stored by the wallet manager. */
export function loadLocalWalletAddresses(userId: string): WalletAddress[] {
  const all = getStorage<WalletAddress[]>(STORAGE_KEYS.walletAddresses, []);
  return all.filter((w) => w.user_id === userId);
}

/** Replace one user's device-local wallets without touching other users' rows. */
export function persistLocalWalletAddresses(userId: string, nextForUser: WalletAddress[]): void {
  const all = getStorage<WalletAddress[]>(STORAGE_KEYS.walletAddresses, []);
  const others = all.filter((w) => w.user_id !== userId);
  setStorage(STORAGE_KEYS.walletAddresses, [...others, ...nextForUser]);
}

export function newLocalWalletAddress(
  userId: string,
  addressType: WalletAddressType,
  addressValue: string,
  label: string
): WalletAddress {
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    user_id: userId,
    address_type: addressType,
    address_value: addressValue,
    label,
    is_active: true,
    created_at: new Date().toISOString(),
  };
}

/**
 * Load the creator's real payment channels for the settings summary.
 * Live table first (when configured), device-local wallets otherwise.
 */
export async function loadEstablishedReceiveChannels(
  userId: string | null | undefined,
  options: { preferLocal?: boolean; profileLightning?: string | null } = {}
): Promise<ReceiveChannelStatus> {
  const { preferLocal = false, profileLightning = null } = options;
  if (!userId) return emptyReceiveChannels();

  if (preferLocal || !isSupabaseConfigured()) {
    return establishedReceiveChannels(loadLocalWalletAddresses(userId), profileLightning);
  }

  try {
    const { data, error } = await supabase
      .from('wallet_addresses')
      .select('address_value, address_type, is_active')
      .eq('user_id', userId);
    if (error) throw error;
    const rows = asRows<ReceiveAddressLike>(data);
    if (rows.length > 0) return establishedReceiveChannels(rows, profileLightning);
  } catch {
    // fall through to device-local wallets
  }

  return establishedReceiveChannels(loadLocalWalletAddresses(userId), profileLightning);
}
