import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// ES modules replacement for __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Define image size presets
interface ImageMetadata {
  width: number
  height: number
  format: string
  size: number
  exif?: Record<string, unknown>
}

interface ProcessedImage {
  originalFile: string
  outputFile: string
  originalSize: number
  processedSize: number
  width: number
  height: number
  compressionRatio: number
  metadata?: ImageMetadata
}

// Configuration
const config = {
  inputDir: path.resolve(__dirname, '../original-photos'),
  outputDir: path.resolve(__dirname, '../public/photos'),
  maxWidth: 3840,
  maxHeight: 2560,
  quality: 92,
  format: 'webp' as const,
  generateManifest: true,
  resizeKernel: 'lanczos3' as const,
  webpOptions: {
    effort: 6,
    smartSubsample: true,
    nearLossless: false,
  },
}

/**
 * Process a single image with Sharp
 */
const processImage = async (
  inputPath: string,
  outputPath: string,
  options: {
    maxWidth: number
    maxHeight: number
    quality: number
    format: 'webp' | 'jpg' | 'avif'
    resizeKernel?: keyof sharp.KernelEnum
    webpOptions?: {
      effort?: number
      smartSubsample?: boolean
      nearLossless?: boolean
    }
  }
): Promise<{ width: number; height: number; size: number }> => {
  const {
    maxWidth,
    maxHeight,
    quality,
    format,
    resizeKernel = 'lanczos3',
    webpOptions = {},
  } = options

  try {
    // Get the original metadata for validating the image
    const _originalMetadata = await sharp(inputPath).metadata()

    // Create an optimized sharp pipeline
    let sharpInstance = sharp(inputPath)
      // First apply some slight sharpening to preserve details during resize
      .sharpen({
        sigma: 1.2, // Moderate sharpening
        m1: 0.3, // Controls the sharpening strength
        m2: 0.5, // Controls the sharpening strength
        x1: 6, // Sharpening radius threshold
        y2: 8, // Sharpening radius threshold
        y3: 8, // Sharpening radius threshold
      })
      // Then resize with high-quality settings
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true,
        kernel: resizeKernel, // Using the specified kernel for better resizing
      })

    // Apply format-specific processing
    if (format === 'webp') {
      sharpInstance = sharpInstance.webp({
        quality,
        effort: webpOptions.effort || 6, // Higher effort (0-6) for better compression
        smartSubsample:
          webpOptions.smartSubsample !== undefined ? webpOptions.smartSubsample : true,
        nearLossless: webpOptions.nearLossless || false, // Optional near-lossless mode
        alphaQuality: quality, // Match alpha channel quality with main quality
      })
    } else if (format === 'jpg') {
      sharpInstance = sharpInstance.jpeg({
        quality,
        mozjpeg: true, // Mozilla's optimized JPEG encoder
        trellisQuantisation: true, // Additional optimization
        overshootDeringing: true, // Reduces ringing artifacts
        optimizeScans: true, // Progressive optimization
      })
    } else if (format === 'avif') {
      sharpInstance = sharpInstance.avif({
        quality,
        effort: 9, // Higher effort (0-9) for better AVIF compression
        chromaSubsampling: '4:4:4', // Best color reproduction
      })
    }

    await sharpInstance.toFile(outputPath)

    // Get metadata of processed image
    const metadata = await sharp(outputPath).metadata()
    const stats = await fs.stat(outputPath)

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      size: stats.size,
    }
  } catch (error) {
    console.error(`Error processing image ${inputPath}:`, error)
    throw error
  }
}

/**
 * Extract metadata from an image
 */
const extractMetadata = async (inputPath: string): Promise<ImageMetadata> => {
  try {
    const metadata = await sharp(inputPath).metadata()
    const stats = await fs.stat(inputPath)

    // Handle exif data safely
    let exifData: Record<string, unknown> | undefined = undefined
    if (metadata.exif) {
      try {
        // Try to parse EXIF as JSON if possible
        const exifString = metadata.exif.toString()
        if (exifString.startsWith('{')) {
          exifData = JSON.parse(exifString)
        } else {
          // Store as a simple object with raw buffer
          exifData = { raw: metadata.exif }
        }
      } catch {
        // If parsing fails, store basic info
        exifData = { raw: 'EXIF data available but not parseable' }
      }
    }

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || '',
      size: stats.size,
      exif: exifData,
    }
  } catch (error) {
    console.error(`Error extracting metadata from ${inputPath}:`, error)
    throw error
  }
}

