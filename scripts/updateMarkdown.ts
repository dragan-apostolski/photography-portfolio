import fs from 'fs'
import path from 'path'
import sizeOf from 'image-size'

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

interface PhotoEntry {
  fileName: string
  aspectRatio: 'vertical' | 'horizontal' | 'square'
}

interface ProjectMetadata {
  title: string
  description: string
  location: string
  date: string
  tags: string[]
  coverPhoto: string
  coverPhotoMobile: string
  projectRoot: string
  photos: PhotoEntry[]
}

/**
 * Calculate aspect ratio based on dimensions
 */
function getAspectRatio(width: number, height: number): 'vertical' | 'horizontal' | 'square' {
  const ratio = width / height
  
  if (Math.abs(ratio - 1) < 0.1) {
    return 'square' // Close to 1:1 ratio
  } else if (ratio < 1) {
    return 'vertical' // Height > Width
  } else {
    return 'horizontal' // Width > Height
  }
}

/**
 * Load existing markdown file if it exists
 */
function loadExistingMarkdown(projectSlug: string): Partial<ProjectMetadata> | null {
  const mdPath = path.join(process.cwd(), 'content', 'projects', `${projectSlug}.md`)
  
  if (!fs.existsSync(mdPath)) {
    return null
  }
  
  const content = fs.readFileSync(mdPath, 'utf-8')
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  
  if (!frontmatterMatch) {
    return null
  }
  
  const frontmatter = frontmatterMatch[1]
  const metadata: Partial<ProjectMetadata> = {}
  
  // Parse basic fields
  const titleMatch = frontmatter.match(/title:\s*'([^']*)'/)
  if (titleMatch) metadata.title = titleMatch[1]
  
  const descMatch = frontmatter.match(/description:\s*'([^']*)'/)
  if (descMatch) metadata.description = descMatch[1]
  
  const locMatch = frontmatter.match(/location:\s*'([^']*)'/)
  if (locMatch) metadata.location = locMatch[1]
  
  const dateMatch = frontmatter.match(/date:\s*'([^']*)'/)
  if (dateMatch) metadata.date = dateMatch[1]
  
  const tagsMatch = frontmatter.match(/tags:\s*\[(.*?)\]/)
  if (tagsMatch) {
    metadata.tags = tagsMatch[1]
      .split(',')
      .map((tag) => tag.trim().replace(/'/g, ''))
  }
  
  return metadata
}

/**
 * Convert project folder name to slug
 */
function projectNameToSlug(projectName: string): string {
  return projectName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

/**
 * Generate markdown file for a project
 */
function generateProjectMarkdown(
  projectName: string,
  photos: UploadManifestEntry[],
  existingMetadata?: Partial<ProjectMetadata> | null,
): string {
  // Sort photos by fileName
  photos.sort((a, b) => a.fileName.localeCompare(b.fileName))
  
  // Generate photo entries
  const photoEntries: PhotoEntry[] = photos.map((photo) => {
    const aspectRatio = getAspectRatio(photo.dimensions.width, photo.dimensions.height)
    return {
      fileName: photo.fileName,
      aspectRatio,
    }
  })
  
  // Determine cover photos
  const coverPhoto = photos[0] ? `/photos/Projects/${projectName}/${photos[0].fileName}` : ''
  const coverPhotoMobile = photos[1] 
    ? `/photos/Projects/${projectName}/${photos[1].fileName}` 
    : coverPhoto
  
  // Build metadata object
  const metadata: ProjectMetadata = {
    title: existingMetadata?.title || projectName,
    description: existingMetadata?.description || `Photography project: ${projectName}`,
    location: existingMetadata?.location || 'Location TBD',
    date: existingMetadata?.date || new Date().toISOString().split('T')[0],
    tags: existingMetadata?.tags || ['project'],
    coverPhoto,
    coverPhotoMobile,
    projectRoot: projectName,
    photos: photoEntries,
  }
  
  // Generate frontmatter
  let frontmatter = '---\n'
  frontmatter += `title: '${metadata.title}'\n`
  frontmatter += `description: '${metadata.description}'\n`
  frontmatter += `location: '${metadata.location}'\n`
  frontmatter += `date: '${metadata.date}'\n`
  frontmatter += `tags: [${metadata.tags.map((tag) => `'${tag}'`).join(', ')}]\n`
  frontmatter += `coverPhoto: '${metadata.coverPhoto}'\n`
  frontmatter += `coverPhotoMobile: '${metadata.coverPhotoMobile}'\n`
  frontmatter += `projectRoot: '${metadata.projectRoot}'\n`
  frontmatter += 'photos:\n'
  
  for (const photo of metadata.photos) {
    frontmatter += `  - fileName: '${photo.fileName}'\n`
    frontmatter += `    aspectRatio: '${photo.aspectRatio}'\n`
  }
  
  frontmatter += '---\n'
  
  return frontmatter
}

/**
 * Update or create markdown files for all projects
 */
async function updateMarkdownFiles() {
  const manifestPath = path.join(process.cwd(), 'scripts', 'upload-manifest.json')
  
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ Upload manifest not found. Please run upload script first.')
    process.exit(1)
  }
  
  const manifest: UploadManifestEntry[] = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
  
  // Group photos by project
  const projectPhotos = new Map<string, UploadManifestEntry[]>()
  
  for (const entry of manifest) {
    if (entry.category === 'Projects') {
      const existing = projectPhotos.get(entry.folderName) || []
      existing.push(entry)
      projectPhotos.set(entry.folderName, existing)
    }
  }
  
  console.log(`\n📝 Updating markdown files for ${projectPhotos.size} projects...\n`)
  
  let createdCount = 0
  let updatedCount = 0
  
  for (const [projectName, photos] of projectPhotos.entries()) {
    const slug = projectNameToSlug(projectName)
    const mdPath = path.join(process.cwd(), 'content', 'projects', `${slug}.md`)
    const exists = fs.existsSync(mdPath)
    
    // Load existing metadata if available
    const existingMetadata = loadExistingMarkdown(slug)
    
    // Generate markdown
    const markdown = generateProjectMarkdown(projectName, photos, existingMetadata)
    
    // Write file
    fs.writeFileSync(mdPath, markdown)
    
    if (exists) {
      console.log(`✅ Updated: ${slug}.md (${photos.length} photos)`)
      updatedCount++
    } else {
      console.log(`🆕 Created: ${slug}.md (${photos.length} photos)`)
      createdCount++
    }
  }
  
  console.log(`\n${'='.repeat(80)}`)
  console.log('📊 MARKDOWN UPDATE SUMMARY')
  console.log('='.repeat(80))
  console.log(`Created: ${createdCount} files`)
  console.log(`Updated: ${updatedCount} files`)
  console.log(`Total: ${projectPhotos.size} projects`)
  console.log('='.repeat(80) + '\n')
  
  console.log('✅ Markdown files updated successfully!')
  console.log('💡 Review the generated files in content/projects/ and update metadata as needed.\n')
}

updateMarkdownFiles().catch(console.error)

