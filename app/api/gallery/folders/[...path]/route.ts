import { NextRequest, NextResponse } from 'next/server'
import { getFolders } from '@/lib/google-drive'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const folderPath = params.path?.join('/') || ''
    const folders = await getFolders(folderPath)
    
    return NextResponse.json({
      success: true,
      data: folders,
      path: folderPath
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        'CDN-Cache-Control': 'max-age=86400'
      }
    })
  } catch (error) {
    console.error('Error fetching folders:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch folders'
    }, { status: 500 })
  }
}