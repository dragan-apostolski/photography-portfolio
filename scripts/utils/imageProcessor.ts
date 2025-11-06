import sharp from 'sharp'
import fs from 'fs'

const MAX_DIMENSION = 2500
const QUALITY = 80
const SIZE_THRESHOLD_BYTES = 3 * 1024 * 1024 // 3MB

export interface ProcessedImage {
  buffer: Buffer
  originalSize: number
  processedSize: number
  wasProcessed: boolean
  dimensions: { width: number; height: number }
}

/**
 * Process an image file - resize if needed and convert to JPEG
 * @param filePath - Path to the image file
 * @returns Processed image buffer and metadata
 */
export async function processImage(filePath: string): Promise<ProcessedImage> {
  const stats = fs.statSync(filePath)
  const originalSize = stats.size

  // Check if processing is needed
  const needsProcessing = originalSize > SIZE_THRESHOLD_BYTES

  if (!needsProcessing) {
    // Read file as-is and return
    const buffer = fs.readFileSync(filePath)
    const metadata = await sharp(buffer).metadata()
    
    return {
      buffer,
      originalSize,
      processedSize: originalSize,
      wasProcessed: false,
      dimensions: {
        width: metadata.width || 0,
        height: metadata.height || 0,
      },
    }
  }

  // Process the image
  const image = sharp(filePath)
  const metadata = await image.metadata()

  const width = metadata.width || 0
  const height = metadata.height || 0
  const longestSide = Math.max(width, height)

  let processedImage = image

  // Resize if the longest side is greater than MAX_DIMENSION
  if (longestSide > MAX_DIMENSION) {
    const isLandscape = width > height
    processedImage = isLandscape
      ? processedImage.resize(MAX_DIMENSION, null)
      : processedImage.resize(null, MAX_DIMENSION)
  }

  // Convert to JPEG with specified quality
  const buffer = await processedImage
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer()

  const processedMetadata = await sharp(buffer).metadata()

  return {
    buffer,
    originalSize,
    processedSize: buffer.length,
    wasProcessed: true,
    dimensions: {
      width: processedMetadata.width || 0,
      height: processedMetadata.height || 0,
    },
  }
}

/**
 * Check if an image needs processing based on file size
 * @param filePath - Path to the image file
 * @returns True if image size is greater than threshold
 */
export function needsProcessing(filePath: string): boolean {
  const stats = fs.statSync(filePath)
  return stats.size > SIZE_THRESHOLD_BYTES
}

/**
 * Format bytes to human readable format
 * @param bytes - Number of bytes
 * @returns Formatted string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

