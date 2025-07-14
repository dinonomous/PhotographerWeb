"use client"
import React, { useState, useCallback } from "react"
import Image from "next/image"
import { Images, Loader2, Calendar, Camera } from "lucide-react"
import type { S3Folder } from "@/lib/types"

interface GalleryItemProps {
  folder: S3Folder
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
}

export default React.memo(function GalleryItem({ folder, isHovered, onHover, onLeave }: GalleryItemProps) {
  const [hasLoaded, setHasLoaded] = useState(false)
  const [hasErrored, setHasErrored] = useState(false)

  const handleLoad = useCallback(() => setHasLoaded(true), [])
  const handleError = useCallback(() => setHasErrored(true), [])

  // Format the folder ID for URL (encode special characters)
  const encodedFolderId = encodeURIComponent(folder.id)

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    } catch {
      return 'Recently Added'
    }
  }

  return (
    <a
      href={`/gallery/${encodedFolderId}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="group block transform hover:scale-[1.02] transition-transform duration-300"
    >
      <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-[4/3] shadow-lg">
        {!hasLoaded && !hasErrored && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        )}

        {folder.thumbnailUrl && !hasErrored ? (
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
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Images className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="text-center text-white">
            <Images className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">View Gallery</p>
            <p className="text-xs text-gray-200 mt-1">
              {folder.imageCount} {folder.imageCount === 1 ? 'image' : 'images'}
            </p>
          </div>
        </div>

        {/* Image count badge */}
        <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
          {folder.imageCount}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-playfair text-xl font-bold text-black tracking-wide mb-2">
          {folder.name.toUpperCase()}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(folder.createdTime)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Camera className="w-3 h-3" />
            <span>{folder.imageCount} photos</span>
          </div>
        </div>
      </div>
    </a>
  )
})