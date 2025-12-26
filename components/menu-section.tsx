'use client';
import { useState } from "react";

const cartaComidas = [
  {
    categoria: "Tapas",
    productos: [
      { nombre: "Burrata Italiana", descripcion: "Pesto de albahaca, cherry confitado, jamón crudo, rúcula fresca.", precio: 21000 },
      { nombre: "Camembert Horneado", descripcion: "Con espejo de miel, chutney de morrón y reducción de aceto.", precio: 19500 },
      { nombre: "Provoleta Santa Rosa", descripcion: "Morrones asados, orégano fresco de la huerta.", precio: 18000 },
      { nombre: "Bastones de polenta frita", descripcion: "Bake de kale crocante, fileto y pesto.", precio: 8000 },
      { nombre: "Tortilla de papas babé", descripcion: "Pimentón ahumado, jamón crudo, rúcula fresca.", precio: 11000 },
      { nombre: "Huevos rotos", descripcion: "Papas españolas, jamón y huevos fritos.", precio: 11000 },
      { nombre: "Croquetas de puerro", descripcion: "Con chutney de morrón.", precio: 8500 },
      { nombre: "Croquetas de morcilla al panko", descripcion: "Con chutney de pera.", precio: 9500 },
      { nombre: "Croquetas de pescado blanco de mar", descripcion: "Picle picado y alioli.", precio: 9000 },
      { nombre: "Portobellos gigantes", descripcion: "Relleno de espinaca, gratinados con Sardo.", precio: 12000 },
      { nombre: "Albóndigas de bondiola", descripcion: "Con salsa barbacoa casera.", precio: 11000 },
      { nombre: "Langostinos empanados", descripcion: "Con alioli.", precio: 12500 },
      { nombre: "Gambas al ajillo", descripcion: "Con papas españolas.", precio: 13000 },
      { nombre: "Vieras a la parmesana", descripcion: "Cocción a la provenzal.", precio: 9500 },
      { nombre: "Rabas a la romana", descripcion: "Con alioli casero.", precio: 10000 },
      { nombre: "Bombas de papa", descripcion: "Con chutnev de zanahoria.", precio: 7500 },
      { nombre: "Batatas bravas", descripcion: "Con picamiel de jalapeño.", precio: 7500 },
      { nombre: "Empanadas de osobuco x 2", descripcion: "Braseada con vegetales, 4 horas de cocción lenta.", precio: 6000 },
      { nombre: "Mejillones al azafrán", descripcion: "Lenta cocción con caldo de ajo.", precio: 9000 },
    ]
  },
  {
    categoria: "Ensaladas",
    productos: [
      { nombre: "Ensalada Francesa", descripcion: "Queso azul, peras en almíbar y espinaca", precio: 10000 },
      { nombre: "Ensalada Ibérica", descripcion: "Jamón crudo, tomate cherry confitado, rúcula.", precio: 12000 },
      { nombre: "Ensalada porteña", descripcion: "Rúcula y queso parmesano.", precio: 9000 },
    ]
  },
  {
    categoria: "Principales",
    productos: [
      { nombre: "Milanesa de bife de chorizo napolitana y pesto", descripcion: "Con papas fritas o ensalada.", precio: 20000 },
      { nombre: "Sorrentinos de calabaza y queso azul", descripcion: "Salsa rosa o a elección.", precio: 12000 },
      { nombre: "Sorrentinos negros de salmón", descripcion: "A la crema gratinada.", precio: 21000 },
      { nombre: "Paella de mariscos", descripcion: "Surtido de mar.", precio: 17000 },
      { nombre: "Rissoto de hongos", descripcion: "Portobellos en trozos.", precio: 15000 },
    ]
  },
  {
    categoria: "Postres",
    productos: [
      { nombre: "Crema Catalana", descripcion: "Con azúcar quemada.", precio: 8000 },
      { nombre: "Volcán de chocolate", descripcion: "Con helado de pistacho.", precio: 9000 },
      { nombre: "Brownie Tibio", descripcion: "Con helado de crema americana.", precio: 7000 },
    ]
  },
  {
    categoria: "Tragos",
    productos: [
      { nombre: "Cynarazo", descripcion: "Cynar, tónica, limón", precio: 7500 },
      { nombre: "Negroni", descripcion: "Gin, Campari, Martini Rosso, rodaja de naranja.", precio: 10000 },
      { nombre: "Cuba Libre", descripcion: "Ron, Coca Cola Y Rodaja De Lima", precio: 9500 },
      { nombre: "Americano", descripcion: "Campari, Martini Rosso, limón , soda.", precio: 6500 },
      { nombre: "Martini Blanco Tonic", descripcion: "Martini blanco, limón, soda.", precio: 7500 },
      { nombre: "Fernet con Coca", descripcion: "Fernet, coca cola de vidrio.", precio: 7500 },
      { nombre: "Campari Spritz", descripcion: "Campari, tónica.", precio: 9000 },
      { nombre: "Aperol Spritz", descripcion: "Aperol, Champagne, soda, rodaja de naranja.", precio: 9000 },
      { nombre: "Jagger Tonic", descripcion: "Jaggermaister, tónica.", precio: 11000 },
      { nombre: "Gordon Tonic", descripcion: "Gin Gordons, tónica.", precio: 6500 },
      { nombre: "Beefeater Tonic", descripcion: "Gin Beefeater, tónica.", precio: 10000 },
      { nombre: "Bombay Tonic", descripcion: "Gin Bombay, tónica.", precio: 13000 },
    ]
  },
  {
    categoria: "Whiskies & Bourbon",
    productos: [
      { nombre: "Johnnie Walker Red", descripcion: "", precio: 9000 },
      { nombre: "Johnnie Walker Black", descripcion: "", precio: 13000 },
      { nombre: "Jim Beam", descripcion: "", precio: 8000 },
      { nombre: "Jack Daniels", descripcion: "", precio: 9500 },
      { nombre: "Ballantines 7 years", descripcion: "Bourbon finish", precio: 8500 },
      { nombre: "J&B", descripcion: "", precio: 6500 },
      { nombre: "Chivas Regal", descripcion: "", precio: 12000 },
      { nombre: "Jameson", descripcion: "", precio: 7500 },
    ]
  },
  {
    categoria: "Cervezas",
    productos: [
      { nombre: "Heineken 0%", descripcion: "Cerveza sin alcohol", precio: 6000 },
      { nombre: "Heineken", descripcion: "Lata 473cc", precio: 7000 },
      { nombre: "IPA Imperial", descripcion: "Lata 473cc", precio: 7000 },
    ]
  },
  {
    categoria: "Bebidas sin alcohol",
    productos: [
      { nombre: "Agua con o sin gas", descripcion: "", precio: 3000 },
      { nombre: "Gaseosas", descripcion: "Línea Coca Cola vidrio 330ml.", precio: 4000 },
      { nombre: "Agua saborizada", descripcion: "", precio: 3500 },
    ]
  },
  {
    categoria: "Infusiones",
    productos: [
      { nombre: "Café", descripcion: "", precio: 3500 },
    ]
  },
];

