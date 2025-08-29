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
  projectsInputDir: path.resolve(__dirname, '../original-photos/projects'),
  projectsOutputDir: path.resolve(__dirname, '../public/projects'),
  maxWidth: 2560,
  maxHeight: 1920,
  quality: 85,
  format: 'avif' as 'webp' | 'jpg' | 'avif',
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
 * Process projects specifically
 */
const processProjects = async () => {
  try {
    console.log('Processing project images...')
    console.log(`Projects input directory: ${config.projectsInputDir}`)
    console.log(`Projects output directory: ${config.projectsOutputDir}`)

    // Ensure projects output directory exists
    await fs.mkdir(config.projectsOutputDir, { recursive: true })

    // Get all project directories
    const projectDirs = await fs.readdir(config.projectsInputDir)
    const allResults: ProcessedImage[] = []

    for (const projectDir of projectDirs) {
      const projectInputPath = path.join(config.projectsInputDir, projectDir)
      const projectOutputPath = path.join(config.projectsOutputDir, projectDir)

      const stats = await fs.stat(projectInputPath)
      if (stats.isDirectory()) {
        console.log(`\n--- Processing project: ${projectDir} ---`)

        // Process images in this project directory
        const projectResults = await processImagesInDirectory(
          config.projectsInputDir,
          config.projectsOutputDir,
          projectDir
        )

        allResults.push(...projectResults)

        // Generate project-specific manifest
        const projectManifestPath = path.join(projectOutputPath, 'manifest.json')
        await fs.writeFile(projectManifestPath, JSON.stringify(projectResults, null, 2), 'utf-8')
        console.log(`Project manifest written to ${projectManifestPath}`)
        console.log(`Processed ${projectResults.length} images for project: ${projectDir}`)
      }
    }

    // Generate global projects manifest
    const globalManifestPath = path.join(config.projectsOutputDir, 'all-projects-manifest.json')
    await fs.writeFile(globalManifestPath, JSON.stringify(allResults, null, 2), 'utf-8')
    console.log(`\nGlobal projects manifest written to ${globalManifestPath}`)
    console.log(`Successfully processed ${allResults.length} total project images`)

    return allResults
  } catch (error) {
    console.error('Error processing project images:', error)
    throw error
  }
}

/**
 * Process regular gallery images
 */
const processGalleryImages = async () => {
  try {
    console.log('Processing gallery images...')
    console.log(`Input directory: ${config.inputDir}`)
    console.log(`Output directory: ${config.outputDir}`)

    // Process images recursively, but exclude the projects directory
    const items = await fs.readdir(config.inputDir)
    const allResults: ProcessedImage[] = []

    for (const item of items) {
      if (item === 'projects') {
        console.log('Skipping projects directory in gallery processing')
        continue
      }

      const itemPath = path.join(config.inputDir, item)
      const stats = await fs.stat(itemPath)

      if (stats.isDirectory()) {
        console.log(`\n--- Processing gallery category: ${item} ---`)
        const categoryResults = await processImagesInDirectory(
          config.inputDir,
          config.outputDir,
          item
        )
        allResults.push(...categoryResults)
      }
    }

    // Generate gallery manifest
    if (config.generateManifest && allResults.length > 0) {
      const manifestPath = path.join(config.outputDir, 'manifest.json')
      await fs.writeFile(manifestPath, JSON.stringify(allResults, null, 2), 'utf-8')
      console.log(`Gallery manifest written to ${manifestPath}`)
    }

    console.log(`Successfully processed ${allResults.length} gallery images`)
    return allResults
  } catch (error) {
    console.error('Error processing gallery images:', error)
    throw error
  }
}

/**
 * Process all images - both gallery and projects
 */
const processImages = async () => {
  try {
    console.log('=== Starting image processing ===')
    console.log(
      `Format: ${config.format}, Quality: ${config.quality}, Max dimensions: ${config.maxWidth}x${config.maxHeight}`
    )

    // Process gallery images (excluding projects)
    const galleryResults = await processGalleryImages()

    console.log('\n' + '='.repeat(50))

    // Process project images
    const projectResults = await processProjects()

    console.log('\n' + '='.repeat(50))
    console.log('=== Processing Summary ===')
    console.log(`Gallery images processed: ${galleryResults.length}`)
    console.log(`Project images processed: ${projectResults.length}`)
    console.log(`Total images processed: ${galleryResults.length + projectResults.length}`)
  } catch (error) {
    console.error('Error processing images:', error)
    process.exit(1)
  }
}

/**
 * Process a specific project directory
 */
const processSpecificProject = async (projectName: string) => {
  try {
    console.log(`=== Processing specific project: ${projectName} ===`)
    console.log(
      `Format: ${config.format}, Quality: ${config.quality}, Max dimensions: ${config.maxWidth}x${config.maxHeight}`
    )

    const projectInputPath = path.join(config.projectsInputDir, projectName)
    const projectOutputPath = path.join(config.projectsOutputDir, projectName)

    // Check if project directory exists
    try {
      const stats = await fs.stat(projectInputPath)
      if (!stats.isDirectory()) {
        console.error(`Error: ${projectName} is not a directory`)
        process.exit(1)
      }
    } catch {
      console.error(`Error: Project directory '${projectName}' not found at ${projectInputPath}`)
      process.exit(1)
    }

    // Ensure projects output directory exists
    await fs.mkdir(config.projectsOutputDir, { recursive: true })

    console.log(`Processing project: ${projectName}`)
    console.log(`Input path: ${projectInputPath}`)
    console.log(`Output path: ${projectOutputPath}`)

    // Process images in this specific project directory
    const projectResults = await processImagesInDirectory(
      config.projectsInputDir,
      config.projectsOutputDir,
      projectName
    )

    // Generate project-specific manifest
    const projectManifestPath = path.join(projectOutputPath, 'manifest.json')
    await fs.writeFile(projectManifestPath, JSON.stringify(projectResults, null, 2), 'utf-8')

    console.log('\n' + '='.repeat(50))
    console.log('=== Processing Summary ===')
    console.log(`Project: ${projectName}`)
    console.log(`Images processed: ${projectResults.length}`)
    console.log(`Manifest written to: ${projectManifestPath}`)

    return projectResults
  } catch (error) {
    console.error(`Error processing project '${projectName}':`, error)
    process.exit(1)
  }
}

