import type { Photo } from '~/types/photo'
import type { Project } from '~/types/project'

interface CarouselPhoto extends Photo {
  projectSlug?: string
}

export const useCarousel = () => {
  const config = useRuntimeConfig()
  const { getRecentProjects } = useProjects()

  /**
   * Get carousel photos from gallery content (original functionality)
   */
  const getGalleryCarouselPhotos = async (): Promise<CarouselPhoto[]> => {
    const all = await queryCollection('content').all()
    
    // Find the carousel file by checking different possible paths
    const carouselData = 
      all.find((item) => item.path === '/carousel') ||
      all.find((item) => item.title === 'Hero Carousel Photos') ||
      null

    if (!carouselData) return []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contentItem = carouselData as any
    const meta = contentItem.meta || {}
    
    return (meta.photos || []) as CarouselPhoto[]
  }

  /**
   * Get carousel photos from recent projects (new functionality)
   */
  const getProjectCarouselPhotos = async (): Promise<CarouselPhoto[]> => {
    try {
      const recentProjects = await getRecentProjects(5)
      
      return recentProjects.map((project: Project, index: number) => ({
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

  /**
   * Get carousel photos based on the configured mode
   */
  const getCarouselPhotos = async (): Promise<CarouselPhoto[]> => {
    const mode = config.public.carouselMode
    
    if (mode === 'projects') {
      return await getProjectCarouselPhotos()
    } else {
      return await getGalleryCarouselPhotos()
    }
  }

  /**
   * Get the current carousel mode
   */
  const getCarouselMode = (): string => {
    return config.public.carouselMode
  }

  return {
    getCarouselPhotos,
    getGalleryCarouselPhotos,
    getProjectCarouselPhotos,
    getCarouselMode,
  }
}
