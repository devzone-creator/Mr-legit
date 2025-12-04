const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export interface ApiProduct {
  id: string
  name: string
  description?: string | null
  price: number
  original_price?: number | null
  brand?: string | null
  image_url?: string | null
  colors?: string[] | null
  sizes?: string[] | null
  rating?: number
  review_count?: number
  discount?: number
  is_new?: boolean
  created_at?: string
}

export async function fetchProducts(): Promise<ApiProduct[]> {
  const res = await fetch(`${API_BASE}/api/products`)
  if (!res.ok) {
    throw new Error('Failed to fetch products')
  }
  return res.json()
}


