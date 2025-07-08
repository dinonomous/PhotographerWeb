// pages/api/gallery/[folderId].ts or app/api/gallery/[folderId]/route.ts
import { getFolderImages } from "@/lib/google-drive"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { folderId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const pageToken = searchParams.get('pageToken') || undefined
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    
    const result = await getFolderImages(params.folderId, pageToken, pageSize)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching gallery images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    )
  }
}