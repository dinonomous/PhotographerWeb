import { NextRequest, NextResponse } from 'next/server'
import { getFolderImages } from '@/lib/google-drive'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const folderPath = params.path?.join('/') || ''
    const pageSize = parseInt(searchParams.get('size') || '50')
    const continuationToken = searchParams.get('token') || undefined
    
    const result = await getFolderImages(folderPath, continuationToken, pageSize)
    
    return NextResponse.json({
      success: true,
      data: result,
      path: folderPath
    }, {
      headers: {
        'Cache-Control': 'public, max-age=1800, s-maxage=3600',
        'CDN-Cache-Control': 'max-age=3600'
      }
    })
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch images'
    }, { status: 500 })
  }
}