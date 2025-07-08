import Navigation from "@/components/navigation"
import HeroSection from "@/components/hero-section"
import GalleryGrid from "@/components/gallery-grid"
import AboutSection from "@/components/about-section"
import ContactSection from "@/components/contact-section"
import { getFolders } from "@/lib/google-drive"

export default async function HomePage() {
  const folders = await getFolders()

  return (
    <main className="min-h-screen bg-black">
      <Navigation />
      <HeroSection />
      <GalleryGrid folders={folders} />
      <AboutSection />
      <ContactSection />

      {/* Footer */}
      <footer className="bg-white py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Vara Photography. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}
