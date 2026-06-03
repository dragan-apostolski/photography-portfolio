import fs from 'fs'
import path from 'path'
import { S3Client } from '@aws-sdk/client-s3'
import { processImage, formatBytes } from './utils/imageProcessor'
import { uploadToBlob, generateBlobPathname, validateBlobToken } from './utils/blobUploader'
import {
  uploadToR2,
  generateR2Pathname,
  validateR2Credentials,
  getR2Client,
} from './utils/r2Uploader'

interface UploadManifestEntry {
  originalPath: string
  fileName: string
  blobUrl: string
  blobPathname: string
  category: 'Projects' | 'Other'
  folderName: string
  originalSize: number
  uploadedSize: number
  wasProcessed: boolean
  dimensions: { width: number; height: number }
  uploadedAt: string
  storage?: 'blob' | 'r2'
}

interface UploadStats {
  totalPhotos: number
  uploadedPhotos: number
  failedPhotos: number
  totalOriginalSize: number
  totalUploadedSize: number
  processedCount: number
  skippedCount: number
}

const isDryRun = process.argv.includes('--dry-run')
const allowOverwrite = process.argv.includes('--overwrite')
const folderArg = process.argv.find((arg) => arg.startsWith('--folder='))
const specificFolder = folderArg ? folderArg.split('=')[1] : null
const filesArg = process.argv.find((arg) => arg.startsWith('--files='))
const specificFiles = filesArg
  ? filesArg
      .split('=')[1]
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0)
  : null
const storageArg = process.argv.find((arg) => arg.startsWith('--storage='))
const storageType = (storageArg ? storageArg.split('=')[1] : 'r2') as 'blob' | 'r2'
// --source lets you upload directly from any folder on disk (e.g. a Google Drive
// mount) without first copying the photos into original-photos/.
const sourceArg = process.argv.find((arg) => arg.startsWith('--source='))
const sourcePath = sourceArg ? sourceArg.substring('--source='.length) : null
// --project sets the R2 project folder name when uploading from --source.
const projectArg = process.argv.find((arg) => arg.startsWith('--project='))
const sourceProjectName = projectArg ? projectArg.substring('--project='.length) : null
// --category controls whether a --source folder lands under Projects/ or Other/.
const categoryArg = process.argv.find((arg) => arg.startsWith('--category='))
const sourceCategory = (categoryArg ? categoryArg.substring('--category='.length) : 'Projects') as
  | 'Projects'
  | 'Other'

// R2 specific vars
let r2Client: S3Client | null = null
let r2BucketName: string | null = null
let r2PublicUrl: string | null = null

const manifest: UploadManifestEntry[] = []
const stats: UploadStats = {
  totalPhotos: 0,
  uploadedPhotos: 0,
  failedPhotos: 0,
  totalOriginalSize: 0,
  totalUploadedSize: 0,
  processedCount: 0,
  skippedCount: 0,
}

