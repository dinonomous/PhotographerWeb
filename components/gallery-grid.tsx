"use client"
import React, { useState } from "react"
import type { DriveFolder } from "@/lib/types"
import GalleryItem from "./GalleryItem"
import { Loader2 } from "lucide-react"

interface GalleryGridProps {
  folders: DriveFolder[]
  isLoading?: boolean
}

const GalleryGrid = React.memo(function GalleryGrid({ folders, isLoading = false }: GalleryGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (folders.length === 0) {
    return (
      <section id="galleries" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-300">No galleries found</p>
        </div>
      </section>
    )
  }


  if (isLoading) {
    return (
      <section id="galleries" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-4">Recent Work</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">Loading galleries...</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="group block">
                <div className="relative overflow-hidden rounded-lg bg-gray-900 aspect-[4/3] flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
                <div className="w-full flex items-center justify-center p-4">
                  <div className="h-6 bg-gray-800 rounded w-32 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (folders.length === 0) {
    return (
      <section id="galleries" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-4">Recent Work</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">No galleries found</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="galleries" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-4">Recent Work</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore our latest photography sessions and events
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {folders.map((folder) => (
            <GalleryItem
              key={folder.id}
              folder={folder}
              isHovered={hoveredId === folder.id}
              onHover={() => setHoveredId(folder.id)}
              onLeave={() => setHoveredId(null)}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm">
            Showing {folders.length} {folders.length === 1 ? 'gallery' : 'galleries'}
          </p>
        </div>
      </div>
    </section>
  )
})

export default GalleryGrid