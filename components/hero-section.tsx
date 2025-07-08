"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import img1 from "../public/HERO 1.jpg"
import img2 from "../public/HERO 2.jpg"
import img3 from "../public/HERO 3.jpg"

// Optional: mark wide images manually
const heroImages = [
  { src: img1, isWide: false },
  { src: img2, isWide: true }, // <- this is wide
  { src: img3, isWide: true },
]

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0)
  const current = heroImages[currentImage]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 transition-opacity duration-1000 opacity-100">
        <Image
          src={current.src}
          alt={`Hero image ${currentImage + 1}`}
          fill
          className={`object-cover ${current.isWide ? "object-left" : "object-center"}`}
          priority
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full text-center px-4">
        <div className="max-w-4xl">
          <h1 className="font-playfair text-5xl md:text-7xl font-bold text-white mb-6 text-shadow">Elena Rodriguez</h1>
          <p className="text-xl md:text-2xl text-gold mb-8 text-shadow">Capturing Moments That Last Forever</p>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto text-shadow">
            Professional photographer specializing in weddings, portraits, and life's most precious moments
          </p>
        </div>
      </div>
    </section>
  )
}
