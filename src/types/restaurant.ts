export interface Product {
  nombre: string
  descripcion?: string
  precio: number | null
}

export interface Category {
  categoria: string
  productos: Product[]
}

export interface WineProduct {
  nombre: string
  precio: number | null
}

export interface WineCategory {
  subcategoria: string
  productos: WineProduct[]
}

export interface RestaurantInfo {
  name: string
  tagline: string
  address: string
  neighborhood: string
  city: string
  country: string
  phone: string
  email: string
  whatsapp: string
  instagram: string
  pedidodirecto: string
  url: string
}

export interface OpeningHours {
  days: string
  hours: string
}

export interface NavItem {
  label: string
  href: string
  external?: boolean
}

export interface GalleryImage {
  src: string
  alt: string
}
