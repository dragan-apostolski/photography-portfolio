const sizeOf = require('image-size').default
const fs = require('fs')
const path = require('path')

/**
 * Calculate aspect ratio of an image using image-size library
 * @param {string} imagePath - Path to the image file
 * @returns {{width: number, height: number, aspectRatio: 'vertical'|'square'|'horizontal'}}
 */
function getImageAspectRatio(imagePath) {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image not found: ${imagePath}`)
  }

  try {
    const buffer = fs.readFileSync(imagePath)
    const dimensions = sizeOf(buffer)
    const { width, height } = dimensions

    if (!width || !height) {
      throw new Error('Could not read image dimensions')
    }

    const ratio = width / height
    let aspectRatio

    if (Math.abs(ratio - 1) < 0.1) {
      aspectRatio = 'square' // Close to 1:1 ratio
    } else if (ratio < 1) {
      aspectRatio = 'vertical' // Height > Width
    } else {
      aspectRatio = 'horizontal' // Width > Height
    }

    return { width, height, aspectRatio }
  } catch (error) {
    throw new Error(`Failed to get dimensions for ${imagePath}: ${error.message}`)
  }
}

/**
 * Process all images in a directory
 * @param {string} folderPath - Path to the directory containing images
 * @returns {Array} Array of photo objects with aspect ratios
 */
function processImagesInFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    throw new Error(`Directory not found: ${folderPath}`)
  }

  const results = []

  console.log(`\nProcessing folder: ${folderPath}`)

  // Get all files in the directory
  const files = fs.readdirSync(folderPath)

  // Filter for image files
  const imageExtensions = ['.jpg', '.jpeg']
  const imageFiles = files.filter((file) => {
    const ext = path.extname(file).toLowerCase()
    return imageExtensions.includes(ext)
  })

  if (imageFiles.length === 0) {
    console.log('⚠️  No image files found in directory')
    return results
  }

  console.log(`Found ${imageFiles.length} image files`)

  for (const fileName of imageFiles) {
    const imagePath = path.join(folderPath, fileName)

    try {
      const { width, height, aspectRatio } = getImageAspectRatio(imagePath)
      results.push({
        fileName,
        width,
        height,
        aspectRatio,
      })

      console.log(`✅ ${fileName}: ${width}x${height} (${aspectRatio})`)
    } catch (error) {
      console.error(`❌ ${fileName}: ${error.message}`)
    }
  }

  return results
}

/**
 * Main function to process images in a folder
 */
function main() {
  const folderPath = process.argv[2]

  if (!folderPath) {
    console.error('Usage: node calculateAspectRatios.cjs /path/to/image/folder')
    console.error('Example: node calculateAspectRatios.cjs "public/photos/projects/Feeling Blue"')
    process.exit(1)
  }

  try {
    const results = processImagesInFolder(folderPath)

    // Output results as JSON for easy parsing
    console.log('\n--- RESULTS ---')
    console.log(JSON.stringify(results, null, 2))
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { getImageAspectRatio, processImagesInFolder }