/**
 * Recursively process images in directories
 */
const processImagesInDirectory = async (
  inputDir: string,
  outputDir: string,
  relativePath = ''
): Promise<ProcessedImage[]> => {
  // Ensure output directory exists
  const currentOutputDir = path.join(outputDir, relativePath)
  await fs.mkdir(currentOutputDir, { recursive: true })

  // Get all items in the input directory
  const currentInputDir = path.join(inputDir, relativePath)
  const items = await fs.readdir(currentInputDir)

  const results: ProcessedImage[] = []

  // Process each item (file or directory)
  for (const item of items) {
    const inputItemPath = path.join(currentInputDir, item)
    const stats = await fs.stat(inputItemPath)

    if (stats.isDirectory()) {
      // If directory, recursively process its contents
      const subDirRelativePath = relativePath ? path.join(relativePath, item) : item
      const subResults = await processImagesInDirectory(inputDir, outputDir, subDirRelativePath)
      results.push(...subResults)
    } else {
      // If file, check if it's an image
      const ext = path.extname(item).toLowerCase()
      if (['.jpg', '.jpeg', '.png', '.tiff', '.webp'].includes(ext)) {
        const fileNameWithoutExt = path.parse(item).name
        const outputFileName = `${fileNameWithoutExt}.${config.format}`
        const outputPath = path.join(currentOutputDir, outputFileName)

        // Check if file already exists in output directory
        try {
          await fs.access(outputPath)
          console.log(`Skipping ${item} - already processed`)
          continue
        } catch {
          // File doesn't exist, proceed with processing
        }

        // Extract metadata from original image
        const metadata = await extractMetadata(inputItemPath)
        const originalSize = metadata.size

        console.log(
          `Processing ${path.join(relativePath, item)} (${metadata.width}x${metadata.height}, ${(originalSize / 1024 / 1024).toFixed(2)}MB)`
        )

        // Process the image
        const processedData = await processImage(inputItemPath, outputPath, {
          maxWidth: config.maxWidth,
          maxHeight: config.maxHeight,
          quality: config.quality,
          format: config.format,
          resizeKernel: config.resizeKernel,
          webpOptions: config.webpOptions,
        })

        // Calculate compression ratio
        const compressionRatio = originalSize / processedData.size

        // Store result
        results.push({
          originalFile: path.join(relativePath, item),
          outputFile: path.join(relativePath, outputFileName),
          originalSize,
          processedSize: processedData.size,
          width: processedData.width,
          height: processedData.height,
          compressionRatio,
          metadata,
        })

        console.log(
          `Processed: ${outputFileName} (${processedData.width}x${processedData.height}, ${(processedData.size / 1024 / 1024).toFixed(2)}MB, compression ratio: ${compressionRatio.toFixed(2)}x)`
        )
      }
    }
  }

  return results
}

/**
 * Process all images in the directory
 */
const processImages = async () => {
  try {
    console.log('Starting image processing...')
    console.log(`Input directory: ${config.inputDir}`)
    console.log(`Output directory: ${config.outputDir}`)
    console.log(
      `Format: ${config.format}, Quality: ${config.quality}, Max dimensions: ${config.maxWidth}x${config.maxHeight}`
    )

    // Process images recursively
    const results = await processImagesInDirectory(config.inputDir, config.outputDir)

    // Generate manifest if requested
    if (config.generateManifest) {
      const manifestPath = path.join(config.outputDir, 'manifest.json')
      await fs.writeFile(manifestPath, JSON.stringify(results, null, 2), 'utf-8')
      console.log(`Image manifest written to ${manifestPath}`)
    }

    console.log(`Successfully processed ${results.length} images`)
  } catch (error) {
    console.error('Error processing images:', error)
    process.exit(1)
  }
}

// Run the script
processImages()