async function uploadPhoto(
  filePath: string,
  fileName: string,
  category: 'Projects' | 'Other',
  folderName: string,
): Promise<void> {
  try {
    stats.totalPhotos++
    
    // Process the image
    console.log(`\n📸 Processing: ${fileName}`)
    const processed = await processImage(filePath)
    
    stats.totalOriginalSize += processed.originalSize
    stats.totalUploadedSize += processed.processedSize
    
    if (processed.wasProcessed) {
      stats.processedCount++
      console.log(`   ✅ Processed: ${formatBytes(processed.originalSize)} → ${formatBytes(processed.processedSize)}`)
      console.log(`   📐 Dimensions: ${processed.dimensions.width}x${processed.dimensions.height}`)
    } else {
      stats.skippedCount++
      console.log(`   ⏭️  Skipped processing (already optimized): ${formatBytes(processed.originalSize)}`)
    }

    // Generate pathname based on storage type
    const pathname =
      storageType === 'r2'
        ? generateR2Pathname(category, folderName, fileName)
        : generateBlobPathname(category, folderName, fileName)
    
    if (isDryRun) {
      console.log(`   🔍 [DRY RUN] Would upload to ${storageType.toUpperCase()}: ${pathname}`)
      stats.uploadedPhotos++
    } else {
      // Upload based on storage type
      if (storageType === 'r2') {
        console.log(`   ⬆️  Uploading to R2...`)
        const result = await uploadToR2(
          r2Client!,
          r2BucketName!,
          processed.buffer,
          pathname,
          fileName,
          allowOverwrite,
          r2PublicUrl || undefined,
        )
        console.log(`   ✅ Uploaded: ${result.url}`)
        
        // Add to manifest
        manifest.push({
          originalPath: filePath,
          fileName,
          blobUrl: result.url,
          blobPathname: result.pathname,
          category,
          folderName,
          originalSize: processed.originalSize,
          uploadedSize: processed.processedSize,
          wasProcessed: processed.wasProcessed,
          dimensions: processed.dimensions,
          uploadedAt: result.uploadedAt.toISOString(),
          storage: 'r2',
        })
      } else {
        console.log(`   ⬆️  Uploading to Vercel Blob...`)
        const result = await uploadToBlob(processed.buffer, pathname, fileName, allowOverwrite)
        console.log(`   ✅ Uploaded: ${result.url}`)
        
        // Add to manifest
        manifest.push({
          originalPath: filePath,
          fileName,
          blobUrl: result.url,
          blobPathname: result.pathname,
          category,
          folderName,
          originalSize: processed.originalSize,
          uploadedSize: processed.processedSize,
          wasProcessed: processed.wasProcessed,
          dimensions: processed.dimensions,
          uploadedAt: result.uploadedAt.toISOString(),
          storage: 'blob',
        })
      }
      
      stats.uploadedPhotos++
    }
  } catch (error) {
    stats.failedPhotos++
    console.error(`   ❌ Failed to upload ${fileName}:`, error)
  }
}

async function uploadProjectFolder(projectPath: string, projectName: string): Promise<void> {
  const imageExtensions = ['.jpg', '.jpeg', '.JPG', '.JPEG']
  
  console.log(`\n${'='.repeat(80)}`)
  console.log(`📁 Processing project: ${projectName}`)
  console.log('='.repeat(80))
  
  const files = fs.readdirSync(projectPath)
  const imageFiles = files.filter((file) => {
    const ext = path.extname(file)
    return imageExtensions.includes(ext)
  })
  
  console.log(`Found ${imageFiles.length} photos in ${projectName}`)
  
  for (const fileName of imageFiles) {
    const filePath = path.join(projectPath, fileName)
    await uploadPhoto(filePath, fileName, 'Projects', projectName)
  }
}

async function uploadOtherFolder(otherPath: string): Promise<void> {
  const imageExtensions = ['.jpg', '.jpeg', '.JPG', '.JPEG']
  
  console.log(`\n${'='.repeat(80)}`)
  console.log(`📁 Processing folder: Other`)
  console.log('='.repeat(80))
  
  const files = fs.readdirSync(otherPath)
  const imageFiles = files.filter((file) => {
    const ext = path.extname(file)
    return imageExtensions.includes(ext)
  })
  
  console.log(`Found ${imageFiles.length} photos in Other`)
  
  for (const fileName of imageFiles) {
    const filePath = path.join(otherPath, fileName)
    await uploadPhoto(filePath, fileName, 'Other', '')
  }
}

function determineCategoryAndFolder(filePath: string): {
  category: 'Projects' | 'Other'
  folderName: string
} {
  const normalizedPath = path.normalize(filePath)
  
  if (normalizedPath.includes('/Other/') || normalizedPath.includes('\\Other\\')) {
    return { category: 'Other', folderName: '' }
  }
  
  if (normalizedPath.includes('/Projects/') || normalizedPath.includes('\\Projects\\')) {
    // Extract project folder name
    const projectsIndex = normalizedPath.indexOf('/Projects/')
    const afterProjects = normalizedPath.substring(projectsIndex + '/Projects/'.length)
    const folderName = afterProjects.split(path.sep)[0]
    return { category: 'Projects', folderName }
  }
  
  // Default to Other if path structure is unclear
  return { category: 'Other', folderName: '' }
}

