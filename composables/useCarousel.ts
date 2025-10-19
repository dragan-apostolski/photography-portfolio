import type { Photo } from '~/types/photo'
import type { Project } from '~/types/project'

interface CarouselPhoto extends Photo {
  projectSlug?: string
}

export const useCarousel = () => {
  /**
   * Get carousel photos from recent projects
   * @param cdnBaseUrl - CDN base URL from runtime config
   */
  const getCarouselPhotos = async (cdnBaseUrl: string = ''): Promise<CarouselPhoto[]> => {
    try {
      const { getRecentProjects } = useProjects()
      const recentProjects = await getRecentProjects(5)
      
      // Helper to convert relative path to CDN URL
      const getPhotoUrl = (relativePath: string): string => {
        if (!relativePath) return ''
        if (relativePath.startsWith('http')) return relativePath
        const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath
        return cdnBaseUrl ? `${cdnBaseUrl}/${cleanPath}` : relativePath
      }
      
      return recentProjects.map((project: Project) => ({
        id: `project-carousel-${project.slug}`,
        title: project.title,
        src: getPhotoUrl(project.coverPhoto),
        alt: `Cover photo for ${project.title}`,
        description: project.description,
        buttonTitle: `View ${project.title}`,
        tag: project.tags || [],
        location: project.location,
        timestamp: project.date,
        projectSlug: project.slug,
      }))
    } catch (error) {
      console.error('Error fetching project carousel photos:', error)
      return []
    }
  }

  return {
    getCarouselPhotos,
  }
}
