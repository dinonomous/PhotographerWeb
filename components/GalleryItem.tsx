"use client"
import React, { useState, useCallback } from "react"
import Image from "next/image"
import { Images, Loader2 } from "lucide-react"
import type { DriveFolder } from "@/lib/types"

interface GalleryItemProps {
  folder: DriveFolder
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
}

export default React.memo(function GalleryItem({ folder, isHovered, onHover, onLeave }: GalleryItemProps) {
  const [hasLoaded, setHasLoaded] = useState(false)
  const [hasErrored, setHasErrored] = useState(false)

  const handleLoad = useCallback(() => setHasLoaded(true), [])
  const handleError = useCallback(() => setHasErrored(true), [])

  return (
    <a
      href={`/gallery/${folder.id}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-lg bg-gray-900 aspect-[4/3]">
        {!hasLoaded && !hasErrored && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        )}

        {!hasErrored ? (
          <Image
            src={folder.thumbnailUrl}
            alt={folder.name}
            fill
            unoptimized
            loading="lazy"
            className={`object-cover transition-all duration-700 ${
              isHovered ? "scale-110" : "scale-100"
            } ${hasLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={handleLoad}
            onError={handleError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <Images className="w-12 h-12 text-gray-400" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="text-center text-white">
            <Images className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">View Gallery</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-playfair text-xl font-bold text-black tracking-wide">
          {folder.name.toUpperCase()}
        </h3>
      </div>
    </a>
  )
})