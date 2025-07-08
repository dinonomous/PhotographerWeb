"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import type { DriveImage } from "@/lib/types";
import { Heart, Download, Loader2 } from "lucide-react";

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
  const [nextToken, setNextToken] = useState<string | undefined>(
    initialNextPageToken
  );
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState<Set<string>>(new Set());

  const loadMore = useCallback(async () => {
    if (!nextToken) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/gallery/${folderId}?pageToken=${encodeURIComponent(
          nextToken
        )}&pageSize=20`
      );
      const data = await res.json();
      setImages((prev) => [...prev, ...data.images]);
      setNextToken(data.nextPageToken);
    } catch (err) {
      console.error("Load more failed", err);
    } finally {
      setIsLoading(false);
    }
  }, [folderId, nextToken]);

  const toggleFav = (id: string) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleLoad = (id: string) =>
    setLoaded((prev) => new Set(prev).add(id));

  return (
    <>
      <div className="masonry-grid">
        {images.map((img) => (
          <div key={img.id} className="masonry-item group">
            <div className="relative overflow-hidden rounded-lg bg-gray-900">
              {!loaded.has(img.id) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" />
                </div>
              )}

              <Image
                src={img.thumbnailLink || "/placeholder.svg"}
                alt={img.name}
                width={400}
                height={600}
                className={`w-full h-auto transition-opacity duration-300 ${
                  loaded.has(img.id) ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => handleLoad(img.id)}
              />

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center space-x-3">
                <button
                  onClick={() => toggleFav(img.id)}
                  className={`p-2 rounded-full ${
                    favorites.has(img.id)
                      ? "bg-red-500 text-white"
                      : "bg-white/20 text-white"
                  }`}
                >
                  <Heart className="w-5 h-5" />
                </button>
                <button
                  onClick={() => window.open(img.webViewLink, "_blank")}
                  className="p-2 rounded-full bg-white/20 text-white"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {nextToken && (
        <div className="flex justify-center py-8">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Loading…" : "Load More"}
          </button>
        </div>
      )}
    </>
  );
}
