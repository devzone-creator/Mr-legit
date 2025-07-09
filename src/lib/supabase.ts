import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

if (supabaseUrl === 'your_supabase_url_here' || supabaseAnonKey === 'your_supabase_anon_key_here') {
  throw new Error('Please replace the placeholder Supabase credentials in your .env file with actual values from your Supabase project.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          is_active: boolean | null
          created_at: string | null
          description: string | null
        }
        Insert: {
          id?: string
          name: string
          is_active?: boolean | null
          created_at?: string | null
          description?: string | null
        }
        Update: {
          id?: string
          name?: string
          is_active?: boolean | null
          created_at?: string | null
          description?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          role: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          role?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          role?: string | null
          created_at?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number | null
          original_price: number | null
          category: string | null
          brand: string | null
          image_url: string | null
          images: string[] | null
          colors: string[] | null
          sizes: string[] | null
          is_featured: boolean | null
          is_new: boolean | null
          is_active: boolean | null
          discount: number | null
          rating: number | null
          review_count: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price?: number | null
          original_price?: number | null
          category?: string | null
          brand?: string | null
          image_url?: string | null
          images?: string[] | null
          colors?: string[] | null
          sizes?: string[] | null
          is_featured?: boolean | null
          is_new?: boolean | null
          is_active?: boolean | null
          discount?: number | null
          rating?: number | null
          review_count?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number | null
          original_price?: number | null
          category?: string | null
          brand?: string | null
          image_url?: string | null
          images?: string[] | null
          colors?: string[] | null
          sizes?: string[] | null
          is_featured?: boolean | null
          is_new?: boolean | null
          is_active?: boolean | null
          discount?: number | null
          rating?: number | null
          review_count?: number | null
          created_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          total_amount: number | null
          status: string | null
          payment_reference: string | null
          delivery_address: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          total_amount?: number | null
          status?: string | null
          payment_reference?: string | null
          delivery_address?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          total_amount?: number | null
          status?: string | null
          payment_reference?: string | null
          delivery_address?: string | null
          created_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number | null
          price: number | null
          selected_color: string | null
          selected_size: string | null
        }
        Insert: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number | null
          price?: number | null
          selected_color?: string | null
          selected_size?: string | null
        }
        Update: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number | null
          price?: number | null
          selected_color?: string | null
          selected_size?: string | null
        }
      }
    }
  }
}