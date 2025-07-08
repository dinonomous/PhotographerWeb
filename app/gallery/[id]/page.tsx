import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Share2, Heart } from "lucide-react"
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

// Loading component for the gallery
function GalleryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="h-12 bg-gray-800 rounded mb-4 max-w-md mx-auto animate-pulse"></div>
        <div className="h-6 bg-gray-700 rounded max-w-xs mx-auto animate-pulse"></div>
      </div>

      <div className="masonry-grid">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="masonry-item">
            <div className="bg-gray-800 rounded-lg aspect-[3/4] animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function GalleryPage({ params, searchParams }: GalleryPageProps) {
  const galleryData = await getFolderImages(params.id)
  try {
    if (!galleryData.folder.name) {
      notFound()
    }

    return (
      <main className="min-h-screen bg-black">
        <Navigation />

        {/* Header Section */}
        <div className="pt-24 pb-8 px-4 border-b border-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/"
                className="inline-flex items-center space-x-2 text-gold hover:text-gold-light transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Galleries</span>
              </Link>

              <div className="flex items-center space-x-4">
                <ShareButton title={`${galleryData.folder.name} | Elena Rodriguez Photography`} />
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


        {/* Footer */}
        <footer className="bg-gray-900 py-8 px-4 mt-20">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} Elena Rodriguez Photography. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    )
  } catch (error) {
    console.error('Error loading gallery:', error)
    notFound()
  }
}