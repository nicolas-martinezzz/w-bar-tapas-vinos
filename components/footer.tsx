import Link from "next/link"
import { Instagram } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Image 
                src="/images/w_logo_vec.png" 
                alt="W Bar Logo" 
                width={48} 
                height={48} 
                className="object-contain mr-3" 
                priority
              />
              <h3 className="font-serif text-2xl font-bold">W Bar</h3>
            </div>
            <p className="text-[#8C8C8C] mb-4">
              Una experiencia gastronómica única en el corazón de San Isidro, donde la tradición se encuentra con la
              innovación.
            </p>
            <div className="flex space-x-4">
              <Link href="https://www.instagram.com/wbardetapasyvinos/" target="_blank" rel="noopener noreferrer" className="text-[#C4A962] hover:text-[#D4BC7B] transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-lg font-bold mb-4">Horario</h4>
            <ul className="space-y-2 text-[#8C8C8C]">
              <li>Lunes a jueves de 20hs. a 00hs.</li>
              <li>Viernes a sábado de 20hs. a 01hs.</li>
              <li>Domingo Cerrado</li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-bold mb-4">Contacto</h4>
            <address className="not-italic text-[#8C8C8C] space-y-2">
              <p>Av. del Libertador 14658</p>
              <p>B1641 Acassuso, Provincia de Buenos Aires, Argentina.</p>
              <p>Teléfono: +54 11 39395205</p>
              <p>Email: wbardetapasyvinos@gmail.com</p>
            </address>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-[#8C8C8C]">
          <p>&copy; {new Date().getFullYear()} W Bar de vinos y tapas. Todos los derechos reservados.</p>
          <div className="mt-2 space-x-4 text-sm">
            <Link href="/privacidad" className="hover:text-[#D4BC7B] transition-colors">
              Política de Privacidad
            </Link>
            <Link href="/terms" className="hover:text-[#D4BC7B] transition-colors">
              Términos y Condiciones
            </Link>
            <Link href="/cookies" className="hover:text-[#D4BC7B] transition-colors">
              Política de Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