/**
 * Process any specific folder within original-photos
 */
const processSpecificFolder = async (folderPath: string) => {
  try {
    console.log(`=== Processing specific folder: ${folderPath} ===`)
    console.log(
      `Format: ${config.format}, Quality: ${config.quality}, Max dimensions: ${config.maxWidth}x${config.maxHeight}`
    )

    // Determine if this is a project folder or a regular gallery folder
    const isProjectFolder = folderPath.startsWith('projects/')

    // Set the appropriate base input and output directories
    const baseInputDir = isProjectFolder
      ? config.projectsInputDir.replace('/projects', '')
      : config.inputDir
    const baseOutputDir = isProjectFolder
      ? config.projectsOutputDir.replace('/projects', '')
      : config.outputDir

    // Get the relative folder path (without 'projects/' prefix if it's a project)
    const relativePath = isProjectFolder ? folderPath.replace('projects/', '') : folderPath

    const fullInputPath = path.join(baseInputDir, folderPath)
    const fullOutputPath = path.join(baseOutputDir, folderPath)

    // Check if folder exists
    try {
      const stats = await fs.stat(fullInputPath)
      if (!stats.isDirectory()) {
        console.error(`Error: ${folderPath} is not a directory`)
        process.exit(1)
      }
    } catch {
      console.error(`Error: Folder '${folderPath}' not found at ${fullInputPath}`)
      process.exit(1)
    }

    // Ensure output directory exists
    await fs.mkdir(fullOutputPath, { recursive: true })

    console.log(`Processing folder: ${folderPath}`)
    console.log(`Input path: ${fullInputPath}`)
    console.log(`Output path: ${fullOutputPath}`)

    // Process images in this specific folder
    // If it's a project folder, use project directories as base
    // If it's a regular gallery folder, use regular directories as base
    const inputDir = isProjectFolder ? config.projectsInputDir : config.inputDir
    const outputDir = isProjectFolder ? config.projectsOutputDir : config.outputDir
    const directoryPath = isProjectFolder ? relativePath : folderPath

    const results = await processImagesInDirectory(inputDir, outputDir, directoryPath)

    // Generate folder-specific manifest
    const manifestPath = path.join(fullOutputPath, 'manifest.json')
    await fs.writeFile(manifestPath, JSON.stringify(results, null, 2), 'utf-8')

    console.log('\n' + '='.repeat(50))
    console.log('=== Processing Summary ===')
    console.log(`Folder: ${folderPath}`)
    console.log(`Images processed: ${results.length}`)
    console.log(`Manifest written to: ${manifestPath}`)

    return results
  } catch (error) {
    console.error(`Error processing folder '${folderPath}':`, error)
    process.exit(1)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)

// Helper function to parse arguments with format --key=value
const parseArgs = () => {
  const parsedArgs: Record<string, string> = {}
  let targetFolder: string | undefined

  args.forEach((arg) => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=')
      if (key && value !== undefined) {
        parsedArgs[key] = value
      }
    } else {
      // If not a --key=value format, assume it's the target folder
      targetFolder = arg
    }
  })

  return { parsedArgs, targetFolder }
}

// Parse arguments
const { parsedArgs, targetFolder: folderPath } = parseArgs()

// Set format and quality if provided
if (parsedArgs.format && ['webp', 'jpg', 'avif'].includes(parsedArgs.format)) {
  config.format = parsedArgs.format as 'webp' | 'jpg' | 'avif'
}

if (parsedArgs.quality) {
  const qualityValue = parseInt(parsedArgs.quality, 10)
  if (!isNaN(qualityValue) && qualityValue >= 1 && qualityValue <= 100) {
    config.quality = qualityValue
  }
}

// Helper function to check if a directory exists
const directoryExists = async (dirPath: string): Promise<boolean> => {
  try {
    const stats = await fs.stat(dirPath)
    return stats.isDirectory()
  } catch {
    return false
  }
}

// Run the script
if (folderPath) {
  // First try to determine if it's a project by checking if the directory exists
  const isProjectDir = async (): Promise<boolean> => {
    // Check if it's a direct project name (legacy format without 'projects/' prefix)
    if (!folderPath.includes('/')) {
      return await directoryExists(path.join(config.projectsInputDir, folderPath))
    }
    return false
  }

  isProjectDir().then((isProject) => {
    console.log(`Format: ${config.format}, Quality: ${config.quality}`)
    if (isProject) {
      console.log(`Processing specific project: ${folderPath}`)
      processSpecificProject(folderPath)
    } else {
      console.log(`Processing specific folder: ${folderPath}`)
      processSpecificFolder(folderPath)
    }
  })
} else {
  console.log('Processing all projects and gallery images')
  processImages()
}
