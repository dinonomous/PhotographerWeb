"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Menu, X, Camera } from "lucide-react"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import logo from "../public/image-removebg-preview.png"
import Image from "next/image"

export default function Navigation() {
  const [showNav, setShowNav] = useState(true)
  const lastScrollY = useRef(0)

  // headroom effect
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      if (currentY > lastScrollY.current && currentY > 100) {
        // scrolling down -> hide
        setShowNav(false)
      } else {
        // scrolling up -> show
        setShowNav(true)
      }
      lastScrollY.current = currentY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50 transition-transform duration-300
        bg-white shadow-sm
        ${showNav ? "translate-y-0" : "-translate-y-full"}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* logo */}
          <Link href="/" className="flex items-center space-x-2 py-2">
            <Image
              src={logo}
              alt="Logo"
              width={400}
              height={40}
              className="object-contain invert-0 brightness-0"
              priority
            />
            </Link>

          {/* desktop links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-black hover:text-gray-600">
              Home
            </Link>
            <Link href="/#galleries" className="text-black hover:text-gray-600">
              Galleries
            </Link>
            <Link href="/#about" className="text-black hover:text-gray-600">
              About
            </Link>
            <Link href="/#contact" className="text-black hover:text-gray-600">
              Contact
            </Link>
          </div>

          {/* mobile sheet trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="md:hidden text-black">
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>

            <SheetContent
              className="bg-white rounded-t-lg"
            >
              <SheetHeader className="px-6 pt-6 pb-2">
                <div className="flex justify-between items-center">
                  <SheetTitle className="text-lg font-semibold">
                    Menu
                  </SheetTitle>
                  <SheetTrigger asChild>
                    <button>
                      <X className="w-6 h-6 text-black" />
                    </button>
                  </SheetTrigger>
                </div>
              </SheetHeader>

              <div className="flex flex-col space-y-4 px-6 py-4">
                <Link href="/" className="text-black text-lg" onClick={() => {}}>
                  Home
                </Link>
                <Link
                  href="/#galleries"
                  className="text-black text-lg"
                  onClick={() => {}}
                >
                  Galleries
                </Link>
                <Link
                  href="/#about"
                  className="text-black text-lg"
                  onClick={() => {}}
                >
                  About
                </Link>
                <Link
                  href="/#contact"
                  className="text-black text-lg"
                  onClick={() => {}}
                >
                  Contact
                </Link>
              </div>

              <SheetFooter className="px-6 pb-6">
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <p className="text-sm text-gray-700">
                    📞 +91 76590 68190
                  </p>
                  <p className="text-sm text-gray-700">
                    ✉️ varaphoting9003@gmail.com
                  </p>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
