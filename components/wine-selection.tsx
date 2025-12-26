"use client"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const ARS = (valor: number) => `$${valor.toLocaleString('es-AR')} ARS`;

// Datos estructurados de los vinos
const wines = {
  tintos: {
    "Vinos Jóvenes": [
      {
        name: "Rioja Joven",
        do: "D.O.Ca. Rioja",
        description: "Tempranillo joven con notas frescas de frutos rojos.",
        bottlePrice: 22,
        glassPrice: 4.5,
      }
    ],
    "Crianza": [
      {
        name: "Rioja Reserva",
        do: "D.O.Ca. Rioja",
        description: "Tempranillo con notas de frutos rojos maduros, vainilla y especias.",
        bottlePrice: 28,
        glassPrice: 6,
      },
      {
        name: "Ribera del Duero",
        do: "D.O. Ribera del Duero",
        description: "Tinto fino con 14 meses en barrica, potente y elegante.",
        bottlePrice: 32,
        glassPrice: 7,
      }
    ],
    "Premium": [
      {
        name: "Priorat",
        do: "D.O.Q. Priorat",
        description: "Garnacha y Cariñena con intensos aromas minerales y frutos negros.",
        bottlePrice: 36,
        glassPrice: 8,
      },
      {
        name: "Montsant",
        do: "D.O. Montsant",
        description: "Coupage mediterráneo con carácter frutal y especiado.",
        bottlePrice: 34,
        glassPrice: 7.5,
      }
    ]
  },
  blancos: {
    "Frescos y Aromáticos": [
      {
        name: "Albariño",
        do: "D.O. Rías Baixas",
        description: "Fresco y aromático con notas de frutas blancas y cítricos.",
        bottlePrice: 24,
        glassPrice: 5,
      },
      {
        name: "Verdejo",
        do: "D.O. Rueda",
        description: "Aromático y fresco con notas herbáceas y de fruta tropical.",
        bottlePrice: 22,
        glassPrice: 4.5,
      }
    ],
    "Con Crianza": [
      {
        name: "Penedès Chardonnay",
        do: "D.O. Penedès",
        description: "Chardonnay con crianza sobre lías, untuoso y elegante.",
        bottlePrice: 26,
        glassPrice: 5.5,
      }
    ],
    "Minerales": [
      {
        name: "Godello",
        do: "D.O. Valdeorras",
        description: "Mineral y complejo con notas de manzana verde y hierbas aromáticas.",
        bottlePrice: 28,
        glassPrice: 6,
      }
    ]
  },
  rosados: {
    "Frescos": [
      {
        name: "Navarra Rosado",
        do: "D.O. Navarra",
        description: "Garnacha rosada con aromas de frutos rojos frescos y flores.",
        bottlePrice: 22,
        glassPrice: 4.5,
      },
      {
        name: "Empordà Rosado",
        do: "D.O. Empordà",
        description: "Rosado mediterráneo con carácter frutal y final fresco.",
        bottlePrice: 24,
        glassPrice: 5,
      }
    ]
  },
  cavas: {
    "Tradicionales": [
      {
        name: "Cava Brut Nature",
        do: "D.O. Cava",
        description: "Elegante y seco con finas burbujas y notas de manzana verde.",
        bottlePrice: 26,
        glassPrice: 5.5,
      }
    ],
    "Reserva": [
      {
        name: "Cava Reserva",
        do: "D.O. Cava",
        description: "Complejo y estructurado con 24 meses de crianza y notas tostadas.",
        bottlePrice: 32,
        glassPrice: 7,
      }
    ],
    "Especiales": [
      {
        name: "Cava Rosado",
        do: "D.O. Cava",
        description: "Fresco y afrutado con notas de frutos rojos y un final largo.",
        bottlePrice: 28,
        glassPrice: 6,
      }
    ]
  }
}

export default function WineSelection() {
  return (
    <section id="wines" className="py-20 px-4 md:px-8 lg:px-16 bg-stone-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-800 mb-4">Nuestra Bodega</h2>
          <p className="max-w-2xl mx-auto text-stone-600">
            Descubre nuestra cuidada selección de vinos locales e internacionales, elegidos para complementar
            perfectamente nuestra oferta gastronómica.
          </p>
        </div>

        <Tabs defaultValue="tintos" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="tintos" className="font-serif">
              Tintos
            </TabsTrigger>
            <TabsTrigger value="blancos" className="font-serif">
              Blancos
            </TabsTrigger>
            <TabsTrigger value="rosados" className="font-serif">
              Rosados
            </TabsTrigger>
            <TabsTrigger value="cavas" className="font-serif">
              Cavas
            </TabsTrigger>
          </TabsList>

          {Object.entries(wines).map(([category, subcategories]) => (
            <TabsContent key={category} value={category}>
              {Object.entries(subcategories).map(([subcategory, wineList]) => (
                <div key={subcategory} className="mb-12">
                  <h3 className="font-serif text-2xl font-bold text-stone-800 mb-6 border-b border-stone-200 pb-2">
                    {subcategory}
                  </h3>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
              }}
            >
                    {wineList.map((wine) => (
            <motion.div
                        key={wine.name}
                        variants={fadeIn}
                        className="bg-white p-6 rounded-lg shadow-sm flex gap-4"
                      >
                        <div className="relative w-16 h-32 flex-shrink-0">
                          <Image
                            src="/images/vinos/vino-generico.jpg"
                            alt={`Botella de ${wine.name}`}
                            fill
                            className="object-contain rounded"
                          />
                </div>
                <div>
                          <h3 className="font-serif text-xl font-bold mb-1">{wine.name}</h3>
                          <p className="text-stone-500 text-sm mb-2">{wine.do}</p>
                          <p className="text-stone-600 text-sm mb-3">{wine.description}</p>
                </div>
              </motion.div>
                    ))}
              </motion.div>
                </div>
              ))}
          </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
