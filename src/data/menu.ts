import { Category } from "@/types/restaurant"

export const cartaComidas: Category[] = [
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
]