async function uploadFromSource(
  source: string,
  category: 'Projects' | 'Other',
  projectName: string | null,
): Promise<void> {
  const absoluteSource = path.isAbsolute(source) ? source : path.join(process.cwd(), source)

  if (!fs.existsSync(absoluteSource) || !fs.statSync(absoluteSource).isDirectory()) {
    console.error(`\n❌ Source folder not found or not a directory: ${absoluteSource}`)
    process.exit(1)
  }

  console.log(`\n📂 Uploading directly from source: ${absoluteSource}`)

  if (category === 'Other') {
    console.log(`📁 Target: Other`)
    await uploadOtherFolder(absoluteSource)
    return
  }

  if (!projectName) {
    console.error(
      '\n❌ --project="Project Name" is required when uploading a Projects folder from --source.',
    )
    process.exit(1)
  }

  console.log(`📁 Target project: Projects/${projectName}`)
  await uploadProjectFolder(absoluteSource, projectName)
}

async function uploadSpecificFiles(filePaths: string[]): Promise<void> {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`📸 Processing ${filePaths.length} specific file(s)`)
  console.log('='.repeat(80))
  
  for (const filePath of filePaths) {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath)
    
    if (!fs.existsSync(absolutePath)) {
      console.error(`\n❌ File not found: ${absolutePath}`)
      stats.failedPhotos++
      continue
    }
    
    const fileName = path.basename(absolutePath)
    const { category, folderName } = determineCategoryAndFolder(absolutePath)
    
    await uploadPhoto(absolutePath, fileName, category, folderName)
  }
}

async function loadManifest(): Promise<UploadManifestEntry[]> {
  const manifestFileName =
    storageType === 'r2' ? 'uploadPhotos.json' : 'uploadPhotos-blob.json'
  const manifestsDir = path.join(process.cwd(), 'scripts', 'manifests')
  const manifestPath = path.join(manifestsDir, manifestFileName)
  
  if (fs.existsSync(manifestPath)) {
    try {
      const content = fs.readFileSync(manifestPath, 'utf-8')
      return JSON.parse(content)
    } catch (error) {
      console.warn(`⚠️  Could not load existing manifest: ${error}`)
      return []
    }
  }
  
  return []
}

async function saveManifest(): Promise<void> {
  const manifestFileName =
    storageType === 'r2' ? 'uploadPhotos.json' : 'uploadPhotos-blob.json'
  const manifestsDir = path.join(process.cwd(), 'scripts', 'manifests')
  
  // Ensure manifests directory exists
  if (!fs.existsSync(manifestsDir)) {
    fs.mkdirSync(manifestsDir, { recursive: true })
  }
  
  const manifestPath = path.join(manifestsDir, manifestFileName)
  
  // Load existing manifest and merge
  const existingManifest = await loadManifest()
  
  // Create a map of existing entries by fileName + category
  const existingMap = new Map<string, UploadManifestEntry>()
  for (const entry of existingManifest) {
    const key = `${entry.fileName}:${entry.category}:${entry.folderName}`
    existingMap.set(key, entry)
  }
  
  // Update or add new entries
  for (const entry of manifest) {
    const key = `${entry.fileName}:${entry.category}:${entry.folderName}`
    existingMap.set(key, entry)
  }
  
  // Convert back to array and save
  const mergedManifest = Array.from(existingMap.values())
  fs.writeFileSync(manifestPath, JSON.stringify(mergedManifest, null, 2))
  console.log(`\n📄 Upload manifest saved to: ${manifestPath}`)
}

