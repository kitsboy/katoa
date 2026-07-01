export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      contributions: {
        Row: {
          amount_sats: number
          contributor_email: string | null
          contributor_id: string | null
          contributor_name: string | null
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          message: string | null
          metadata: Json | null
          payment_hash: string | null
          status: string | null
          wishlist_id: string
        }
        Insert: {
          amount_sats: number
          contributor_email?: string | null
          contributor_id?: string | null
          contributor_name?: string | null
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          metadata?: Json | null
          payment_hash?: string | null
          status?: string | null
          wishlist_id: string
        }
        Update: {
          amount_sats?: number
          contributor_email?: string | null
          contributor_id?: string | null
          contributor_name?: string | null
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          metadata?: Json | null
          payment_hash?: string | null
          status?: string | null
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contributions_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_entries: {
        Row: {
          id: string
          period: string
          rank: number | null
          total_contributed: number | null
          updated_at: string | null
          user_id: string
          wishlists_supported: number | null
        }
        Insert: {
          id?: string
          period?: string
          rank?: number | null
          total_contributed?: number | null
          updated_at?: string | null
          user_id: string
          wishlists_supported?: number | null
        }
        Update: {
          id?: string
          period?: string
          rank?: number | null
          total_contributed?: number | null
          updated_at?: string | null
          user_id?: string
          wishlists_supported?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          address: string
          created_at: string
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          label: string
          metadata: Json | null
          method_type: Database["public"]["Enums"]["payment_method_type"]
          project_id: string
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          label: string
          metadata?: Json | null
          method_type: Database["public"]["Enums"]["payment_method_type"]
          project_id: string
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          label?: string
          metadata?: Json | null
          method_type?: Database["public"]["Enums"]["payment_method_type"]
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_provider: string | null
          avatar_url: string | null
          banner_url: string | null
          banner_video_url: string | null
          bio: string | null
          created_at: string | null
          id: string
          lightning_address: string | null
          nostr_pubkey: string | null
          nostr_pubkey_verified: boolean | null
          preferred_currency: string | null
          profile_video_url: string | null
          pynym_code: string | null
          social_feed_height: string | null
          social_feed_title: string | null
          social_feed_url: string | null
          updated_at: string | null
          username: string
          video_date: string | null
          video_title: string | null
          xpub_address: string | null
        }
        Insert: {
          auth_provider?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          banner_video_url?: string | null
          bio?: string | null
          created_at?: string | null
          id: string
          lightning_address?: string | null
          nostr_pubkey?: string | null
          nostr_pubkey_verified?: boolean | null
          preferred_currency?: string | null
          profile_video_url?: string | null
          pynym_code?: string | null
          social_feed_height?: string | null
          social_feed_title?: string | null
          social_feed_url?: string | null
          updated_at?: string | null
          username: string
          video_date?: string | null
          video_title?: string | null
          xpub_address?: string | null
        }
        Update: {
          auth_provider?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          banner_video_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          lightning_address?: string | null
          nostr_pubkey?: string | null
          nostr_pubkey_verified?: boolean | null
          preferred_currency?: string | null
          profile_video_url?: string | null
          pynym_code?: string | null
          social_feed_height?: string | null
          social_feed_title?: string | null
          social_feed_url?: string | null
          updated_at?: string | null
          username?: string
          video_date?: string | null
          video_title?: string | null
          xpub_address?: string | null
        }
        Relationships: []
      }
      project_follows: {
        Row: {
          created_at: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_follows_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_follows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          background_url: string | null
          created_at: string
          creator_id: string
          description: string | null
          id: string
          lightning_address: string | null
          nostr_pubkey: string | null
          settings: Json | null
          slug: string
          title: string
          updated_at: string
          visibility: Database["public"]["Enums"]["project_visibility"]
          wallet_address: string | null
        }
        Insert: {
          background_url?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          lightning_address?: string | null
          nostr_pubkey?: string | null
          settings?: Json | null
          slug: string
          title: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["project_visibility"]
          wallet_address?: string | null
        }
        Update: {
          background_url?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          lightning_address?: string | null
          nostr_pubkey?: string | null
          settings?: Json | null
          slug?: string
          title?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["project_visibility"]
          wallet_address?: string | null
        }
        Relationships: []
      }
      shipping_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string
          created_at: string | null
          full_name: string
          id: string
          is_default: boolean | null
          phone: string | null
          postal_code: string
          state: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country?: string
          created_at?: string | null
          full_name: string
          id?: string
          is_default?: boolean | null
          phone?: string | null
          postal_code: string
          state: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string
          created_at?: string | null
          full_name?: string
          id?: string
          is_default?: boolean | null
          phone?: string | null
          postal_code?: string
          state?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount_sats: number
          contributor_name: string | null
          created_at: string | null
          id: string
          item_id: string | null
          message: string | null
          payment_hash: string | null
          payment_method: string | null
          status: string | null
          wishlist_id: string
        }
        Insert: {
          amount_sats: number
          contributor_name?: string | null
          created_at?: string | null
          id?: string
          item_id?: string | null
          message?: string | null
          payment_hash?: string | null
          payment_method?: string | null
          status?: string | null
          wishlist_id: string
        }
        Update: {
          amount_sats?: number
          contributor_name?: string | null
          created_at?: string | null
          id?: string
          item_id?: string | null
          message?: string | null
          payment_hash?: string | null
          payment_method?: string | null
          status?: string | null
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "wishlist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_addresses: {
        Row: {
          address_type: string
          address_value: string
          created_at: string | null
          id: string
          is_active: boolean | null
          label: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_type: string
          address_value: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_type?: string
          address_value?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_categories: {
        Row: {
          category_id: string
          created_at: string | null
          wishlist_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          wishlist_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_categories_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_follows: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
          wishlist_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
          wishlist_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_follows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_follows_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_funded: boolean | null
          merchant_link: string | null
          price_sats: number
          product_url: string | null
          sats_raised: number | null
          shipping_required: boolean | null
          sort_order: number | null
          title: string
          updated_at: string | null
          video_url: string | null
          wishlist_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_funded?: boolean | null
          merchant_link?: string | null
          price_sats: number
          product_url?: string | null
          sats_raised?: number | null
          shipping_required?: boolean | null
          sort_order?: number | null
          title: string
          updated_at?: string | null
          video_url?: string | null
          wishlist_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_funded?: boolean | null
          merchant_link?: string | null
          price_sats?: number
          product_url?: string | null
          sats_raised?: number | null
          shipping_required?: boolean | null
          sort_order?: number | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_media: {
        Row: {
          caption: string | null
          created_at: string | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          item_id: string | null
          media_type: string
          mime_type: string | null
          wishlist_id: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          item_id?: string | null
          media_type: string
          mime_type?: string | null
          wishlist_id?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          item_id?: string | null
          media_type?: string
          mime_type?: string | null
          wishlist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_media_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "wishlist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_media_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_supporters: {
        Row: {
          badges: string[] | null
          contribution_count: number | null
          first_contribution_at: string | null
          id: string
          is_featured: boolean | null
          last_contribution_at: string | null
          supporter_id: string
          total_contributed: number | null
          wishlist_id: string
        }
        Insert: {
          badges?: string[] | null
          contribution_count?: number | null
          first_contribution_at?: string | null
          id?: string
          is_featured?: boolean | null
          last_contribution_at?: string | null
          supporter_id: string
          total_contributed?: number | null
          wishlist_id: string
        }
        Update: {
          badges?: string[] | null
          contribution_count?: number | null
          first_contribution_at?: string | null
          id?: string
          is_featured?: boolean | null
          last_contribution_at?: string | null
          supporter_id?: string
          total_contributed?: number | null
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_supporters_supporter_id_fkey"
            columns: ["supporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_supporters_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_tags: {
        Row: {
          created_at: string | null
          tag_id: string
          wishlist_id: string
        }
        Insert: {
          created_at?: string | null
          tag_id: string
          wishlist_id: string
        }
        Update: {
          created_at?: string | null
          tag_id?: string
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_tags_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_updates: {
        Row: {
          content: string
          created_at: string
          id: string
          media_type: string
          media_url: string | null
          title: string
          updated_at: string
          wishlist_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          media_type?: string
          media_url?: string | null
          title: string
          updated_at?: string
          wishlist_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          media_type?: string
          media_url?: string | null
          title?: string
          updated_at?: string
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_updates_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          city: string | null
          country: string | null
          country_code: string | null
          cover_image: string | null
          cover_video_url: string | null
          created_at: string | null
          creator_id: string
          description: string | null
          id: string
          is_public: boolean | null
          latitude: number | null
          longitude: number | null
          project_id: string | null
          slug: string
          theme_color: string | null
          title: string
          total_sats_goal: number | null
          total_sats_raised: number | null
          updated_at: string | null
          visibility: Database["public"]["Enums"]["wishlist_visibility"]
          wallet_address_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          country_code?: string | null
          cover_image?: string | null
          cover_video_url?: string | null
          created_at?: string | null
          creator_id: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          latitude?: number | null
          longitude?: number | null
          project_id?: string | null
          slug: string
          theme_color?: string | null
          title: string
          total_sats_goal?: number | null
          total_sats_raised?: number | null
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["wishlist_visibility"]
          wallet_address_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          country_code?: string | null
          cover_image?: string | null
          cover_video_url?: string | null
          created_at?: string | null
          creator_id?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          latitude?: number | null
          longitude?: number | null
          project_id?: string | null
          slug?: string
          theme_color?: string | null
          title?: string
          total_sats_goal?: number | null
          total_sats_raised?: number | null
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["wishlist_visibility"]
          wallet_address_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_wallet_address_id_fkey"
            columns: ["wallet_address_id"]
            isOneToOne: false
            referencedRelation: "wallet_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_notification: {
        Args: {
          p_message: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      increment_view_count: {
        Args: { wishlist_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      payment_method_type:
        | "bitcoin_xpub"
        | "bitcoin_address"
        | "lightning"
        | "nostr"
        | "nym"
        | "bolt12"
      project_visibility: "public" | "private" | "draft"
      wishlist_visibility: "public" | "private" | "draft"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      payment_method_type: [
        "bitcoin_xpub",
        "bitcoin_address",
        "lightning",
        "nostr",
        "nym",
        "bolt12",
      ],
      project_visibility: ["public", "private", "draft"],
      wishlist_visibility: ["public", "private", "draft"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const
