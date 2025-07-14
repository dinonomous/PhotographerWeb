import type { S3Folder, GalleryData, S3Image } from "./types"
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"

// Simple configuration
const CONFIG = {
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  s3: {
    maxKeys: 100, // Keep this reasonable for pagination
  }
} as const

// Simple S3 client setup
class S3ApiClient {
  private static instance: S3ApiClient | null = null
  private s3Client: S3Client
  private bucketName: string
  private cloudFrontDomain: string

  private constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME!
    this.cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN!
    
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  }

  static getInstance(): S3ApiClient {
    if (!S3ApiClient.instance) {
      S3ApiClient.instance = new S3ApiClient()
    }
    return S3ApiClient.instance
  }

  async listObjects(prefix: string, continuationToken?: string, maxKeys?: number): Promise<any> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: prefix,
      MaxKeys: maxKeys || CONFIG.s3.maxKeys,
      ContinuationToken: continuationToken,
      Delimiter: '/', // This groups objects by "folder"
    })

    return await this.s3Client.send(command)
  }

  getCloudFrontUrl(key: string): string {
    return `${this.cloudFrontDomain}/${key}`
  }
}

// Utility functions
function isImageFile(key: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']
  return imageExtensions.some(ext => key.toLowerCase().endsWith(ext))
}

function extractFolderName(prefix: string): string {
  const parts = prefix.split('/').filter(Boolean)
  return parts[parts.length - 1] || 'Root'
}

function getMimeType(key: string): string {
  const ext = key.toLowerCase().split('.').pop()
  const mimeTypes: { [key: string]: string } = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
    svg: 'image/svg+xml',
  }
  return mimeTypes[ext || ''] || 'application/octet-stream'
}

// Main API functions
async function findHeroImage(folderPrefix: string): Promise<string | null> {
  const client = S3ApiClient.getInstance()
  
  try {
    // Try to find exact HERO image first with common extensions
    const heroExtensions = ['jpg', 'jpeg', 'png', 'webp']
    
    for (const ext of heroExtensions) {
      const heroKey = `${folderPrefix}hero.${ext}`
      const heroResponse = await client.listObjects(heroKey, undefined, 1)
      
      if (heroResponse.Contents && heroResponse.Contents.length > 0) {
        const foundKey = heroResponse.Contents[0].Key!
        if (foundKey === heroKey) { // Exact match
          return client.getCloudFrontUrl(foundKey)
        }
      }
    }
    
    // If no exact HERO match, get first image from folder (MaxKeys=1 for efficiency)
    const imageResponse = await client.listObjects(folderPrefix, undefined, 1)
    const firstImage = imageResponse.Contents?.find((obj: { Key?: string }) => 
      obj.Key && isImageFile(obj.Key)
    )
    
    if (firstImage) {
      return client.getCloudFrontUrl(firstImage.Key!)
    }
    
    return null
  } catch (error) {
    console.warn(`Error finding hero image for ${folderPrefix}:`, error)
    return null
  }
}

export async function getFolders(parentPrefix: string = ''): Promise<S3Folder[]> {
  const client = S3ApiClient.getInstance()
  
  try {
    const response = await client.listObjects(parentPrefix)
    const folders: S3Folder[] = []

    // Process CommonPrefixes (folders)
    if (response.CommonPrefixes) {
      for (const prefix of response.CommonPrefixes) {
        const folderName = extractFolderName(prefix.Prefix!)
        const thumbnailUrl = await findHeroImage(prefix.Prefix!)
        
        folders.push({
          id: prefix.Prefix!,
          name: folderName,
          thumbnailUrl,
          imageCount: 0, // Simplified - will add later
          createdTime: new Date().toISOString(),
        })
      }
    }
    
    console.debug(folders)
    return folders
  } catch (error) {
    console.error('Error fetching folders:', error)
    return []
  }
}

export async function getFolderImages(
  prefix: string,
  continuationToken?: string,
  pageSize: number = CONFIG.pagination.defaultPageSize
): Promise<GalleryData> {
  const client = S3ApiClient.getInstance()

  try {
    console.log('Fetching images for:', { prefix, continuationToken, pageSize })
    
    // Make sure pageSize doesn't exceed maxKeys
    const actualPageSize = Math.min(pageSize, CONFIG.pagination.maxPageSize)
    
    const response = await client.listObjects(prefix, continuationToken, actualPageSize)
    const images: S3Image[] = []

    console.log('S3 Response:', {
      keyCount: response.KeyCount,
      isTruncated: response.IsTruncated,
      nextContinuationToken: response.NextContinuationToken,
      contentsLength: response.Contents?.length
    })

    if (response.Contents) {
      for (const obj of response.Contents) {
        if (obj.Key && isImageFile(obj.Key)) {
          const fileName = obj.Key.split('/').pop() || obj.Key
          
          images.push({
            id: obj.Key,
            name: fileName,
            mimeType: getMimeType(obj.Key),
            webViewLink: client.getCloudFrontUrl(obj.Key),
            thumbnailLink: client.getCloudFrontUrl(obj.Key), // Same as webViewLink for now
            folderName: extractFolderName(prefix),
            highQualityUrl: client.getCloudFrontUrl(obj.Key),
            size: obj.Size,
            lastModified: obj.LastModified?.toISOString(),
          })
        }
      }
    }

    const result: GalleryData = {
      folder: { 
        id: prefix, 
        name: extractFolderName(prefix)
      },
      images,
      nextPageToken: response.NextContinuationToken || undefined // Ensure undefined if null
    }

    console.log('Returning result:', {
      imagesCount: result.images.length,
      nextPageToken: result.nextPageToken,
      hasMore: !!result.nextPageToken
    })

    return result
  } catch (error) {
    console.error('Error fetching images:', error)
    return {
      folder: { id: prefix, name: extractFolderName(prefix) },
      images: [],
      nextPageToken: undefined
    }
  }
}

// Simple health check
export async function healthCheck(): Promise<boolean> {
  try {
    const client = S3ApiClient.getInstance()
    await client.listObjects('', undefined, 1) // Just check 1 item
    return true
  } catch (error) {
    console.error('Health check failed:', error)
    return false
  }
}