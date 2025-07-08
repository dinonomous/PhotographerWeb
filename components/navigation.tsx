"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Camera } from "lucide-react"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/90 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2 group">
            <Camera className="w-8 h-8 text-gold group-hover:scale-110 transition-transform" />
            <span className="font-playfair text-xl font-bold text-white group-hover:text-gold transition-colors">
              Elena Rodriguez
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-white hover-gold transition-colors">
              Home
            </Link>
            <Link href="/#galleries" className="text-white hover-gold transition-colors">
              Galleries
            </Link>
            <Link href="/#about" className="text-white hover-gold transition-colors">
              About
            </Link>
            <Link href="/#contact" className="text-white hover-gold transition-colors">
              Contact
            </Link>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white hover:text-gold transition-colors">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-md rounded-lg mt-2 py-4">
            <div className="flex flex-col space-y-4 px-4">
              <Link href="/" className="text-white hover-gold transition-colors" onClick={() => setIsOpen(false)}>
                Home
              </Link>
              <Link
                href="/#galleries"
                className="text-white hover-gold transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Galleries
              </Link>
              <Link href="/#about" className="text-white hover-gold transition-colors" onClick={() => setIsOpen(false)}>
                About
              </Link>
              <Link
                href="/#contact"
                className="text-white hover-gold transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
