"use client"

import Image from "next/image"
import { Button } from "./ui/button"
import { useState } from "react"
import { ImageModal } from "./ui/image-modal"
import { galleryImages } from "@/config/restaurant"

export default function RestaurantSection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <>
      <section id="restaurante" className="py-24 bg-[#1a1a1a] border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-white">
                Nuestra Historia
              </h2>
              <p className="text-lg text-[#8C8C8C] mb-6 leading-relaxed">
                En el corazón de San Isidro, W Bar nace de la pasión por la gastronomía española
                y los vinos excepcionales. Un espacio donde la tradición se encuentra con la
                innovación, creando experiencias únicas para nuestros comensales.
              </p>
              <p className="text-lg text-[#8C8C8C] mb-8 leading-relaxed">
                Nuestro chef combina técnicas modernas con recetas tradicionales,
                seleccionando cuidadosamente ingredientes locales de la más alta calidad para
                crear tapas que sorprenden y deleitan.
              </p>
              <Button
                variant="default"
                size="lg"
                className="bg-[#C4A962] hover:bg-[#D4BC7B] text-white transition-colors"
                asChild
              >
                <a href="#menu">Descubre Nuestro Menú</a>
              </Button>
            </div>

            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div
                  className="relative h-48 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
                  onClick={() => setSelectedImage(galleryImages[0].src)}
                >
                  <Image
                    src={galleryImages[0].src}
                    alt={galleryImages[0].alt}
                    fill
                    className="object-cover"
                  />
                </div>
                <div
                  className="relative h-64 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
                  onClick={() => setSelectedImage(galleryImages[1].src)}
                >
                  <Image
                    src={galleryImages[1].src}
                    alt={galleryImages[1].alt}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div
                  className="relative h-64 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
                  onClick={() => setSelectedImage(galleryImages[2].src)}
                >
                  <Image
                    src={galleryImages[2].src}
                    alt={galleryImages[2].alt}
                    fill
                    className="object-cover"
                  />
                </div>
                <div
                  className="relative h-48 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
                  onClick={() => setSelectedImage(galleryImages[3].src)}
                >
                  <Image
                    src={galleryImages[3].src}
                    alt={galleryImages[3].alt}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {selectedImage && (
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          src={selectedImage}
          alt={galleryImages.find(img => img.src === selectedImage)?.alt || "Imagen del restaurante"}
        />
      )}
    </>
  )
}
