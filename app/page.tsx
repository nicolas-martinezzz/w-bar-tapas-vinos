import Image from "next/image"
import Link from "next/link"
import { MapPin, Phone, Mail, Clock, Instagram } from "lucide-react"
import Hero from "@/components/hero"
import RestaurantSection from "@/components/restaurant-section"
import MenuSection from "@/components/menu-section"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#1a1a1a] text-white">
      <Hero />
      <RestaurantSection />
      <MenuSection />

      {/* Location & Contact */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-[#1a1a1a] border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">Encuéntranos</h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-[#C4A962] mr-4 mt-1 flex-shrink-0" />
                  <p className="text-[#8C8C8C]">Av. del Libertador 14658, B1641 Acassuso, Provincia de Buenos Aires, Argentina</p>
                </div>
                <div className="flex items-start">
                  <Phone className="h-6 w-6 text-[#C4A962] mr-4 mt-1 flex-shrink-0" />
                  <p className="text-[#8C8C8C]">+54 11 3939-5205</p>
                </div>
                <div className="flex items-start">
                  <Mail className="h-6 w-6 text-[#C4A962] mr-4 mt-1 flex-shrink-0" />
                  <p className="text-[#8C8C8C]">wbardetapasyvinos@gmail.com</p>
                </div>
                <div className="flex items-start">
                  <Clock className="h-6 w-6 text-[#C4A962] mr-4 mt-1 flex-shrink-0" />
                  <div className="text-[#8C8C8C]">
                    <p>Lunes - Jueves: 20:00 - 00:00</p>
                    <p>Viernes - Sábado: 20:00 - 01:00</p>
                    <p>Domingo: Cerrado</p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-4">
                <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[#C4A962] hover:text-[#D4BC7B] transition-colors">
                  <Instagram className="h-6 w-6" />
                  <span className="sr-only">Instagram</span>
                </Link>
                
              </div>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image
                src="/images/mapa_w.png"
                alt="Ubicación de W Bar"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
