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
  date: string
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
