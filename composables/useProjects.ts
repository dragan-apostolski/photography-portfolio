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
        tag: meta.tag || [],
        date: meta.date || '',
        coverPhoto: meta.coverPhoto || '',
        featured: meta.featured || false,
        photos: meta.photos || [],
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
      tag: meta.tag || [],
      date: meta.date || '',
      coverPhoto: meta.coverPhoto || '',
      featured: meta.featured || false,
      photos: meta.photos || [],
      body: projectData.body,
    } as Project
  }

  /**
   * Get featured projects only
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
    return projects.filter((project) => project.tag.includes(tag))
  }

  /**
   * Load project photos from manifest files
   */
  const loadProjectPhotos = async (projectSlug: string): Promise<ProjectPhoto[]> => {
    try {
      // Get the actual directory name from the project data
      const project = await getProjectBySlug(projectSlug)
      if (!project) {
        console.warn(`No project found for slug: ${projectSlug}`)
        return []
      }

      // Extract directory name from the coverPhoto path
      // coverPhoto format: '/projects/Directory Name/filename.webp'
      if (!project.coverPhoto) {
        console.warn(`No coverPhoto found for project: ${projectSlug}`)
        return []
      }
      const pathParts = project.coverPhoto.split('/')
      const directoryName = pathParts[2]

      if (!directoryName) {
        console.warn(
          `Could not extract directory name for project: ${projectSlug}, coverPhoto: ${project.coverPhoto}`
        )
        return []
      }

      // Properly encode each path segment for the manifest URL
      const encodedDirectoryName = directoryName
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/')
      const manifestUrl = `/projects/${encodedDirectoryName}/manifest.json`

      const response = await $fetch<
        Array<{
          outputFile?: string
          width?: number
          height?: number
          [key: string]: unknown
        }>
      >(manifestUrl)

      if (!response || !Array.isArray(response)) {
        console.warn(`No manifest found for project: ${projectSlug} at ${manifestUrl}`)
        return []
      }

      // Transform manifest data to ProjectPhoto format
      return response.map((item, index) => {
        const fileName = (item.outputFile as string)?.split('/').pop() || `image-${index}`
        const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
        const width = (item.width as number) || 0
        const height = (item.height as number) || 0

        return {
          id: `${projectSlug}-${fileNameWithoutExt}`,
          src: `/projects/${directoryName}/${fileName}`,
          title: `${directoryName} - ${index + 1}`,
          width,
          height,
          aspectRatio: width > height ? 'horizontal' : height > width ? 'vertical' : 'square',
        } as ProjectPhoto
      })
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
      processedPhotos,
    }
  }

  /**
   * Get all available project tags
   */
  const getProjectTags = async (): Promise<string[]> => {
    const projects = await getAllProjects()
    const tagSet = new Set<string>()

    projects.forEach((project) => {
      project.tag.forEach((tag) => tagSet.add(tag))
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
