"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { Loader2, ChevronLeft, ChevronRight, X, Download, Share2, Heart } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DriveImage } from "@/lib/types";

interface MasonryGalleryProps {
  folderId: string;
  initialImages: DriveImage[];
  initialNextPageToken?: string;
}

export default function MasonryGallery({
  folderId,
  initialImages,
  initialNextPageToken,
}: MasonryGalleryProps) {
  const [images, setImages] = useState<DriveImage[]>(initialImages);
  const [nextToken, setNextToken] = useState<string | undefined>(initialNextPageToken);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [imageHeights, setImageHeights] = useState<Record<string, number>>({});
  const [isViewerImageLoaded, setIsViewerImageLoaded] = useState(false);
  const [columns, setColumns] = useState(3);
  const [columnHeights, setColumnHeights] = useState<number[]>([]);
  const [imageColumns, setImageColumns] = useState<DriveImage[][]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Responsive columns based on screen size
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 640) {
        setColumns(2);
      } else if (window.innerWidth < 1024) {
        setColumns(3);
      } else {
        setColumns(3);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Initialize column heights when columns change
  useEffect(() => {
    setColumnHeights(new Array(columns).fill(0));
    setImageColumns(new Array(columns).fill(null).map(() => []));
  }, [columns]);

  // Distribute images across columns when images or columns change
  useEffect(() => {
    if (images.length === 0 || columns === 0) return;

    const newColumnHeights = new Array(columns).fill(0);
    const newImageColumns: DriveImage[][] = new Array(columns).fill(null).map(() => []);

    images.forEach((image) => {
      // Find the column with the shortest height
      const shortestColumnIndex = newColumnHeights.indexOf(Math.min(...newColumnHeights));
      
      // Add image to the shortest column
      newImageColumns[shortestColumnIndex].push(image);
      
      // Update column height (use actual height if loaded, otherwise estimate)
      const estimatedHeight = imageHeights[image.id] || 300;
      newColumnHeights[shortestColumnIndex] += estimatedHeight + 16; // 16px gap
    });

    setColumnHeights(newColumnHeights);
    setImageColumns(newImageColumns);
  }, [images, columns, imageHeights]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextToken && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [nextToken, loadingMore]);

  const loadMore = useCallback(async () => {
    if (!nextToken || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/gallery/${folderId}?pageToken=${encodeURIComponent(nextToken)}&pageSize=20`
      );
      const data = await res.json();
      setImages((prev) => [...prev, ...data.images]);
      setNextToken(data.nextPageToken);
    } catch (err) {
      console.error("Load more failed", err);
    } finally {
      setLoadingMore(false);
    }
  }, [folderId, nextToken, loadingMore]);

  const handleImageLoad = (id: string, naturalHeight: number, naturalWidth: number) => {
    setLoadedImages((s) => new Set(s).add(id));
    // Calculate actual display height based on container width
    const containerWidth = window.innerWidth < 640 ? 
      (window.innerWidth - 32 - 16) / 2 : // 2 columns on mobile
      window.innerWidth < 1024 ? 
        (window.innerWidth - 48 - 32) / 3 : // 3 columns on tablet
        (window.innerWidth - 64 - 48) / 4; // 4 columns on desktop
    
    const aspectRatio = naturalHeight / naturalWidth;
    const displayHeight = containerWidth * aspectRatio;
    setImageHeights((prev) => ({ ...prev, [id]: displayHeight }));
  };

  const openViewer = (image: DriveImage) => {
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

  // Auto-load more when viewing near the end
  useEffect(() => {
    if (viewerIndex !== null && viewerIndex >= images.length - 3 && nextToken && !loadingMore) {
      loadMore();
    }
  }, [viewerIndex, images.length, nextToken, loadingMore, loadMore]);

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
      <div className="max-w-7xl mx-auto px-4 py-8 bg-white">
        {/* Dynamic Pinterest-style Masonry Layout */}
        <div className={`grid gap-4 ${
          columns === 2 ? 'grid-cols-2' : 
          columns === 3 ? 'grid-cols-3' : 
          'grid-cols-4'
        }`}>
          {imageColumns.map((columnImages, columnIndex) => (
            <div key={columnIndex} className="grid gap-4">
              {columnImages.map((img) => (
                <div
                  key={img.id}
                  className="relative rounded-xl overflow-hidden group cursor-pointer transform-gpu transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                  onClick={() => openViewer(img)}
                >
                  {/* Loading skeleton */}
                  {!loadedImages.has(img.id) && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse rounded-xl aspect-square">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="animate-spin text-gold w-8 h-8" />
                      </div>
                    </div>
                  )}

                  {/* Image */}
                  <Image
                    src={img.thumbnailLink || "/placeholder.svg"}
                    alt={img.name}
                    width={400}
                    height={400}
                    className={`w-full h-auto transition-all duration-500 ${
                      loadedImages.has(img.id) ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={(e) => {
                      const target = e.target as HTMLImageElement;
                      handleImageLoad(img.id, target.naturalHeight, target.naturalWidth);
                    }}
                    loading="lazy"
                    style={{ aspectRatio: 'auto' }}
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3">
                        <p className="text-white text-sm font-medium truncate">{img.name}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Loading more indicator */}
        {nextToken && (
          <div ref={loadMoreRef} className="flex justify-center py-12">
            {loadingMore && (
              <div className="flex items-center space-x-2 text-gold">
                <Loader2 className="animate-spin w-5 h-5" />
                <span>Loading more images...</span>
              </div>
            )}
          </div>
        )}

        {/* End of gallery message */}
        {!nextToken && images.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">You've reached the end of the gallery</p>
          </div>
        )}
      </div>

      {/* Enhanced Image Viewer */}
      {viewerIndex !== null && (
        <Dialog open onOpenChange={(open) => !open && closeViewer()}>
          <DialogContent className="p-0 bg-black/95 backdrop-blur-sm border-none max-w-[95vw] max-h-[95vh] overflow-hidden">
            {/* Header with controls */}
            <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400 text-sm">
                    {viewerIndex + 1} of {images.length}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
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
                className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-200 hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {viewerIndex < images.length - 1 && (
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-200 hover:scale-110"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Image container */}
            <div className="flex items-center justify-center w-full h-[80vh] p-8 pt-20">
              {!isViewerImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="animate-spin text-gold w-12 h-12" />
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
                className={`mx-auto object-contain w-full h-full transition-opacity duration-300 ${
                  isViewerImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setIsViewerImageLoaded(true)}
                priority
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}