import type { Photo } from '~/types/photo'
import type { Project } from '~/types/project'

interface CarouselPhoto extends Photo {
  projectSlug?: string
}

export const useCarousel = () => {
  const { getRecentProjects } = useProjects()

  /**
   * Get carousel photos from recent projects
   */
  const getCarouselPhotos = async (): Promise<CarouselPhoto[]> => {
    try {
      const recentProjects = await getRecentProjects(5)
      
      return recentProjects.map((project: Project) => ({
        id: `project-carousel-${project.slug}`,
        title: project.title,
        src: project.coverPhoto,
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
