// types.ts
export interface DriveImage {
  id: string
  name: string
  webViewLink: string
  thumbnailLink: string
  highQualityUrl?: string // Higher quality image URL
  mimeType: string
  folderName?: string // For showing which subfolder the image is from
}

export interface DriveFolder {
  id: string
  name: string
  thumbnailUrl: string
  imageCount: number // Will be 0 (not used anymore)
  createdTime: string // Will be empty string (not used anymore)
}

export interface GalleryData {
  folder: {
    id: string
    name: string
  }
  images: DriveImage[]
  nextPageToken?: string // Google's pagination token
}

export interface ContactForm {
  name: string
  email: string
  message: string
  eventType?: string
  eventDate?: string
}
