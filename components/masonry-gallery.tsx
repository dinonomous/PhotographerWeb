"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Loader2, ChevronLeft, ChevronRight, X, Download } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { S3Image } from "@/lib/types";

interface MasonryGalleryProps {
  folderId: string;
  initialImages: S3Image[];
  initialNextPageToken?: string;
}

export default function MasonryGallery({
  folderId,
  initialImages,
  initialNextPageToken,
}: MasonryGalleryProps) {
  const [images, setImages] = useState<S3Image[]>(initialImages);
  const [nextToken, setNextToken] = useState<string | undefined>(initialNextPageToken);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [isViewerImageLoaded, setIsViewerImageLoaded] = useState(false);

  const loadMore = useCallback(async () => {
    if (!nextToken || loadingMore) return;
    
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/s3/gallery/${encodeURIComponent(folderId)}?continuationToken=${encodeURIComponent(nextToken)}&pageSize=20`
      );
      const data = await res.json();
      
      if (data.success) {
        setImages((prev) => [...prev, ...data.images]);
        setNextToken(data.nextPageToken);
      } else {
        console.error("API error:", data.error);
      }
    } catch (err) {
      console.error("Load more failed", err);
    } finally {
      setLoadingMore(false);
    }
  }, [folderId, nextToken, loadingMore]);

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => new Set(prev).add(id));
  };

  const openViewer = (image: S3Image) => {
    const index = images.findIndex(img => img.id === image.id);
    setViewerIndex(index);
    setIsViewerImageLoaded(false);
  };

  const closeViewer = () => {
    setViewerIndex(null);
    setIsViewerImageLoaded(false);
  };

  const prevImage = () => {
    if (viewerIndex! > 0) {
      setViewerIndex(viewerIndex! - 1);
      setIsViewerImageLoaded(false);
    }
  };

  const nextImage = () => {
    if (viewerIndex! < images.length - 1) {
      setViewerIndex(viewerIndex! + 1);
      setIsViewerImageLoaded(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewerIndex === null) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevImage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextImage();
          break;
        case 'Escape':
          e.preventDefault();
          closeViewer();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewerIndex]);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Simple CSS Columns Masonry Layout */}
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="break-inside-avoid mb-4 relative rounded-lg overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg"
              onClick={() => openViewer(img)}
            >
              {/* Loading skeleton */}
              {!loadedImages.has(img.id) && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-lg">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="animate-spin text-gray-400 w-6 h-6" />
                  </div>
                </div>
              )}

              {/* Image */}
              <Image
                src={img.thumbnailLink || "/placeholder.svg"}
                alt={img.name}
                width={400}
                height={400}
                className={`w-full h-auto object-cover transition-all duration-500 ${
                  loadedImages.has(img.id) ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => handleImageLoad(img.id)}
                loading="lazy"
              />

              {/* Simple hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
            </div>
          ))}
        </div>

        {/* Load more button */}
        {nextToken && (
          <div className="flex justify-center py-8 mt-8">
            <Button
              onClick={loadMore}
              disabled={loadingMore}
              className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5 mr-2" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}

        {/* End of gallery message */}
        {!nextToken && images.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">End of gallery</p>
          </div>
        )}

        {/* Empty state */}
        {!nextToken && images.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-300 text-6xl mb-4">📸</div>
            <p className="text-gray-600 text-lg">No images found</p>
          </div>
        )}
      </div>

      {/* Image Viewer */}
      {viewerIndex !== null && (
        <Dialog open onOpenChange={(open) => !open && closeViewer()}>
          <DialogContent className="p-0 bg-black/95 border-none max-w-[95vw] max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">
                  {viewerIndex + 1} of {images.length}
                </span>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = images[viewerIndex].webViewLink;
                      link.download = images[viewerIndex].name;
                      link.click();
                    }}
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={closeViewer}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            {viewerIndex > 0 && (
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-200"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {viewerIndex < images.length - 1 && (
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-200"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Image container */}
            <div className="flex items-center justify-center w-full h-[80vh] p-8 pt-16">
              {!isViewerImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="animate-spin text-white w-8 h-8" />
                </div>
              )}
              
              <Image
                src={
                  images[viewerIndex].highQualityUrl ||
                  images[viewerIndex].webViewLink ||
                  images[viewerIndex].thumbnailLink ||
                  "/placeholder.svg"
                }
                alt={images[viewerIndex].name}
                width={1200}
                height={800}
                className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                  isViewerImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setIsViewerImageLoaded(true)}
                priority
              />
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="text-center">
                <p className="text-gray-300 text-sm">{images[viewerIndex].name}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}