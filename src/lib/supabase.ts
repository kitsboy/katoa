import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          lightning_address: string | null;
          nostr_pubkey: string | null;
          nostr_pubkey_verified: boolean;
          xpub_address: string | null;
          pynym_code: string | null;
          preferred_currency: string;
          bio: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          lightning_address?: string | null;
          nostr_pubkey?: string | null;
          nostr_pubkey_verified?: boolean;
          xpub_address?: string | null;
          pynym_code?: string | null;
          preferred_currency?: string;
          bio?: string;
        };
        Update: {
          username?: string;
          avatar_url?: string | null;
          lightning_address?: string | null;
          nostr_pubkey?: string | null;
          nostr_pubkey_verified?: boolean;
          xpub_address?: string | null;
          pynym_code?: string | null;
          preferred_currency?: string;
          bio?: string;
        };
      };
      wallet_addresses: {
        Row: {
          id: string;
          user_id: string;
          address_type: 'lightning' | 'xpub' | 'pynym';
          address_value: string;
          label: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          address_type: 'lightning' | 'xpub' | 'pynym';
          address_value: string;
          label?: string;
          is_active?: boolean;
        };
        Update: {
          address_type?: 'lightning' | 'xpub' | 'pynym';
          address_value?: string;
          label?: string;
          is_active?: boolean;
        };
      };
      wishlists: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          description: string;
          slug: string;
          is_public: boolean;
          theme_color: string;
          cover_image: string | null;
          total_sats_goal: number;
          total_sats_raised: number;
          wallet_address_id: string | null;
          country: string | null;
          country_code: string | null;
          city: string | null;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          creator_id: string;
          title: string;
          description?: string;
          slug: string;
          is_public?: boolean;
          theme_color?: string;
          cover_image?: string | null;
          total_sats_goal?: number;
          wallet_address_id?: string | null;
          country?: string | null;
          country_code?: string | null;
          city?: string | null;
          latitude?: number | null;
          longitude?: number | null;
        };
        Update: {
          title?: string;
          description?: string;
          slug?: string;
          is_public?: boolean;
          theme_color?: string;
          cover_image?: string | null;
          total_sats_goal?: number;
          wallet_address_id?: string | null;
          country?: string | null;
          country_code?: string | null;
          city?: string | null;
          latitude?: number | null;
          longitude?: number | null;
        };
      };
      wishlist_items: {
        Row: {
          id: string;
          wishlist_id: string;
          title: string;
          description: string;
          price_sats: number;
          sats_raised: number;
          image_url: string | null;
          product_url: string | null;
          merchant_link: string | null;
          shipping_required: boolean;
          sort_order: number;
          is_funded: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          wishlist_id: string;
          title: string;
          description?: string;
          price_sats: number;
          image_url?: string | null;
          product_url?: string | null;
          merchant_link?: string | null;
          shipping_required?: boolean;
          sort_order?: number;
        };
        Update: {
          title?: string;
          description?: string;
          price_sats?: number;
          image_url?: string | null;
          product_url?: string | null;
          merchant_link?: string | null;
          shipping_required?: boolean;
          sort_order?: number;
        };
      };
      transactions: {
        Row: {
          id: string;
          wishlist_id: string;
          item_id: string | null;
          contributor_name: string;
          amount_sats: number;
          message: string;
          payment_method: string;
          payment_hash: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          wishlist_id: string;
          item_id?: string | null;
          contributor_name?: string;
          amount_sats: number;
          message?: string;
          payment_method?: string;
          payment_hash?: string | null;
          status?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
      };
      shipping_addresses: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          phone: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          full_name: string;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          state: string;
          postal_code: string;
          country?: string;
          phone?: string | null;
          is_default?: boolean;
        };
        Update: {
          full_name?: string;
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          phone?: string | null;
          is_default?: boolean;
        };
      };
    };
  };
};
