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
}

export const usePhotoGallery = () => {
  // Create a reactive store for the photo collection
  const photos = ref<Photo[]>([
    {
      id: 'landscape-golivrh',
      src: '/photos/landscape/GoliVrh.avif',
      title: 'Goli Vrh',
      aspectRatio: 'horizontal',
      description: 'Morning view of the mountains in Triglav National Park',
      location: 'Slovenia',
      tag: ['landscape', 'mountains'],
    },
    {
      id: 'landscape-losinj',
      src: '/photos/landscape/Losinj.avif',
      title: 'Lošinj Island',
      aspectRatio: 'horizontal',
      description: 'Sunset view of the Adriatic Sea',
      location: 'Croatia',
      tag: ['landscape', 'sea'],
    },
    {
      id: 'landscape-macha-land',
      src: '/photos/landscape/MachaPuchareLand.avif',
      title: 'Machapuchare',
      aspectRatio: 'horizontal',
      description: 'The sacred mountain in the Annapurna range',
      location: 'Nepal',
      tag: ['landscape', 'mountains'],
    },
    {
      id: 'landscape-macha-port',
      src: '/photos/landscape/MachapucharePort.avif',
      title: 'Machapuchare Portrait',
      aspectRatio: 'vertical',
      description: 'Close-up view of the Fishtail mountain',
      location: 'Nepal',
      tag: ['landscape', 'mountains'],
    },
    {
      id: 'landscape-prisojnik',
      src: '/photos/landscape/Prisojnik.avif',
      title: 'Prisojnik',
      aspectRatio: 'horizontal',
      description: 'Early morning light on Prisojnik mountain',
      location: 'Slovenia',
      tag: ['landscape', 'mountains'],
    },
    {
      id: 'landscape-providenca',
      src: '/photos/landscape/Providenca.avif',
      title: 'Providenca',
      aspectRatio: 'horizontal',
      description: 'Church on a hill at sunset',
      location: 'Slovenia',
      tag: ['landscape'],
    },
    {
      id: 'landscape-sigiriya',
      src: '/photos/landscape/Sigiriya.avif',
      title: 'Sigiriya Rock',
      aspectRatio: 'horizontal',
      description: 'Ancient rock fortress in central Sri Lanka',
      location: 'Sri Lanka',
      tag: ['landscape', 'travel'],
    },
    {
      id: 'landscape-zadar',
      src: '/photos/landscape/Zadar.avif',
      title: 'Zadar Sunset',
      aspectRatio: 'horizontal',
      description: 'Sunset view of Zadar city',
      location: 'Croatia',
      tag: ['landscape', 'urban', 'sea'],
    },
    {
      id: 'landscape-soca',
      src: '/photos/landscape/soca.avif',
      title: 'Soča River',
      aspectRatio: 'horizontal',
      description: 'The emerald beauty of Soča river',
      location: 'Slovenia',
      tag: ['landscape'],
    },
    {
      id: 'portrait-eka',
      src: '/photos/portraits/Eka.avif',
      title: 'Eka',
      aspectRatio: 'vertical',
      description: 'Portrait session in the city',
      location: 'Ljubljana, Slovenia',
      tag: ['portrait'],
    },
    {
      id: 'portrait-eka2',
      src: '/photos/portraits/Eka2.avif',
      title: 'Eka in Nature',
      aspectRatio: 'vertical',
      description: 'Portrait session in nature',
      location: 'Ljubljana, Slovenia',
      tag: ['portrait'],
    },
    {
      id: 'portrait-ivana',
      src: '/photos/portraits/IvanaLines.avif',
      title: 'Ivana',
      aspectRatio: 'vertical',
      description: 'Light and shadow play',
      location: 'Ljubljana, Slovenia',
      tag: ['portrait', 'experimental'],
    },
    {
      id: 'portrait-lina',
      src: '/photos/portraits/Lina.avif',
      title: 'Lina',
      aspectRatio: 'vertical',
      description: 'Autumn portrait session',
      location: 'Ljubljana, Slovenia',
      tag: ['portrait'],
    },
    {
      id: 'travel-blue-mosque',
      src: '/photos/travel/BlueMosque.avif',
      title: 'Blue Mosque',
      aspectRatio: 'vertical',
      description: 'Inside the Sultan Ahmed Mosque',
      location: 'Istanbul, Turkey',
      tag: ['travel', 'urban'],
    },
    {
      id: 'travel-deda-prodaje',
      src: '/photos/travel/DedaProdaje.avif',
      title: 'Market Vendor',
      aspectRatio: 'vertical',
      description: 'Old man selling goods at a local market',
      location: 'Kathmandu, Nepal',
      tag: ['travel'],
    },
    {
      id: 'travel-grannies',
      src: '/photos/travel/Grannies.avif',
      title: 'Grannies',
      aspectRatio: 'vertical',
      description: 'Elderly women chatting on a bench',
      location: 'Kathmandu, Nepal',
      tag: ['travel'],
    },
    {
      id: 'travel-himalaya-girl',
      src: '/photos/travel/HimalayaGirl.avif',
      title: 'Himalayan Girl',
      aspectRatio: 'vertical',
      description: 'Local girl in the Himalayan mountains',
      location: 'Nepal',
      tag: ['travel', 'portrait'],
    },
    {
      id: 'travel-kiddos',
      src: '/photos/travel/Kiddos.avif',
      title: 'Kiddos',
      aspectRatio: 'vertical',
      description: 'Children playing in a village',
      location: 'Nepal',
      tag: ['travel'],
    },
    {
      id: 'travel-monkey-temple',
      src: '/photos/travel/MonkeyTemple.avif',
      title: 'Monkey Temple',
      aspectRatio: 'vertical',
      description: 'Swayambhunath temple with monkeys',
      location: 'Kathmandu, Nepal',
      tag: ['travel'],
    },
    {
      id: 'travel-walking-market',
      src: '/photos/travel/WalkingMarket.avif',
      title: 'Walking Market',
      aspectRatio: 'vertical',
      description: 'People walking through a busy market',
      location: 'Kathmandu, Nepal',
      tag: ['travel', 'urban'],
    },
  ])

  // Available tags for filtering
  const availableTags = computed(() => {
    const tagSet = new Set<string>()
    photos.value.forEach((photo) => {
      photo.tag.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  })

  // Get all photos
  const getAllPhotos = () => photos.value

  // Filter photos by tag
  const getPhotosByTag = (tag: string) => {
    return photos.value.filter((photo) => photo.tag.includes(tag))
  }

  // Get a photo by ID
  const getPhotoById = (id: string) => {
    return photos.value.find((photo) => photo.id === id)
  }

  // Get the index of a photo in the filtered list
  const getPhotoIndexInFiltered = (photos: Photo[], id: string) => {
    return photos.findIndex((photo) => photo.id === id)
  }

  return {
    photos,
    availableTags,
    getAllPhotos,
    getPhotosByTag,
    getPhotoById,
    getPhotoIndexInFiltered,
  }
}
