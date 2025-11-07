interface CameraSettings {
  shutterSpeed?: string
  aperture?: string
  iso?: string
  [key: string]: string | undefined
}

export interface Photo {
  id: string
  src: string
  title?: string
  description?: string
  location?: string
  timestamp?: string
  cameraSettings?: CameraSettings
  width?: number
  height?: number
  aspectRatio?: 'square' | 'vertical' | 'horizontal'
  tag: string[]
  alt?: string
  buttonTitle?: string
  projectSlug?: string
}
