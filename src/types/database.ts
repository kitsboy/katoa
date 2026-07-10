/**
 * Staged Supabase Database types — regenerate with `npm run db:types` after provisioning.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Visibility = 'public' | 'private' | 'draft';

export type PaymentMethodType =
  | 'bitcoin_xpub'
  | 'bitcoin_address'
  | 'lightning'
  | 'nostr'
  | 'nym'
  | 'bolt12'
  | 'onchain';

export type WalletAddressType = 'lightning' | 'xpub' | 'pynym' | 'nostr' | 'onchain';

type Relationships = [];

type TableDef<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relationships;
};

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<{
        id: string;
        username: string;
        avatar_url: string | null;
        lightning_address: string | null;
        nostr_pubkey: string | null;
        bio: string;
        banner_url: string | null;
        preferred_currency: string | null;
        created_at: string;
        updated_at: string;
      }, {
        id: string;
        username: string;
        avatar_url?: string | null;
        lightning_address?: string | null;
        nostr_pubkey?: string | null;
        bio?: string;
      }>;
      wishlists: TableDef<{
        id: string;
        creator_id: string;
        project_id: string | null;
        title: string;
        description: string;
        slug: string;
        visibility: Visibility;
        cover_image: string | null;
        cover_video_url: string | null;
        theme_color: string | null;
        total_sats_goal: number;
        total_sats_raised: number;
        country: string | null;
        country_code: string | null;
        country_flag: string | null;
        city: string | null;
        latitude: number | null;
        longitude: number | null;
        created_at: string;
      }>;
      wishlist_items: TableDef<{
        id: string;
        wishlist_id: string;
        title: string;
        description: string;
        price_sats: number;
        sats_raised: number;
        image_url: string | null;
        video_url: string | null;
        merchant_link: string | null;
        is_funded: boolean;
        sort_order: number;
      }>;
      wishlist_media: TableDef<{
        id: string;
        wishlist_id: string;
        item_id: string | null;
        media_type: string;
        file_url: string;
        file_name: string;
        file_size: number;
        mime_type: string;
      }>;
      transactions: TableDef<{
        id: string;
        wishlist_id: string;
        item_id: string | null;
        contributor_name: string | null;
        amount_sats: number;
        message: string | null;
        payment_method: string;
        payment_hash: string | null;
        status: string;
        created_at: string;
      }>;
      projects: TableDef<{
        id: string;
        creator_id: string;
        title: string;
        description: string;
        slug: string;
        background_url: string | null;
        wallet_address: string | null;
        lightning_address: string | null;
        nostr_pubkey: string | null;
        visibility: Visibility;
        created_at: string;
      }>;
      payment_methods: TableDef<{
        id: string;
        project_id: string;
        method_type: PaymentMethodType;
        label: string;
        address: string;
        metadata: Json;
        is_primary: boolean;
        is_active: boolean;
        created_at?: string;
      }>;
      wallet_addresses: TableDef<{
        id: string;
        user_id: string;
        address_type: WalletAddressType;
        address_value: string;
        label: string;
        is_active: boolean;
        created_at: string;
      }>;
      notifications: TableDef<{
        id: string;
        user_id: string;
        type: string;
        title: string;
        message: string;
        is_read: boolean;
      }>;
      categories: TableDef<{
        id: string;
        name: string;
        slug: string;
        icon: string | null;
        color: string | null;
      }>;
      project_follows: TableDef<{
        id: string;
        user_id: string;
        project_id: string;
        project_creator_id: string | null;
      }>;
      wishlist_follows: TableDef<{
        id: string;
        user_id: string;
        wishlist_id: string;
      }>;
      follows: TableDef<{
        id: string;
        follower_id: string;
        following_id: string;
        created_at?: string;
      }>;
      /** Alias view (if present) — prefer `follows` */
      user_follows: TableDef<{
        id: string;
        follower_id: string;
        following_id: string;
      }>;
      contributions: TableDef<{
        id: string;
        contributor_id: string;
        wishlist_id: string;
        amount_sats: number;
      }>;
    };
    Views: Record<string, never>;
    Functions: {
      get_wishlist_by_slug: {
        Args: { p_slug: string };
        Returns: Database['public']['Tables']['wishlists']['Row'][];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Wishlist = Database['public']['Tables']['wishlists']['Row'];
export type WishlistItem = Database['public']['Tables']['wishlist_items']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
export type WalletAddress = Database['public']['Tables']['wallet_addresses']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type WishlistMedia = Database['public']['Tables']['wishlist_media']['Row'];