function printSummary(): void {
  console.log(`\n${'='.repeat(80)}`)
  console.log('📊 UPLOAD SUMMARY')
  console.log('='.repeat(80))
  console.log(`Total photos: ${stats.totalPhotos}`)
  console.log(`Successfully uploaded: ${stats.uploadedPhotos}`)
  console.log(`Failed: ${stats.failedPhotos}`)
  console.log(`Processed (>3MB): ${stats.processedCount}`)
  console.log(`Skipped (≤3MB): ${stats.skippedCount}`)
  console.log(`\nOriginal size: ${formatBytes(stats.totalOriginalSize)}`)
  console.log(`Uploaded size: ${formatBytes(stats.totalUploadedSize)}`)
  const savings = stats.totalOriginalSize - stats.totalUploadedSize
  const savingsPercent = ((savings / stats.totalOriginalSize) * 100).toFixed(1)
  console.log(`Space saved: ${formatBytes(savings)} (${savingsPercent}%)`)
  console.log('='.repeat(80) + '\n')
}

async function main() {
  console.log(
    `\n🚀 Starting photo upload pipeline to ${storageType.toUpperCase()} ${isDryRun ? '[DRY RUN MODE]' : ''}`,
  )
  if (sourcePath) {
    console.log(`📂 Processing source folder: ${sourcePath}`)
  }
  if (specificFolder) {
    console.log(`📂 Processing specific folder: ${specificFolder}`)
  }
  if (specificFiles) {
    console.log(`📸 Processing specific files: ${specificFiles.length} file(s)`)
  }
  
  if (!isDryRun) {
    // Validate credentials based on storage type
    try {
      if (storageType === 'r2') {
        validateR2Credentials()
        r2Client = getR2Client()
        r2BucketName = process.env.R2_BUCKET_NAME || null
        r2PublicUrl = process.env.R2_PUBLIC_URL || null
        console.log(`✅ R2 credentials validated`)
        console.log(`📦 Bucket: ${r2BucketName}`)
        if (r2PublicUrl) {
          console.log(`🌐 Public URL: ${r2PublicUrl}`)
        }
      } else {
        validateBlobToken()
        console.log('✅ Blob token validated')
      }
    } catch (error) {
      console.error(`❌ ${error}`)
      process.exit(1)
    }
  }
  
  // If a source folder is provided, upload directly from it (no local copy needed)
  if (sourcePath) {
    await uploadFromSource(sourcePath, sourceCategory, sourceProjectName)
  } else if (specificFiles && specificFiles.length > 0) {
    // If specific files are provided, upload only those
    await uploadSpecificFiles(specificFiles)
  } else {
    // Otherwise, process folders as before
    const originalPhotosPath = path.join(process.cwd(), 'original-photos')
    const projectsPath = path.join(originalPhotosPath, 'Projects')
    const otherPath = path.join(originalPhotosPath, 'Other')
    
    // Upload project folders
    if (fs.existsSync(projectsPath)) {
      const projectFolders = fs.readdirSync(projectsPath, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .filter((name) => !specificFolder || name === specificFolder)
      
      for (const projectName of projectFolders) {
        const projectPath = path.join(projectsPath, projectName)
        await uploadProjectFolder(projectPath, projectName)
      }
    }
    
    // Upload Other folder (only if no specific folder is specified or if "Other" is specified)
    if (fs.existsSync(otherPath) && (!specificFolder || specificFolder === 'Other')) {
      await uploadOtherFolder(otherPath)
    }
  }
  
  // Save manifest (only in real mode)
  if (!isDryRun && manifest.length > 0) {
    await saveManifest()
  }
  
  printSummary()
  
  if (isDryRun) {
    console.log('💡 This was a dry run. No files were uploaded.')
    console.log('💡 Run without --dry-run flag to perform actual upload.\n')
  } else {
    console.log('✅ Upload complete!')
    if (storageType === 'r2') {
      console.log('💡 Photos uploaded to R2 bucket.')
    }
    console.log('💡 If added new projects, run `npm run update-markdown` to generate/update markdown files.\n')
  }
}

main().catch(console.error)

