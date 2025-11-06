import { put } from '@vercel/blob'

export interface BlobUploadResult {
  url: string
  pathname: string
  fileName: string
  size: number
  uploadedAt: Date
}

/**
 * Upload a file to Vercel Blob storage
 * @param buffer - File buffer to upload
 * @param pathname - Path where file should be stored (e.g., 'photos/Projects/ProjectName/photo.jpg')
 * @param fileName - Original file name for reference
 * @returns Upload result with blob URL and metadata
 */
export async function uploadToBlob(
  buffer: Buffer,
  pathname: string,
  fileName: string,
  allowOverwrite = false,
): Promise<BlobUploadResult> {
  try {
    const blob = await put(pathname, buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
      allowOverwrite,
    })

    return {
      url: blob.url,
      pathname: blob.pathname,
      fileName,
      size: buffer.length,
      uploadedAt: blob.uploadedAt ? new Date(blob.uploadedAt) : new Date(),
    }
  } catch (error) {
    throw new Error(`Failed to upload ${fileName} to blob storage: ${error}`)
  }
}

/**
 * Generate blob pathname for a photo
 * @param category - 'Projects' or 'Other'
 * @param folderName - Project folder name (empty for Other)
 * @param fileName - File name
 * @returns Full pathname for blob storage
 */
export function generateBlobPathname(
  category: 'Projects' | 'Other',
  folderName: string,
  fileName: string,
): string {
  if (category === 'Other') {
    return `photos/Other/${fileName}`
  }
  return `photos/Projects/${folderName}/${fileName}`
}

/**
 * Validate blob token is set
 * @throws Error if token is not set
 */
export function validateBlobToken(): void {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN environment variable is not set. Please add it to your .env.local file.',
    )
  }
}

