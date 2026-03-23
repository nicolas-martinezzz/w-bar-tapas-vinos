"use client"

import { Dialog, DialogOverlay, DialogContent } from "@/components/ui/dialog"
import Image from "next/image"
import { X } from "lucide-react"

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  src: string
  alt: string
}

export function ImageModal({ isOpen, onClose, src, alt }: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/80 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-0" hideCloseButton>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
          aria-label="Cerrar imagen"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="relative w-full h-[80vh]">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
            quality={100}
            priority
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
