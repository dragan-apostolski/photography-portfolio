export interface ProjectPhoto {
  id: string
  src: string
  title?: string
  description?: string
  location?: string
  timestamp?: string
  width?: number
  height?: number
  aspectRatio?: 'square' | 'vertical' | 'horizontal'
}

export interface Project {
  slug: string
  title: string
  description: string
  location?: string
  tag: string[]
  date: string
  coverPhoto: string
  featured?: boolean
  photos: string[]
  body?: object // For markdown content from Nuxt Content
}

export interface ProjectWithPhotos extends Project {
  processedPhotos: ProjectPhoto[]
}
