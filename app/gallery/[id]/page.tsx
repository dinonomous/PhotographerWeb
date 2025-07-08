import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Share2, Heart, Camera, Calendar, Image as ImageIcon } from "lucide-react"
import Navigation from "@/components/navigation"
import MasonryGallery from "@/components/masonry-gallery"
import { getFolderImages } from "@/lib/google-drive"
import { Suspense } from "react"
import ShareButton from "@/components/share-button"

interface GalleryPageProps {
  params: {
    id: string
  }
  searchParams: {
    pageToken?: string
  }
}

// Enhanced loading component
function GalleryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-12 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-32 h-5 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="w-24 h-9 bg-gray-700 rounded animate-pulse"></div>
        </div>
        
        <div className="text-center space-y-4">
          <div className="h-8 bg-gray-700 rounded max-w-md mx-auto animate-pulse"></div>
          <div className="h-5 bg-gray-600 rounded max-w-xs mx-auto animate-pulse"></div>
          <div className="flex items-center justify-center space-x-6 pt-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-600 rounded animate-pulse"></div>
              <div className="w-16 h-4 bg-gray-600 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-600 rounded animate-pulse"></div>
              <div className="w-20 h-4 bg-gray-600 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery grid skeleton */}
      <div className="grid gap-4 auto-rows-[10px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {[...Array(12)].map((_, i) => {
          const heights = [200, 300, 250, 350, 280, 320];
          const height = heights[i % heights.length];
          const gridRowSpan = Math.ceil((height + 16) / 14);
          
          return (
            <div 
              key={i} 
              className="bg-gray-800 rounded-xl animate-pulse"
              style={{ gridRowEnd: `span ${gridRowSpan}`, height: `${height}px` }}
            >
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-gray-800 to-gray-900"></div>
            </div>
          );
        })}
      </div>
    </div>
  )
}

export default async function GalleryPage({ params, searchParams }: GalleryPageProps) {
  try {
    const galleryData = await getFolderImages(params.id)
    
    if (!galleryData.folder.name) {
      notFound()
    }

    // Mock metadata - you can replace this with actual data from your API
    const galleryMetadata = {
      imageCount: galleryData.images.length,
      createdDate: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      category: 'Photography'
    }

    return (
      <main className="min-h-screen bg-white text-black">
        <Navigation />

        {/* Enhanced Header Section */}
        <div className="relative pt-24 pb-12 px-4">
          {/* Background gradient */}
          <div className="absolute inset-0"></div>
          
          <div className="relative max-w-7xl mx-auto">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-8">
              <Link
                href="/"
                className="group inline-flex items-center space-x-2 text-black transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                <span className="font-medium">Back to Galleries</span>
              </Link>

              <div className="flex items-center space-x-3">
                <ShareButton 
                  title={`${galleryData.folder.name} | Vara Photography`}
                />
                <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Gallery Title and Info */}
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-950 mb-4 tracking-tight">
                {galleryData.folder.name}
              </h1>
              
              <p className="text-neutral-900 text-lg mb-8 leading-relaxed">
                Captured moments that tell a story. Each image in this collection represents 
                a unique perspective and artistic vision.
              </p>

              {/* Gallery metadata */}
              <div className="flex items-center justify-center space-x-8 text-sm text-neutral-900">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>{galleryMetadata.imageCount}+ images</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{galleryMetadata.createdDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Camera className="w-4 h-4" />
                  <span>{galleryMetadata.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Content */}
        <Suspense fallback={<GalleryLoading />}>
          <MasonryGallery
            folderId={params.id}
            initialImages={galleryData.images}
            initialNextPageToken={galleryData.nextPageToken}
          />
        </Suspense>

        {/* Enhanced Footer */}
        <footer className="bg-gradient-to-t from-gray-900 to-black py-16 px-4 mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">Vara Photography</h3>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Capturing life's most precious moments with artistry and passion. 
                Each frame tells a story worth preserving.
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-8 mb-8">
              <Link href="/contact" className="text-gold hover:text-gold-light transition-colors">
                Contact
              </Link>
              <Link href="/about" className="text-gold hover:text-gold-light transition-colors">
                About
              </Link>
              <Link href="/galleries" className="text-gold hover:text-gold-light transition-colors">
                Galleries
              </Link>
            </div>

            <div className="border-t border-gray-800 pt-8">
              <p className="text-center text-gray-500 text-sm">
                © {new Date().getFullYear()} Vara Photography. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    )
  } catch (error) {
    console.error('Error loading gallery:', error)
    notFound()
  }
}