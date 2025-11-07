export function generatePhotoId(src: string): string {
  return src
    .replace(/^\/photos\//, '')
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

