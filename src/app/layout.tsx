import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Montserrat } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { restaurant, BASE_URL, GA_ID } from "@/config/restaurant"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
})

export const metadata: Metadata = {
  title: `${restaurant.name} de tapas y vinos - ${restaurant.city}`,
  description: `Disfrutá de tapas creativas, vinos selectos y una experiencia gastronómica única en ${restaurant.name}, ${restaurant.city}, ${restaurant.country}. ${restaurant.address}.`,
  keywords: [
    restaurant.name,
    "restaurante San Isidro",
    "tapas Buenos Aires",
    "vinos argentinos",
    "bar San Isidro",
    "vinoteca Acassuso",
    "comida española Buenos Aires",
    "tapas y vinos",
  ],
  openGraph: {
    title: `${restaurant.name} de tapas y vinos`,
    description: `Tapas creativas y selección de vinos en ${restaurant.city}. ${restaurant.address}.`,
    url: BASE_URL,
    siteName: restaurant.name,
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${restaurant.name} de tapas y vinos`,
    description: `Tapas creativas y selección de vinos en ${restaurant.city}.`,
  },
  robots: {
    index: true,
    follow: true,
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: `${restaurant.name} de tapas y vinos`,
  image: "/images/w_logo.jpg",
  address: {
    "@type": "PostalAddress",
    streetAddress: restaurant.address,
    addressLocality: restaurant.neighborhood,
    addressRegion: "Buenos Aires",
    addressCountry: "AR",
  },
  telephone: restaurant.phone,
  email: restaurant.email,
  url: BASE_URL,
  servesCuisine: ["Española", "Tapas", "Argentina"],
  priceRange: "$$",
  hasMenu: `${BASE_URL}/#menu`,
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "20:00",
      closes: "00:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Friday", "Saturday"],
      opens: "20:00",
      closes: "01:00",
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${playfair.variable} ${montserrat.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `,
        }} />
      </head>
      <body className="bg-stone-950 text-stone-100 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
