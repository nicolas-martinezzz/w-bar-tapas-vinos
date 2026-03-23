import { RestaurantInfo, OpeningHours, NavItem, GalleryImage } from "@/types/restaurant"

export const BASE_URL = "https://wbardetapasyvinos.com"
export const GA_ID = "G-LVCGEB768Y"

/** Used for Open-Meteo (admin weather). Override with NEXT_PUBLIC_RESTAURANT_LAT / LNG if needed. */
export const RESTAURANT_COORDINATES = {
  latitude: Number(process.env.NEXT_PUBLIC_RESTAURANT_LAT ?? -34.5132),
  longitude: Number(process.env.NEXT_PUBLIC_RESTAURANT_LNG ?? -58.6085),
} as const

export const restaurant: RestaurantInfo = {
  name: "W Bar",
  tagline: "Una experiencia única en el corazón de San Isidro",
  address: "Av. del Libertador 14658",
  neighborhood: "B1641 Acassuso",
  city: "San Isidro",
  country: "Provincia de Buenos Aires, Argentina",
  phone: "+54 11 3939-5205",
  email: "wbardetapasyvinos@gmail.com",
  whatsapp: "https://api.whatsapp.com/send/?phone=541139395205&app_absent=0",
  instagram: "https://www.instagram.com/wbardetapasyvinos/",
  pedidodirecto: "https://pedidodirecto.app/w",
  url: BASE_URL,
}

export const openingHours: OpeningHours[] = [
  { days: "Lunes - Jueves", hours: "20:00 - 00:00" },
  { days: "Viernes - Sábado", hours: "20:00 - 01:00" },
  { days: "Domingo", hours: "Cerrado" },
]

export const navItems: NavItem[] = [
  { label: "Inicio", href: "/#hero" },
  { label: "Restaurante", href: "/#restaurante" },
  { label: "Menú", href: "/#menu" },
  { label: "Vinoteca", href: "https://pedidodirecto.app/w", external: true },
]

export const galleryImages: GalleryImage[] = [
  { src: "/images/interior_1.png", alt: "Interior del restaurante" },
  { src: "/images/interior_2.png", alt: "Platos especiales" },
  { src: "/images/interior_3.png", alt: "Ambiente del bar" },
  { src: "/images/plato_1.png", alt: "Detalles de la cocina" },
]

export const socialLinks = {
  instagram: {
    href: "https://www.instagram.com/wbardetapasyvinos/",
    label: "Instagram",
  },
}
