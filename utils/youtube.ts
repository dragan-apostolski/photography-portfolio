export type YouTubeThumbnailQuality = 'max' | 'hq' | 'mq' | 'sd'

const THUMBNAIL_FILENAMES: Record<YouTubeThumbnailQuality, string> = {
  max: 'maxresdefault.jpg',
  hq: 'hqdefault.jpg',
  mq: 'mqdefault.jpg',
  sd: 'sddefault.jpg',
}

export function getYouTubeId(url: string): string | null {
  if (!url) return null

  const trimmed = url.trim()

  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match?.[1]) return match[1]
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed

  return null
}

export function getYouTubeThumbnail(url: string, quality: YouTubeThumbnailQuality = 'max'): string {
  const id = getYouTubeId(url)
  if (!id) return ''
  return `https://img.youtube.com/vi/${id}/${THUMBNAIL_FILENAMES[quality]}`
}

export function getYouTubeEmbedUrl(url: string, opts: { autoplay?: boolean } = {}): string {
  const id = getYouTubeId(url)
  if (!id) return ''

  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  })

  if (opts.autoplay) {
    params.set('autoplay', '1')
  }

  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
}
