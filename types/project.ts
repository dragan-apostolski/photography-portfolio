export interface ProjectPhoto {
  id: string
  src: string
  fileName: string
  description?: string
  aspectRatio: 'square' | 'vertical' | 'horizontal'
  location?: string
  timestamp?: string
}

export interface ProjectPhotoConfig {
  fileName: string
  description?: string
  aspectRatio: 'square' | 'vertical' | 'horizontal'
}

export interface Project {
  slug: string
  title: string
  description: string
  location?: string
  tags: string[]
  date?: string // Single date
  startDate?: string // Start of date range
  endDate?: string // End of date range
  coverPhoto: string
  coverPhotoMobile?: string
  projectRoot: string
  featured?: boolean
  photos: ProjectPhotoConfig[]
  body?: object // For markdown content from Nuxt Content
}

export interface ProjectWithPhotos extends Project {
  photos: ProjectPhoto[]
}
