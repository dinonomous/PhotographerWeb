import Link from "next/link"
import { Camera } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center">
        <Camera className="w-16 h-16 text-gold mx-auto mb-6" />
        <h1 className="font-playfair text-4xl font-bold text-white mb-4">Gallery Not Found</h1>
        <p className="text-gray-300 mb-8 max-w-md">The gallery you're looking for doesn't exist or has been moved.</p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-gold hover:bg-gold-dark text-black font-semibold rounded-lg transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
