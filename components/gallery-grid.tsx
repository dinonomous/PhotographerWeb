"use client"
import React, { useState } from "react"
import type { S3Folder } from "@/lib/types"
import GalleryItem from "./GalleryItem"
import { Loader2, AlertCircle } from "lucide-react"

interface GalleryGridProps {
  folders: S3Folder[]
  isLoading?: boolean
  error?: string
}

const GalleryGrid = React.memo(function GalleryGrid({ folders, isLoading = false, error }: GalleryGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Error state
  if (error) {
    return (
      <section id="galleries" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Galleries</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <section id="galleries" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-black mb-4">Recent Work</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Loading galleries...</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="group block">
                <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-[4/3] flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-gray-100 rounded w-24 mt-2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Empty state
  if (folders.length === 0) {
    return (
      <section id="galleries" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-black mb-4">Recent Work</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">No galleries found at this time.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="galleries" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-black mb-4">Recent Work</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
          <p className="text-gray-500 text-sm">
            Showing {folders.length} {folders.length === 1 ? 'gallery' : 'galleries'}
          </p>
        </div>
      </div>
    </section>
  )
})

export default GalleryGrid