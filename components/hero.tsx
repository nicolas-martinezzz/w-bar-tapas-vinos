import { Button } from "./ui/button"

export default function Hero() {
  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden">
      {/* Video de fondo */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="object-cover h-full w-full"
        >
          <source src="/videos/w_hero_background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Contenido central */}
      <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
        <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6">
        W Bar
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto font-light tracking-wide">
          Una experiencia única en el corazón de San Isidro
        </p>
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            className="border-[#C4A962] text-[#C4A962] hover:bg-[#C4A962] hover:text-white transition-colors"
            asChild
          >
            <a href="#menu">Ver Menú</a>
          </Button>
          <Button
            size="lg"
            className="bg-[#C4A962] hover:bg-[#D4BC7B] text-white transition-colors"
            asChild
          >
            <a href="https://api.whatsapp.com/send/?phone=541139395205&app_absent=0" target="_blank" rel="noopener noreferrer">Reservar</a>
          </Button>
        </div>
      </div>

      
      
    </section>
  )
} 