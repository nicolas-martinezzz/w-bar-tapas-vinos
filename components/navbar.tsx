"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Image from "next/image"

const navItems = [
  { label: "Inicio", href: "/#hero" },
  { label: "Restaurante", href: "/#restaurante" },
  { label: "Menú", href: "/#menu" },
  { label: "Vinoteca", href: "https://pedidodirecto.app/w", external: true },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/90 backdrop-blur-md shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <div className="h-[50px] w-[50px] relative">
            <Image 
              src="/images/w_logo_vec.png" 
              alt="W Bar Logo" 
              width={50} 
              height={50} 
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-medium text-white hover:text-[#D4BC7B] transition-colors"
              {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="https://api.whatsapp.com/send/?phone=541139395205&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              className="bg-[#C4A962] hover:bg-[#D4BC7B] text-white transition-colors"
            >
              Reservar
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Menu className="h-6 w-6 text-white" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md shadow-md">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-medium text-white hover:text-[#D4BC7B] transition-colors py-2"
                onClick={() => setIsOpen(false)}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="https://api.whatsapp.com/send/?phone=541139395205&app_absent=0"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button className="bg-[#C4A962] hover:bg-[#D4BC7B] text-white w-full transition-colors" onClick={() => setIsOpen(false)}>
                Reservar
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
