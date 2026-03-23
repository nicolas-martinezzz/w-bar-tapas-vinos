"use client"
import { useState } from "react"
import { cartaComidas } from "@/data/menu"
import { cartaVinos } from "@/data/wines"
import { restaurant } from "@/config/restaurant"

function formatPrice(precio: number | null) {
  if (precio === null) {
    return <span className="text-[#8C8C8C]">Sin stock</span>
  }
  return `$${precio.toLocaleString("es-AR")}`
}

export default function MenuSection() {
  const [categoriaActiva, setCategoriaActiva] = useState(cartaComidas[0].categoria)
  const [subcatVinoActiva, setSubcatVinoActiva] = useState(cartaVinos[0].subcategoria)

  const categoriasComidas = cartaComidas.map(c => c.categoria)
  const productosComidas = cartaComidas.find(c => c.categoria === categoriaActiva)?.productos || []

  const subcategoriasVinos = cartaVinos.map(c => c.subcategoria)
  const productosVinos = cartaVinos.find(c => c.subcategoria === subcatVinoActiva)?.productos || []

  return (
    <section id="menu" className="py-24 bg-black border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-white">
            Nuestra Carta
          </h2>
          <p className="text-lg text-[#8C8C8C] max-w-2xl mx-auto">
            Descubrí nuestra selección de tapas, platos, postres, tragos y más.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categoriasComidas.map(cat => (
            <button
              key={cat}
              className={`px-6 py-2 rounded-full font-serif text-lg border transition-colors ${categoriaActiva === cat ? "bg-[#C4A962] text-black border-[#C4A962]" : "bg-black text-[#C4A962] border-[#C4A962] hover:bg-[#D4BC7B] hover:text-black"}`}
              onClick={() => setCategoriaActiva(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
          {productosComidas.map(prod => (
            <div key={prod.nombre} className="bg-stone-900 rounded-lg p-6 shadow-md flex flex-col gap-2 border border-[#C4A962]/10">
              <div className="flex items-center mb-2 justify-between w-full">
                <h3 className="font-serif text-xl font-bold text-white text-left flex-1">{prod.nombre}</h3>
                {prod.precio !== null && (
                  <span className="text-[#C4A962] font-semibold text-sm">{formatPrice(prod.precio)}</span>
                )}
              </div>
              {prod.descripcion && (
                <p className="text-[#8C8C8C] text-sm text-left">{prod.descripcion}</p>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl font-bold mb-6 text-white">Vinos</h2>
          <p className="text-lg text-[#8C8C8C] max-w-2xl mx-auto mb-8">
            Selección de vinos y espumantes.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {subcategoriasVinos.map(subcat => (
              <button
                key={subcat}
                className={`px-6 py-2 rounded-full font-serif text-lg border transition-colors ${subcatVinoActiva === subcat ? "bg-[#C4A962] text-black border-[#C4A962]" : "bg-black text-[#C4A962] border-[#C4A962] hover:bg-[#D4BC7B] hover:text-black"}`}
                onClick={() => setSubcatVinoActiva(subcat)}
              >
                {subcat}
              </button>
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
            {productosVinos.map(prod => (
              <div key={prod.nombre} className="bg-stone-900 rounded-lg p-6 shadow-md flex flex-col gap-2 border border-[#C4A962]/10">
                <div className="flex items-center mb-2 justify-between w-full">
                  <h3 className="font-serif text-xl font-bold text-white text-left flex-1">{prod.nombre}</h3>
                  <span className="text-[#C4A962] font-semibold text-sm">{formatPrice(prod.precio)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <a
            href={restaurant.pedidodirecto}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-[#C4A962] text-black font-serif text-lg font-bold rounded-lg hover:bg-[#D4BC7B] transition-colors"
          >
            Ver carta completa en PedidoDirecto
          </a>
        </div>
      </div>
    </section>
  )
}
