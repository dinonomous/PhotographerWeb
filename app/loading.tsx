import LoadingSpinner from "@/components/ui/loading-spinner"

export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="text-gold mt-4">Loading beautiful moments...</p>
      </div>
    </div>
  )
}