const cartaVinos = [
  {
    subcategoria: "Espumantes",
    productos: [
      { nombre: "Casa Boher Extra Brut", precio: 34000 },
      { nombre: "Chandon Extra Brut", precio: 24000 },
      { nombre: "Norton Cosecha Especial Brut Nature", precio: 24000 },
      { nombre: "Norton Gruner Veltliner", precio: 23000 },
      { nombre: "Rosell Boher", precio: 40000 },
      { nombre: "Saint Felicien Nature", precio: 25000 },
      { nombre: "Xumex", precio: 18000 },
    ]
  },
  {
    subcategoria: "Blancos",
    productos: [
      { nombre: "Altosur (Sauvignon Blanc)", precio: 15000 },
      { nombre: "Escorihuela (Viognier)", precio: 19000 },
      { nombre: "Escorihuela (Chardonnay)", precio: 23000 },
      { nombre: "Esmeralda (Chardonnay)", precio: 13000 },
      { nombre: "Finca Camuñas (Blend De Blancas)", precio: 19000 },
      { nombre: "La Marchigiana (Chardonnay)", precio: 21000 },
      { nombre: "LaMuchi (Sauvignon Blanc)", precio: 17000 },
      { nombre: "Nicasia (Blanc De Blancs)", precio: 19000 },
      { nombre: "Pulenta (Pinot Gris)", precio: 27000 },
      { nombre: "Sombrero (Sauvignon Blanc)", precio: 14500 },
      { nombre: "Sophenia (Chardonnay)", precio: 17000 },
      { nombre: "Tilia (Orgánico Chinin)", precio: 16500 },
    ]
  },
  {
    subcategoria: "Rosé",
    productos: [
      { nombre: "Altosur (Malbec Rosé)", precio: 15000 },
      { nombre: "Ambiguo", precio: 15500 },
      { nombre: "Enhorabuena", precio: 15000 },
      { nombre: "Humberto Canale (Old Vineyard)", precio: 18000 },
    ]
  },
  {
    subcategoria: "Naranjo",
    productos: [
      { nombre: "La Mala María", precio: 21200 },
    ]
  },
  {
    subcategoria: "Malbec",
    productos: [
      { nombre: "Abismo Finca La Ciénaga", precio: 56000 },
      { nombre: "Alavida Orgánico", precio: 23000 },
      { nombre: "Biutiful", precio: 21200 },
      { nombre: "D.V. Catena", precio: 34000 },
      { nombre: "El Enemigo", precio: null },
      { nombre: "Escorihuela Gascón G.R.", precio: 28000 },
      { nombre: "Esmeralda", precio: 15000 },
      { nombre: "Finca Flichman G.R.", precio: 20000 },
      { nombre: "Helios (Bodega Puna)", precio: 16000 },
      { nombre: "Lagarde Primeras Viñas", precio: 75000 },
      { nombre: "Lagarde Malbec Orgánico", precio: 23000 },
      { nombre: "La Marchigiana", precio: 29000 },
      { nombre: "Le Mal Du Bec", precio: 18000 },
      { nombre: "Malbec Argentino", precio: 110000 },
      { nombre: "Ruca Malen", precio: 15000 },
      { nombre: "Sombrero", precio: 18000 },
      { nombre: "Sophenia", precio: 21000 },
      { nombre: "Tilia Orgánico", precio: 16500 },
      { nombre: "Tomero", precio: 16000 },
      { nombre: "Xumek", precio: 18000 },
    ]
  },
  {
    subcategoria: "Cabernet Franc",
    productos: [
      { nombre: "Angelica Zapata", precio: 40000 },
      { nombre: "Desfachatados", precio: 26000 },
      { nombre: "Domaine Bousquet G.R. (Orgánico)", precio: 18000 },
      { nombre: "Gran Sombrero", precio: 21000 },
      { nombre: "Pala Corazón (Bodega Niven Wine)", precio: 17500 },
      { nombre: "Zolo (Reserva)", precio: 23000 },
    ]
  },
  {
    subcategoria: "Bonarda",
    productos: [
      { nombre: "Altosur", precio: 16000 },
      { nombre: "Corazón Valiente (Humahuaca)", precio: 22600 },
      { nombre: "Saint Felicien", precio: 30000 },
    ]
  },
  {
    subcategoria: "Cabernet Sauvignon",
    productos: [
      { nombre: "Charata", precio: 30000 },
      { nombre: "D.V. Catena", precio: 28300 },
      { nombre: "Esmeralda", precio: 15000 },
      { nombre: "Extraterrestre (Domaine Bousquet)", precio: 16000 },
      { nombre: "Tapiz Alta Colección", precio: 17500 },
    ]
  },
  {
    subcategoria: "Petit Verdot",
    productos: [
      { nombre: "Antigua", precio: 18000 },
      { nombre: "Casir Dos Santos (Reserva)", precio: 18000 },
      { nombre: "Gran Tomero", precio: 24000 },
      { nombre: "Serbal", precio: 18000 },
    ]
  },
  {
    subcategoria: "Merlot",
    productos: [
      { nombre: "Angelica Zapata", precio: 37000 },
      { nombre: "Lagarde", precio: 16000 },
      { nombre: "Zorro y Arena", precio: 20000 },
    ]
  },
  {
    subcategoria: "Tannat",
    productos: [
      { nombre: "Coquena (San Pedro de Yacochuya)", precio: 13000 },
      { nombre: "Extraterrestre (Familia Novello)", precio: 17000 },
    ]
  },
  {
    subcategoria: "Syrah",
    productos: [
      { nombre: "Benegas", precio: 24000 },
      { nombre: "Casimiro (Las Cambachas)", precio: 19000 },
      { nombre: "Escorihuela Gascón", precio: 19000 },
      { nombre: "Xumek", precio: 16000 },
    ]
  },
  {
    subcategoria: "Pinot Noir",
    productos: [
      { nombre: "Proyecto Hermanas", precio: 45000 },
    ]
  },
  {
    subcategoria: "Criolla",
    productos: [
      { nombre: "Criolla Argentina Reserva", precio: 17000 },
      { nombre: "El Cansao", precio: 18000 },
    ]
  },
  {
    subcategoria: "Barbera",
    productos: [
      { nombre: "Escorihuela Gascón (Pequeñas Producciones)", precio: 42000 },
    ]
  },
  {
    subcategoria: "Lambrusco Maestri",
    productos: [
      { nombre: "Aquí Estamos Todos Locos", precio: 15500 },
    ]
  },
  {
    subcategoria: "Garnacha",
    productos: [
      { nombre: "D.V. Catena", precio: 35000 },
    ]
  },
  {
    subcategoria: "Marselan",
    productos: [
      { nombre: "La Mala María", precio: 20000 },
    ]
  },
  {
    subcategoria: "Graciana",
    productos: [
      { nombre: "La Mala María", precio: 20000 },
    ]
  },
  {
    subcategoria: "Blends",
    productos: [
      { nombre: "13 Cles Edición Limitada", precio: 19000 },
      { nombre: "Alto Uxmal (Cabernet-Merlot)", precio: 18000 },
      { nombre: "Benegas (Don Tiburcio)", precio: 17000 },
      { nombre: "Berrinche (Tinto de la Casa)", precio: 18000 },
      { nombre: "Escorihuela Gascón (Malbec-Cabernet)", precio: 18500 },
      { nombre: "Finca Flichman Expresiones (Cabernet-Malbec)", precio: 31000 },
      { nombre: "Finca Flichman Expresiones (Syrah-Cab-Syrah-etc.)", precio: 31000 },
      { nombre: "Guarda (Bodega Lagarde)", precio: 24000 },
      { nombre: "La Mala María (Syrah-Petit Verdot)", precio: 21000 },
      { nombre: "Nicasia (Malbec-Cabernet-Petit Verdot)", precio: 19000 },
      { nombre: "Vistalba Corte B", precio: 32000 },
    ]
  },
];

