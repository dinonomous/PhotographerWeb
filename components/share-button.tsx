"use client"

import { Share2 } from "lucide-react"

export default function ShareButton({ title }: { title: string }) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
    >
      <Share2 className="w-5 h-5" />
      <span>Share</span>
    </button>
  )
}
