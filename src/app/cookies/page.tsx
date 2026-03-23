import React from "react"
import { restaurant } from "@/config/restaurant"

export default function Cookies() {
  return (
    <article className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="font-serif text-3xl font-bold mb-6 text-white">Política de Cookies</h1>
      <p className="text-[#8C8C8C] mb-4">
        En <strong className="text-white">{restaurant.name}</strong> utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestro sitio web.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-white">1. ¿Qué son las cookies?</h2>
      <p className="text-[#8C8C8C] mb-4">
        Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando navegás por un sitio web. Permiten recordar tus preferencias y mejorar tu experiencia de usuario.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-white">2. Tipos de cookies que utilizamos</h2>
      <ul className="list-disc ml-6 mb-4 text-[#8C8C8C]">
        <li><strong className="text-white">Cookies esenciales:</strong> Necesarias para el funcionamiento del sitio.</li>
        <li><strong className="text-white">Cookies analíticas:</strong> Utilizamos Google Analytics para analizar el tráfico del sitio y mejorar nuestros servicios.</li>
        <li><strong className="text-white">Cookies de preferencias:</strong> Recordamos tu configuración y preferencias.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-white">3. Cookies de terceros</h2>
      <p className="text-[#8C8C8C] mb-4">
        Utilizamos Google Analytics (Google LLC) para obtener estadísticas de uso del sitio. Podés conocer más sobre cómo Google utiliza tus datos en{" "}
        <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-[#C4A962] hover:text-[#D4BC7B]">
          policies.google.com
        </a>
        .
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-white">4. Cómo gestionar cookies</h2>
      <p className="text-[#8C8C8C] mb-4">
        Podés configurar tu navegador para bloquear o eliminar cookies. Tené en cuenta que bloquear cookies puede afectar la funcionalidad del sitio.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-white">5. Consentimiento</h2>
      <p className="text-[#8C8C8C] mb-4">
        Al continuar navegando en este sitio, aceptás el uso de cookies en los términos descritos en esta política.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-white">6. Actualizaciones</h2>
      <p className="text-[#8C8C8C]">
        Esta política puede actualizarse periódicamente. Te recomendamos revisarla regularmente.
      </p>
    </article>
  )
}
