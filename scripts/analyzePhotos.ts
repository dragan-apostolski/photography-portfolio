import fs from 'fs'
import path from 'path'

interface PhotoAnalysis {
  fileName: string
  filePath: string
  sizeBytes: number
  sizeMB: number
  needsProcessing: boolean
}

interface FolderAnalysis {
  folderName: string
  totalPhotos: number
  needsProcessing: number
  alreadyProcessed: number
  totalSizeMB: number
  photos: PhotoAnalysis[]
}

const SIZE_THRESHOLD_BYTES = 3 * 1024 * 1024 // 3MB

function analyzePhoto(filePath: string, fileName: string): PhotoAnalysis {
  const stats = fs.statSync(filePath)
  const sizeBytes = stats.size
  const sizeMB = parseFloat((sizeBytes / (1024 * 1024)).toFixed(2))
  const needsProcessing = sizeBytes > SIZE_THRESHOLD_BYTES

  return {
    fileName,
    filePath,
    sizeBytes,
    sizeMB,
    needsProcessing,
  }
}

function analyzeFolder(folderPath: string, folderName: string): FolderAnalysis {
  const imageExtensions = ['.jpg', '.jpeg', '.JPG', '.JPEG']
  
  const files = fs.readdirSync(folderPath)
  const photos: PhotoAnalysis[] = []

  for (const file of files) {
    const ext = path.extname(file)
    if (imageExtensions.includes(ext)) {
      const filePath = path.join(folderPath, file)
      photos.push(analyzePhoto(filePath, file))
    }
  }

  const needsProcessing = photos.filter((p) => p.needsProcessing).length
  const alreadyProcessed = photos.length - needsProcessing
  const totalSizeMB = parseFloat(photos.reduce((sum, p) => sum + p.sizeMB, 0).toFixed(2))

  return {
    folderName,
    totalPhotos: photos.length,
    needsProcessing,
    alreadyProcessed,
    totalSizeMB,
    photos,
  }
}

function analyzeFolderStructure(basePath: string): FolderAnalysis[] {
  const results: FolderAnalysis[] = []
  
  if (!fs.existsSync(basePath)) {
    console.error(`❌ Path does not exist: ${basePath}`)
    return results
  }

  const entries = fs.readdirSync(basePath, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const folderPath = path.join(basePath, entry.name)
      const analysis = analyzeFolder(folderPath, entry.name)
      if (analysis.totalPhotos > 0) {
        results.push(analysis)
      }
    }
  }

  return results
}

function analyzeOtherFolder(basePath: string): FolderAnalysis | null {
  if (!fs.existsSync(basePath)) {
    console.error(`❌ Path does not exist: ${basePath}`)
    return null
  }

  return analyzeFolder(basePath, 'Other')
}

function printSummary(projectsAnalysis: FolderAnalysis[], otherAnalysis: FolderAnalysis | null) {
  console.log('\n' + '='.repeat(80))
  console.log('📊 PHOTO ANALYSIS SUMMARY')
  console.log('='.repeat(80) + '\n')

  // Projects analysis
  console.log('🗂️  PROJECTS FOLDERS:\n')
  
  let totalProjects = 0
  let totalProjectPhotos = 0
  let totalNeedsProcessing = 0
  let totalAlreadyProcessed = 0

  for (const analysis of projectsAnalysis) {
    totalProjects++
    totalProjectPhotos += analysis.totalPhotos
    totalNeedsProcessing += analysis.needsProcessing
    totalAlreadyProcessed += analysis.alreadyProcessed

    const icon = analysis.needsProcessing > 0 ? '🔄' : '✅'
    console.log(`${icon} ${analysis.folderName}`)
    console.log(`   Total: ${analysis.totalPhotos} photos (${analysis.totalSizeMB} MB)`)
    console.log(`   Need processing: ${analysis.needsProcessing}`)
    console.log(`   Already processed: ${analysis.alreadyProcessed}`)
    
    if (analysis.needsProcessing > 0) {
      const largePhotos = analysis.photos.filter((p) => p.needsProcessing)
      console.log(`   Large photos: ${largePhotos.map((p) => `${p.fileName} (${p.sizeMB}MB)`).join(', ')}`)
    }
    console.log('')
  }

  // Other folder analysis
  if (otherAnalysis && otherAnalysis.totalPhotos > 0) {
    console.log('🗂️  OTHER FOLDER:\n')
    const icon = otherAnalysis.needsProcessing > 0 ? '🔄' : '✅'
    console.log(`${icon} ${otherAnalysis.folderName}`)
    console.log(`   Total: ${otherAnalysis.totalPhotos} photos (${otherAnalysis.totalSizeMB} MB)`)
    console.log(`   Need processing: ${otherAnalysis.needsProcessing}`)
    console.log(`   Already processed: ${otherAnalysis.alreadyProcessed}`)
    console.log('')
  }

  // Overall summary
  console.log('=' .repeat(80))
  console.log('📈 OVERALL STATISTICS:\n')
  console.log(`Total project folders: ${totalProjects}`)
  console.log(`Total project photos: ${totalProjectPhotos}`)
  console.log(`Total other photos: ${otherAnalysis?.totalPhotos || 0}`)
  console.log(`Total photos: ${totalProjectPhotos + (otherAnalysis?.totalPhotos || 0)}`)
  console.log('')
  console.log(`Photos needing processing (>3MB): ${totalNeedsProcessing + (otherAnalysis?.needsProcessing || 0)}`)
  console.log(`Photos already processed (≤3MB): ${totalAlreadyProcessed + (otherAnalysis?.alreadyProcessed || 0)}`)
  console.log('=' .repeat(80) + '\n')
}

async function main() {
  const originalPhotosPath = path.join(process.cwd(), 'original-photos')
  const projectsPath = path.join(originalPhotosPath, 'Projects')
  const otherPath = path.join(originalPhotosPath, 'Other')

  console.log('🔍 Analyzing photos in original-photos folder...\n')

  const projectsAnalysis = analyzeFolderStructure(projectsPath)
  const otherAnalysis = analyzeOtherFolder(otherPath)

  printSummary(projectsAnalysis, otherAnalysis)

  console.log('✅ Analysis complete!')
  console.log('💡 Run `npm run upload-photos -- --dry-run` to test the upload process without actually uploading.\n')
}

main().catch(console.error)

