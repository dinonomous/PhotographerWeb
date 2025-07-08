import type { DriveFolder, GalleryData, DriveImage } from "./types"

const GOOGLE_DRIVE_API_KEY = process.env.GOOGLE_DRIVE_API_KEY
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID

// Rate limiting configuration
const RATE_LIMIT = {
  delay: 100, // Base delay between requests (ms)
  maxRetries: 3,
  backoffMultiplier: 2,
}

console.debug("GOOGLE_DRIVE_API_KEY:", GOOGLE_DRIVE_API_KEY ? "set" : "not set")
console.debug("GOOGLE_DRIVE_FOLDER_ID:", GOOGLE_DRIVE_FOLDER_ID ? "set" : "not set")

if (!GOOGLE_DRIVE_API_KEY || !GOOGLE_DRIVE_FOLDER_ID) {
  console.warn("Google Drive API credentials not configured")
}

// Enhanced delay function with exponential backoff
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Rate-limited fetch wrapper
async function rateLimitedFetch(url: string, retries = 0): Promise<Response> {
  try {
    await delay(RATE_LIMIT.delay * Math.pow(RATE_LIMIT.backoffMultiplier, retries))
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (response.status === 429) {
      if (retries < RATE_LIMIT.maxRetries) {
        console.warn(`Rate limited, retrying in ${RATE_LIMIT.delay * Math.pow(RATE_LIMIT.backoffMultiplier, retries + 1)}ms`)
        return rateLimitedFetch(url, retries + 1)
      }
      throw new Error('Rate limit exceeded after max retries')
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response
  } catch (error) {
    if (retries < RATE_LIMIT.maxRetries) {
      console.warn(`Request failed, retrying: ${error}`)
      return rateLimitedFetch(url, retries + 1)
    }
    throw error
  }
}

// Get just the first image thumbnail from a folder (any image from any subfolder)
async function getFirstImageThumbnail(folderId: string): Promise<string | null> {
  const query = `'${folderId}' in parents and trashed = false`
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,thumbnailLink)&pageSize=10&key=${GOOGLE_DRIVE_API_KEY}`

  try {
    const response = await rateLimitedFetch(url)
    const data = await response.json()

    // First, look for direct images
    for (const file of data.files || []) {
      if (file.mimeType.startsWith("image/")) {
        return file.thumbnailLink ? file.thumbnailLink.replace(/=s\d+/, '=s400') : null
      }
    }

    // If no direct images, check just one subfolder (not all)
    for (const file of data.files || []) {
      if (file.mimeType === "application/vnd.google-apps.folder") {
        const thumb = await getFirstImageThumbnail(file.id)
        if (thumb) return thumb
        // Return after first subfolder check to avoid excessive requests
        break
      }
    }
  } catch (error) {
    console.error(`Error fetching thumbnail for folder ${folderId}:`, error)
  }

  return null
}

export async function getFolders(): Promise<DriveFolder[]> {
  if (!GOOGLE_DRIVE_API_KEY || !GOOGLE_DRIVE_FOLDER_ID) return []

  const folderUrl = `https://www.googleapis.com/drive/v3/files?q='${GOOGLE_DRIVE_FOLDER_ID}'+in+parents+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false&fields=files(id,name)&orderBy=name&key=${GOOGLE_DRIVE_API_KEY}`
  
  try {
    const folderRes = await rateLimitedFetch(folderUrl)
    const folderData = await folderRes.json()
    
    const folders: DriveFolder[] = []

    // Process folders sequentially to avoid rate limiting
    for (const folder of folderData.files || []) {
      try {
        const thumbnailUrl = await getFirstImageThumbnail(folder.id)
        
        folders.push({
          id: folder.id,
          name: folder.name,
          thumbnailUrl: thumbnailUrl || '',
          imageCount: 0, // Remove image counting
          createdTime: '' // Remove date info
        })
      } catch (error) {
        console.error(`Error processing folder ${folder.name}:`, error)
        // Still add folder even if thumbnail fails
        folders.push({
          id: folder.id,
          name: folder.name,
          thumbnailUrl: '',
          imageCount: 0,
          createdTime: ''
        })
      }
    }

    return folders
  } catch (error) {
    console.error("Error fetching folders:", error)
    return []
  }
}

// Recursively get images from folder and subfolders with pagination
async function getImagesFromFolder(
  folderId: string, 
  pageToken?: string,
  pageSize: number = 20
): Promise<{ images: DriveImage[], nextPageToken?: string }> {
  const query = `'${folderId}' in parents and trashed = false`
  let url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,webViewLink,thumbnailLink)&pageSize=${pageSize}&key=${GOOGLE_DRIVE_API_KEY}`
  
  if (pageToken) {
    url += `&pageToken=${pageToken}`
  }

  try {
    const response = await rateLimitedFetch(url)
    const data = await response.json()
    
    const images: DriveImage[] = []
    const subfolders: string[] = []
    
    // Separate images and subfolders
    for (const file of data.files || []) {
      if (file.mimeType.startsWith("image/")) {
        images.push({
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          webViewLink: file.webViewLink,
          thumbnailLink: file.thumbnailLink ? file.thumbnailLink.replace(/=s\d+/, '=s800') : '',
          folderName: '',
          highQualityUrl: file.thumbnailLink ? file.thumbnailLink.replace(/=s\d+/, '=s1600') : file.webViewLink
        })
      } else if (file.mimeType === "application/vnd.google-apps.folder") {
        subfolders.push(file.id)
      }
    }

    // If we have enough images or there's a next page token, return current results
    if (images.length >= pageSize || data.nextPageToken) {
      return {
        images,
        nextPageToken: data.nextPageToken
      }
    }

    // If we need more images and no next page token, check subfolders
    if (images.length < pageSize && subfolders.length > 0) {
      for (const subfolderId of subfolders) {
        const subfolderResult = await getImagesFromFolder(subfolderId, undefined, pageSize - images.length)
        images.push(...subfolderResult.images)
        
        if (images.length >= pageSize) break
      }
    }

    return { images }
  } catch (error) {
    console.error(`Error fetching images from folder ${folderId}:`, error)
    return { images: [] }
  }
}

export async function getFolderImages(
  folderId: string, 
  pageToken?: string,
  pageSize: number = 20
): Promise<GalleryData> {
  try {
    // Get folder info
    const folderResponse = await rateLimitedFetch(
      `https://www.googleapis.com/drive/v3/files/${folderId}?key=${GOOGLE_DRIVE_API_KEY}&fields=id,name`
    )
    const folderData = await folderResponse.json()

    const result = await getImagesFromFolder(folderId, pageToken, pageSize)
    console.debug(result.nextPageToken)
    
    return {
      folder: { id: folderId, name: folderData.name || "Gallery" },
      images: result.images,
      nextPageToken: result.nextPageToken
    }
  } catch (error) {
    console.error("Error fetching images:", error)
    return {
      folder: { id: folderId, name: "Gallery" },
      images: [],
    }
  }
}