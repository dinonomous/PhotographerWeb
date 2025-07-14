import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Share2, Heart, Calendar, Camera, Folder, Image as ImageIcon, ChevronRight } from "lucide-react"
import Navigation from "@/components/navigation"
import MasonryGallery from "@/components/masonry-gallery"
import { getFolderImages, getFolders } from "@/lib/google-drive"
import { Suspense } from "react"
import ShareButton from "@/components/share-button"

interface GalleryPageProps {
  params: {
    id: string | string[]
  }
  searchParams: {
    pageToken?: string
  }
}

function GalleryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-24 h-9 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="text-center space-y-3">
          <div className="h-8 bg-gray-200 rounded max-w-md mx-auto animate-pulse"></div>
          <div className="h-5 bg-gray-100 rounded max-w-xs mx-auto animate-pulse"></div>
        </div>
      </div>

      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {[...Array(20)].map((_, i) => {
          const heights = [200, 300, 250, 350, 280, 320, 400, 180];
          const height = heights[i % heights.length];
          
          return (
            <div 
              key={i} 
              className="break-inside-avoid mb-4 bg-gray-100 rounded-lg animate-pulse"
              style={{ height: `${height}px` }}
            />
          );
        })}
      </div>
    </div>
  )
}

// Hero section component
function HeroSection({ heroImage, folderName }: { heroImage?: any, folderName: string }) {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {heroImage ? (
        <img
          src={heroImage.thumbnailUrl || heroImage.webViewLink}
          alt={folderName}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            {folderName}
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
            A curated collection of moments captured through the lens
          </p>
          <div className="flex items-center justify-center">
            <div className="animate-bounce">
              <ChevronRight className="w-8 h-8 text-white rotate-90" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component for displaying folders as full-width images
function FolderGrid({ folders, basePath }: { folders: any[], basePath: string }) {
  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Collections</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore different moments and memories captured in each collection
        </p>
      </div>
      
      <div className="space-y-8">
        {folders.map((folder, index) => {
          const folderPath = `${basePath}/${encodeURIComponent(folder.id)}`
          
          return (
            <Link
              key={folder.id}
              href={folderPath}
              className="group block relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]"
            >
              <div className="relative h-96 md:h-[500px] w-full overflow-hidden">
                {folder.thumbnailUrl ? (
                  <img
                    src={folder.thumbnailUrl}
                    alt={folder.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
                  </div>
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-500"></div>
                
                {/* Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center transform group-hover:scale-105 transition-transform duration-500">
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-wide">
                      {decodeURIComponent(folder.name)}
                    </h3>
                    {folder.imageCount > 0 && (
                      <p className="text-lg text-gray-200 font-medium">
                        {folder.imageCount} memories
                      </p>
                    )}
                    <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <span className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium">
                        Explore Collection
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// Component for displaying image section header
function ImageSection({ imageCount }: { imageCount: number }) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Gallery</h2>
      <p className="text-lg text-gray-600">
        {imageCount} beautiful moments captured
      </p>
    </div>
  )
}

// Breadcrumb type to include isLast
type Breadcrumb = {
  name: string
  href: string
  isLast?: boolean
}

// Generate breadcrumb navigation with decoded names
function generateBreadcrumbs(pathSegments: string[]): Breadcrumb[] {
  const breadcrumbs: Breadcrumb[] = [{ name: 'Home', href: '/' }]
  
  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    // Decode the segment to show readable names
    const decodedName = decodeURIComponent(segment).split('/').pop() || segment
    
    breadcrumbs.push({
      name: decodedName,
      href: `/gallery${currentPath}`,
      isLast: index === pathSegments.length - 1
    })
  })
  
  return breadcrumbs
}

export default async function GalleryPage({ params, searchParams }: GalleryPageProps) {
  try {
    // Handle nested paths
    const pathSegments = Array.isArray(params.id) ? params.id : [params.id]
    const fullPath = pathSegments.join('/')
    const decodedPath = decodeURIComponent(fullPath)
    
    // Add trailing slash for S3 prefix if not present
    const s3Prefix = decodedPath.endsWith('/') ? decodedPath : `${decodedPath}/`
    
    // Get both folders and images
    const [galleryData, folders] = await Promise.all([
      getFolderImages(s3Prefix, searchParams.pageToken, 20),
      getFolders(s3Prefix)
    ])
    
    const folderName = decodeURIComponent(galleryData.folder.name || 'Gallery')
    const hasImages = galleryData.images.length > 0
    const hasFolders = folders.length > 0
    const hasContent = hasImages || hasFolders
    
    if (!hasContent) {
      notFound()
    }

    // Find hero image (prioritize image named "hero" or use first image)
    const heroImage = galleryData.images.find(img => 
      img.name?.toLowerCase().includes('hero')
    ) || galleryData.images[0]

    // Generate breadcrumbs
    const breadcrumbs = generateBreadcrumbs(pathSegments)
    const basePath = '/gallery'

    return (
      <main className="min-h-screen bg-white text-black">
        {/* Navigation with overlay for hero section */}
        <div className="relative z-50">
          <Navigation />
        </div>

        {/* Hero Section */}
        <HeroSection heroImage={heroImage} folderName={folderName} />

        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center">
                    {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />}
                    {crumb.isLast ? (
                      <span className="text-gray-900 font-medium">{crumb.name}</span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="text-gray-600 hover:text-black transition-colors"
                      >
                        {crumb.name}
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-3">
                <ShareButton 
                  title={`${folderName} | Vara Photography`}
                />
                <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Show folders if they exist */}
          {hasFolders && (
            <FolderGrid folders={folders} basePath={basePath} />
          )}

          {/* Show images if they exist */}
          {hasImages && (
            <div>
              {hasFolders && <ImageSection imageCount={galleryData.images.length} />}
              
              <Suspense fallback={<GalleryLoading />}>
                <MasonryGallery
                  folderId={s3Prefix}
                  initialImages={galleryData.images}
                  initialNextPageToken={galleryData.nextPageToken}
                />
              </Suspense>
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        <footer className="bg-gray-900 text-white py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Vara Photography</h3>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Capturing life's precious moments with passion and artistry. 
                Every image tells a story, every moment is a memory.
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-8 mb-12">
              <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-lg">
                Contact
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors text-lg">
                About
              </Link>
              <Link href="/galleries" className="text-gray-300 hover:text-white transition-colors text-lg">
                Galleries
              </Link>
            </div>

            <div className="border-t border-gray-800 pt-8 text-center">
              <p className="text-gray-400">
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