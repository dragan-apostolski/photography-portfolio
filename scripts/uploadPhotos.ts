import fs from 'fs'
import path from 'path'
import { processImage, formatBytes } from './utils/imageProcessor'
import { uploadToBlob, generateBlobPathname, validateBlobToken } from './utils/blobUploader'

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

    // Generate blob pathname
    const blobPathname = generateBlobPathname(category, folderName, fileName)
    
    if (isDryRun) {
      console.log(`   🔍 [DRY RUN] Would upload to: ${blobPathname}`)
      stats.uploadedPhotos++
    } else {
      // Upload to blob
      console.log(`   ⬆️  Uploading to blob...`)
      const result = await uploadToBlob(processed.buffer, blobPathname, fileName, allowOverwrite)
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
      })
      
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

async function saveManifest(): Promise<void> {
  const manifestPath = path.join(process.cwd(), 'scripts', 'upload-manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
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
  console.log(`\n🚀 Starting photo upload pipeline ${isDryRun ? '[DRY RUN MODE]' : ''}`)
  if (specificFolder) {
    console.log(`📂 Processing specific folder: ${specificFolder}`)
  }
  
  if (!isDryRun) {
    // Validate blob token
    try {
      validateBlobToken()
      console.log('✅ Blob token validated')
    } catch (error) {
      console.error(`❌ ${error}`)
      process.exit(1)
    }
  }
  
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
    console.log('💡 Run `npm run update-markdown` to generate/update markdown files.\n')
  }
}

main().catch(console.error)

