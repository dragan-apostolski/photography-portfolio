import type { Project, ProjectPhoto, ProjectWithPhotos } from '~/types/project'

export const useProjects = () => {
  /**
   * Get all projects from content
   */
  const getAllProjects = async (): Promise<Project[]> => {
    const projects = await queryCollection('content').where('path', 'LIKE', '/projects/%').all()

    return projects.map((project) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const projectData = project as any
      // In Nuxt Content v3, custom frontmatter fields are in the meta property
      const meta = projectData.meta || {}
      return {
        slug: projectData.path?.replace('/projects/', '') || '',
        title: projectData.title || '',
        description: projectData.description || '',
        location: meta.location,
        tags: meta.tags || meta.tag || [],
        date: meta.date || '',
        coverPhoto: meta.coverPhoto || '',
        featured: meta.featured || false,
        photoFiles: meta.photos || [],
        body: projectData.body,
      }
    }) as Project[]
  }

  /**
   * Get a specific project by slug
   */
  const getProjectBySlug = async (slug: string): Promise<Project | null> => {
    const project = await queryCollection('content').where('path', '=', `/projects/${slug}`).first()

    if (!project) return null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectData = project as any
    const meta = projectData.meta || {}

    return {
      slug: projectData.path?.replace('/projects/', '') || '',
      title: projectData.title || '',
      description: projectData.description || '',
      location: meta.location,
      tags: meta.tags || meta.tag || [],
      date: meta.date || '',
      coverPhoto: meta.coverPhoto || '',
      featured: meta.featured || false,
      photoFiles: meta.photos || [],
      body: projectData.body,
    } as Project
  }

  /**
   */
  const getFeaturedProjects = async (): Promise<Project[]> => {
    const projects = await getAllProjects()
    return projects.filter((project) => project.featured)
  }

  /**
   * Get projects by tag
   */
  const getProjectsByTag = async (tag: string): Promise<Project[]> => {
    const projects = await getAllProjects()
    return projects.filter((project) => project.tags.includes(tag))
  }

  /**
   * Get image dimensions and calculate aspect ratio
   */
  const getImageAspectRatio = (src: string): Promise<{ width: number; height: number; aspectRatio: 'square' | 'vertical' | 'horizontal' }> => {
    return new Promise((resolve) => {
      if (!import.meta.client) {
        // On server side, default to horizontal
        resolve({ width: 1920, height: 1080, aspectRatio: 'horizontal' })
        return
      }

      const img = new Image()
      img.onload = () => {
        const { width, height } = img
        let aspectRatio: 'square' | 'vertical' | 'horizontal' = 'horizontal'
        
        const ratio = width / height
        
        if (Math.abs(ratio - 1) < 0.1) {
          aspectRatio = 'square' // Close to 1:1 ratio
        } else if (ratio < 1) {
          aspectRatio = 'vertical' // Height > Width
        } else {
          aspectRatio = 'horizontal' // Width > Height
        }
        
        resolve({ width, height, aspectRatio })
      }
      
      img.onerror = () => {
        // Fallback to horizontal if image fails to load
        resolve({ width: 1920, height: 1080, aspectRatio: 'horizontal' })
      }
      
      img.src = src
    })
  }

  /**
   * Load project photos from .md frontmatter
   */
  const loadProjectPhotos = async (projectSlug: string): Promise<ProjectPhoto[]> => {
    try {
      const project = await getProjectBySlug(projectSlug)
      if (!project?.coverPhoto || !project?.photoFiles) {
        console.warn(`No project or photos found for slug: ${projectSlug}`)
        return []
      }

      // Extract directory name from coverPhoto path
      // Expected format: /photos/projects/DirectoryName/filename.avif
      const pathParts = project.coverPhoto.split('/')
      const directoryName = pathParts[3] // /photos/projects/DirectoryName/filename.avif

      if (!directoryName) {
        console.warn(
          `Could not extract directory name for project: ${projectSlug}, coverPhoto: ${project.coverPhoto}`
        )
        return []
      }

      // Transform photos array from frontmatter to Photo format with actual dimensions
      // Note: Don't encode paths here - let NuxtImg handle encoding internally
      const photos = await Promise.all(
        project.photoFiles.map(async (fileName: string, index: number) => {
          const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
          const imagePath = `/photos/projects/${directoryName}/${fileName}`

          // Get actual image dimensions and aspect ratio
          const { width, height, aspectRatio } = await getImageAspectRatio(imagePath)

          return {
            id: `${projectSlug}-${fileNameWithoutExt}`,
            src: imagePath,
            title: fileNameWithoutExt.replace(/-/g, ' '),
            description: `Photo ${index + 1} from ${project.title}`,
            location: project.location,
            timestamp: project.date,
            tag: project.tags || [],
            width,
            height,
            aspectRatio,
          } as ProjectPhoto
        })
      )

      return photos
    } catch (error) {
      console.error(`Error loading photos for project ${projectSlug}:`, error)
      return []
    }
  }

  /**
   * Get project with loaded photos
   */
  const getProjectWithPhotos = async (slug: string): Promise<ProjectWithPhotos | null> => {
    const project = await getProjectBySlug(slug)
    if (!project) return null

    const processedPhotos = await loadProjectPhotos(slug)

    return {
      ...project,
      photos: processedPhotos,
    }
  }

  /**
   * Get all available project tags
   */
  const getProjectTags = async (): Promise<string[]> => {
    const projects = await getAllProjects()
    const tagSet = new Set<string>()

    projects.forEach((project) => {
      project.tags.forEach((tag) => tagSet.add(tag))
    })

    return Array.from(tagSet).sort()
  }

  /**
   * Get recent projects (sorted by date, descending)
   */
  const getRecentProjects = async (limit?: number): Promise<Project[]> => {
    const projects = await getAllProjects()
    const sortedProjects = projects.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return limit ? sortedProjects.slice(0, limit) : sortedProjects
  }

  return {
    getAllProjects,
    getProjectBySlug,
    getFeaturedProjects,
    getProjectsByTag,
    loadProjectPhotos,
    getProjectWithPhotos,
    getProjectTags,
    getRecentProjects,
  }
}
