// types.ts
export interface S3Folder {
  id: string // S3 prefix path
  name: string
  thumbnailUrl: string | null
  imageCount: number
  createdTime: string
}

export interface S3Image {
  id: string // S3 object key
  name: string
  mimeType: string
  webViewLink: string
  thumbnailLink: string
  folderName: string
  highQualityUrl: string
  size?: number
  lastModified?: string
}

export interface GalleryData {
  folder: {
    id: string
    name: string
  }
  images: S3Image[]
  nextPageToken?: string
}

export interface S3Config {
  bucketName: string
  region: string
  cloudFrontDomain: string
  cloudFrontDistributionId?: string
}

export interface CacheConfig {
  folderTTL: number
  imageTTL: number
  metadataTTL: number
}

export interface PaginationConfig {
  defaultPageSize: number
  maxPageSize: number
  thumbnailSize: string
  highQualitySize: string
}

export interface ContactForm {
  name: string
  email: string
  message: string
  eventType?: string
  eventDate?: string
}
