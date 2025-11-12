import type { Photo } from '~/types/photo'
import type { Project } from '~/types/project'

interface CarouselPhoto extends Photo {
  projectSlug?: string
  coverPhotoMobile?: string
}

const CAROUSEL_SOURCE = {
  RECENT: 'recent',
  CONTENT: 'content',
} as const

type CarouselSource = typeof CAROUSEL_SOURCE[keyof typeof CAROUSEL_SOURCE]

export const useCarousel = () => {
  const config = useRuntimeConfig()
  const cdnBaseUrl = config.public.cdnBaseUrl || ''
  const { getRecentProjects, getProjectBySlug } = useProjects()
  
  // Helper to convert relative path to CDN URL
  const getPhotoUrl = (relativePath: string): string => {
    if (!relativePath) return ''
    if (relativePath.startsWith('http')) return relativePath
    const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath
    return cdnBaseUrl ? `${cdnBaseUrl}/${cleanPath}` : relativePath
  }

  // Helper to map project to carousel photo
  const mapProjectToCarouselPhoto = (project: Project): CarouselPhoto => ({
    id: `project-carousel-${project.slug}`,
    title: project.title,
    src: getPhotoUrl(project.coverPhoto),
    alt: `Cover photo for ${project.title}`,
    description: project.description,
    buttonTitle: 'View Project',
    tag: project.tags || [],
    location: project.location,
    timestamp: project.date,
    projectSlug: project.slug,
    coverPhotoMobile: project.coverPhotoMobile ? getPhotoUrl(project.coverPhotoMobile) : undefined,
  })

  /**
   * Get carousel photos from recent projects
   */
  const getCarouselPhotosFromRecentProjects = async (): Promise<CarouselPhoto[]> => {
    try {
      const recentProjects = await getRecentProjects(5)
      return recentProjects.map((project: Project) => mapProjectToCarouselPhoto(project))
    } catch (error) {
      console.error('Error fetching project carousel photos:', error)
      return []
    }
  }

  /**
   * Get carousel photos from content file (carousel.md)
   */
  const getCarouselPhotosFromContent = async (): Promise<CarouselPhoto[]> => {
    try {
      const all = await queryCollection('content').all()
      const carouselContent = 
        all.find((item) => item.path === '/carousel') ||
        all.find((item) => item.title === 'Featured Projects') ||
        null
      
      if (!carouselContent) {
        return []
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const carouselData = carouselContent as any
      const meta = carouselData.meta || {}
      const projects = meta.projects || carouselData.projects || []

      if (!Array.isArray(projects) || projects.length === 0) {
        return []
      }

      const carouselPhotos: CarouselPhoto[] = []

      for (const slug of projects) {
        try {
          const project = await getProjectBySlug(slug)
          if (project && project.coverPhoto) {
            carouselPhotos.push(mapProjectToCarouselPhoto(project))
          }
        } catch (projectError) {
          console.warn(`Failed to load project with slug "${slug}":`, projectError)
        }
      }

      return carouselPhotos
    } catch (error) {
      console.error('Error fetching carousel photos from content:', error)
      return []
    }
  }

  /**
   * Get carousel photos - configurable via ENV variable
   */
  const getCarouselPhotos = async (): Promise<CarouselPhoto[]> => {
    const source = (config.public.carouselSource || CAROUSEL_SOURCE.RECENT) as CarouselSource
    
    if (source === CAROUSEL_SOURCE.CONTENT) {
      return getCarouselPhotosFromContent()
    }
    
    return getCarouselPhotosFromRecentProjects()
  }

  return {
    getCarouselPhotos,
  }
}
