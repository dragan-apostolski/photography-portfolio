import type { Project, ProjectPhoto, ProjectWithPhotos, ProjectPhotoConfig } from '~/types/project'

export const useProjects = () => {
  /**
   * Convert relative photo path to CDN URL
   */
  const getPhotoUrl = (relativePath: string): string => {
    if (!relativePath) return ''
    // If already a full URL, return as-is
    if (relativePath.startsWith('http')) return relativePath
    
    const config = useRuntimeConfig()
    const cdnBase = config.public.cdnBaseUrl || ''
    
    // Remove leading slash if present to avoid double slashes
    const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath
    return cdnBase ? `${cdnBase}/${cleanPath}` : relativePath
  }
  /**
   * Get all projects from content
   */
  const getAllProjects = async (): Promise<Project[]> => {
    const projects = await queryCollection('content').where('path', 'LIKE', '/projects/%').all()

    return projects.map((project) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const projectData = project as any
      // In Nuxt Content v3, custom frontmatter fields can be in meta property or directly on the object
      const meta = projectData.meta || {}
      return {
        slug: projectData.path?.replace('/projects/', '') || '',
        title: projectData.title || '',
        description: projectData.description || '',
        location: meta.location || projectData.location,
        tags: meta.tags || meta.tag || projectData.tags || projectData.tag || [],
        date: meta.date || projectData.date || '',
        coverPhoto: meta.coverPhoto || projectData.coverPhoto || '',
        coverPhotoMobile: meta.coverPhotoMobile || projectData.coverPhotoMobile || '',
        projectRoot: meta.projectRoot || projectData.projectRoot || '',
        featured: meta.featured || projectData.featured || false,
        photos: meta.photos || projectData.photos || [],
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
      location: meta.location || projectData.location,
      tags: meta.tags || meta.tag || projectData.tags || projectData.tag || [],
      date: meta.date || projectData.date || '',
      coverPhoto: meta.coverPhoto || projectData.coverPhoto || '',
      coverPhotoMobile: meta.coverPhotoMobile || projectData.coverPhotoMobile || '',
      projectRoot: meta.projectRoot || projectData.projectRoot || '',
      featured: meta.featured || projectData.featured || false,
      photos: meta.photos || projectData.photos || [],
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
   * Load project photos from .md frontmatter
   */
  const loadProjectPhotos = async (projectSlug: string): Promise<ProjectPhoto[]> => {
    try {
      const project = await getProjectBySlug(projectSlug)
      if (!project?.projectRoot || !project?.photos) {
        console.warn(`No project or photos found for slug: ${projectSlug}`)
        return []
      }

      // Get CDN base URL from runtime config
      const config = useRuntimeConfig()
      const cdnBase = config.public.cdnBaseUrl || ''

      // Transform photos array from frontmatter to ProjectPhoto format
      const photos = project.photos.map((photoConfig: ProjectPhotoConfig, index: number) => {
        const fileNameWithoutExt = photoConfig.fileName.replace(/\.[^/.]+$/, '')
        const imagePath = `${cdnBase}/photos/projects/${project.projectRoot}/${photoConfig.fileName}`

        return {
          id: `${projectSlug}-${fileNameWithoutExt}`,
          src: imagePath,
          fileName: photoConfig.fileName,
          description: photoConfig.description || `Photo ${index + 1} from ${project.title}`,
          aspectRatio: photoConfig.aspectRatio,
          location: project.location,
          timestamp: project.date,
        } as ProjectPhoto
      })

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
    getPhotoUrl,
  }
}
