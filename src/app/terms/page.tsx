import React from "react"
import { restaurant } from "@/config/restaurant"

export default function Terms() {
  return (
    <article className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="font-serif text-3xl font-bold mb-6 text-white">Términos y Condiciones</h1>
      <p className="text-[#8C8C8C] mb-4">
        Bienvenido a <strong className="text-white">{restaurant.name}</strong>. Al acceder y utilizar este sitio web, aceptás los siguientes términos y condiciones en su totalidad.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-white">1. Aceptación de los Términos</h2>
      <p className="text-[#8C8C8C] mb-4">
        Al navegar por este sitio, confirmás que leíste, entendiste y aceptás estar sujeto a estos términos. Si no estás de acuerdo con alguno de ellos, por favor no utilices este sitio.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-white">2. Uso del Sitio</h2>
      <p className="text-[#8C8C8C] mb-4">
        Este sitio tiene como finalidad informar sobre los servicios gastronómicos de {restaurant.name}. Queda prohibido utilizar el sitio para cualquier propósito ilegal o no autorizado.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-white">3. Reservas</h2>
      <p className="text-[#8C8C8C] mb-4">
        Las reservas realizadas a través de nuestro canal de WhatsApp están sujetas a disponibilidad. {restaurant.name} se reserva el derecho de modificar o cancelar reservas.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-white">4. Propiedad Intelectual</h2>
      <p className="text-[#8C8C8C] mb-4">
        Todo el contenido del sitio (textos, imágenes, logotipos, diseño) es propiedad de {restaurant.name} y está protegido por las leyes de propiedad intelectual vigentes.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-white">5. Limitación de Responsabilidad</h2>
      <p className="text-[#8C8C8C] mb-4">
        {restaurant.name} no se hace responsable de daños derivados del uso del sitio web o de la información contenida en el mismo.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-white">6. Modificaciones</h2>
      <p className="text-[#8C8C8C] mb-4">
        {restaurant.name} se reserva el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor desde su publicación en el sitio.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-white">7. Contacto</h2>
      <p className="text-[#8C8C8C]">
        Para consultas sobre estos términos, contactanos a {restaurant.email}.
      </p>
    </article>
  )
}
