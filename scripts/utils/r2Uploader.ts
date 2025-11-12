import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

export interface R2UploadResult {
  url: string
  pathname: string
  fileName: string
  size: number
  uploadedAt: Date
}

/**
 * Initialize S3 client for R2
 */
export function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Missing R2 credentials. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY in your .env file.',
    )
  }

  const trimmedAccountId = accountId.trim()

  return new S3Client({
    region: 'auto',
    endpoint: `https://${trimmedAccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId.trim(),
      secretAccessKey: secretAccessKey.trim(),
    },
    forcePathStyle: true,
  })
}

/**
 * Check if object already exists in R2
 */
export async function r2ObjectExists(
  s3Client: S3Client,
  bucketName: string,
  key: string,
): Promise<boolean> {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
    )
    return true
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false
    }
    throw error
  }
}

/**
 * Upload a file to R2 storage
 * @param s3Client - S3 client instance
 * @param bucketName - R2 bucket name
 * @param buffer - File buffer to upload
 * @param pathname - Path where file should be stored (e.g., 'photos/Projects/ProjectName/photo.jpg')
 * @param fileName - Original file name for reference
 * @param allowOverwrite - Whether to overwrite existing files
 * @param publicUrl - Base URL for public access (optional)
 * @returns Upload result with URL and metadata
 */
export async function uploadToR2(
  s3Client: S3Client,
  bucketName: string,
  buffer: Buffer,
  pathname: string,
  fileName: string,
  allowOverwrite = false,
  publicUrl?: string,
): Promise<R2UploadResult> {
  try {
    // Check if already exists
    if (!allowOverwrite) {
      const exists = await r2ObjectExists(s3Client, bucketName, pathname)
      if (exists) {
        throw new Error(`File already exists: ${pathname}. Use --overwrite flag to replace it.`)
      }
    }

    // Upload to R2
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: pathname,
        Body: buffer,
        ContentType: getContentType(fileName),
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    )

    // Construct public URL
    const url = publicUrl ? `${publicUrl}/${pathname}` : `https://${bucketName}.r2.dev/${pathname}`

    return {
      url,
      pathname,
      fileName,
      size: buffer.length,
      uploadedAt: new Date(),
    }
  } catch (error) {
    throw new Error(`Failed to upload ${fileName} to R2: ${error}`)
  }
}

/**
 * Generate R2 pathname for a photo (same structure as Vercel Blob)
 * @param category - 'Projects' or 'Other'
 * @param folderName - Project folder name (empty for Other)
 * @param fileName - File name
 * @returns Full pathname for R2 storage
 */
export function generateR2Pathname(
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
 * Get content type based on file extension
 */
function getContentType(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop()
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'gif':
      return 'image/gif'
    default:
      return 'application/octet-stream'
  }
}

/**
 * Validate R2 credentials are set
 * @throws Error if credentials are not set
 */
export function validateR2Credentials(): void {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucketName = process.env.R2_BUCKET_NAME

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error(
      'Missing R2 credentials. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME in your .env file.',
    )
  }
}