function formatPrice(precio: number | null | undefined) {
  if (precio === null || precio === undefined) {
    return <span className="text-[#8C8C8C]">Sin stock</span>;
  }
  return `$${precio.toLocaleString('es-AR')}`;
}

export default function MenuSection() {
  // Comidas
  const [categoriaActiva, setCategoriaActiva] = useState(cartaComidas[0].categoria);
  const categoriasComidas = cartaComidas.map(c => c.categoria);
  const productosComidas = cartaComidas.find(c => c.categoria === categoriaActiva)?.productos || [];

  // Vinos
  const [subcatVinoActiva, setSubcatVinoActiva] = useState(cartaVinos[0].subcategoria);
  const subcategoriasVinos = cartaVinos.map(c => c.subcategoria);
  const productosVinos = cartaVinos.find(c => c.subcategoria === subcatVinoActiva)?.productos || [];

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
        {/* Tabs de comidas */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categoriasComidas.map(cat => (
            <button
              key={cat}
              className={`px-6 py-2 rounded-full font-serif text-lg border transition-colors ${categoriaActiva === cat ? 'bg-[#C4A962] text-black border-[#C4A962]' : 'bg-black text-[#C4A962] border-[#C4A962] hover:bg-[#D4BC7B] hover:text-black'}`}
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
              </div>
              <p className="text-[#8C8C8C] text-sm text-left">{prod.descripcion}</p>
            </div>
          ))}
        </div>
        {/* Sección de vinos */}
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl font-bold mb-6 text-white">Vinos</h2>
          <p className="text-lg text-[#8C8C8C] max-w-2xl mx-auto mb-8">
            Selección de vinos y espumantes.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {subcategoriasVinos.map(subcat => (
              <button
                key={subcat}
                className={`px-6 py-2 rounded-full font-serif text-lg border transition-colors ${subcatVinoActiva === subcat ? 'bg-[#C4A962] text-black border-[#C4A962]' : 'bg-black text-[#C4A962] border-[#C4A962] hover:bg-[#D4BC7B] hover:text-black'}`}
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 