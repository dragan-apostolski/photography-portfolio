export interface HorizontalScrollItem {
  id?: string
  content?: unknown
  type?: string
  photo?: unknown
  width?: number // Width in vw units (default: 100)
  [key: string]: unknown
}

export interface HorizontalScrollOptions {
  items: HorizontalScrollItem[]
  startOffset?: number
  endOffset?: number
}

export function useHorizontalScroll(options: HorizontalScrollOptions) {
  const { items, endOffset = 0.15 } = options

  const trackRef = ref<HTMLElement>()
  const frameRef = ref<HTMLElement>()
  const isActive = ref(false)
  const progress = ref(0)

  // Calculate cumulative widths for each item
  const itemWidths = computed(() => {
    return items.map(item => item.width || 100) // Default to 100vw if not specified
  })

  // Calculate total track width
  const totalTrackWidth = computed(() => {
    return itemWidths.value.reduce((sum, width) => sum + width, 0)
  })

  // Calculate track height based on total width
  const trackHeight = computed(() => `${totalTrackWidth.value}vw`)

  // Calculate cumulative positions for each item
  const itemPositions = computed(() => {
    const positions: number[] = []
    let currentPosition = 0
    
    for (let i = 0; i < itemWidths.value.length; i++) {
      positions.push(currentPosition)
      currentPosition += itemWidths.value[i]
    }
    
    return positions
  })

  // Calculate frame transform based on scroll progress
  const frameTransform = computed(() => {
    if (items.length === 0) return 'translateX(0vw)'
    
    // Calculate the optimal stopping point for the last item
    const lastItemWidth = itemWidths.value[itemWidths.value.length - 1]
    const viewportWidth = 100 // 100vw
    
    // If the last item is smaller than viewport, center it
    // If it's full width or larger, align it to fill the viewport
    let maxTranslate: number
    
    if (lastItemWidth < viewportWidth) {
      // Center the last item: move so it appears at (100vw - itemWidth) / 2 from left
      const lastItemStartPosition = itemPositions.value[itemPositions.value.length - 1]
      const desiredLeftPosition = (viewportWidth - lastItemWidth) / 2
      maxTranslate = lastItemStartPosition - desiredLeftPosition
    } else {
      // For full-width items, just ensure they fill the viewport
      maxTranslate = totalTrackWidth.value - viewportWidth
    }
    
    const translateX = progress.value * maxTranslate
    return `translateX(-${translateX}vw)`
  })

  // Scroll event handler
  const handleScroll = () => {
    if (!trackRef.value) return

    const rect = trackRef.value.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const trackHeight = trackRef.value.offsetHeight

    // Calculate when track is in view
    const trackTop = rect.top
    const trackBottom = rect.bottom

    // Track is considered "in view" when it starts entering viewport
    const isInView = trackBottom > 0 && trackTop < windowHeight

    if (!isInView) {
      isActive.value = false
      progress.value = 0
      return
    }

    // Only start animation when the camera is fully settled and first photo is completely visible
    // Add a small buffer to ensure the first photo is fully displayed before scrolling begins
    const startTriggerPoint = -windowHeight * 0.1 // 10% of viewport height buffer

    // Don't start animation until track top is at or above the start trigger point
    if (trackTop > startTriggerPoint) {
      progress.value = 0
      isActive.value = false
      return
    }

    // Calculate scroll progress within the track
    const totalScrollDistance = trackHeight - windowHeight
    const currentScrollDistance = Math.max(0, startTriggerPoint - trackTop)
    const endOffsetDistance = windowHeight * endOffset
    const effectiveScrollDistance = totalScrollDistance - endOffsetDistance

    // Normalize progress between 0 and 1
    const rawProgress = currentScrollDistance / effectiveScrollDistance
    progress.value = Math.max(0, Math.min(1, rawProgress))

    isActive.value = progress.value > 0 && progress.value < 1
  }

  // Intersection observer to optimize scroll listening
  const setupIntersectionObserver = () => {
    if (!trackRef.value || !import.meta.client) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          window.addEventListener('scroll', handleScroll, { passive: true })
        } else {
          window.removeEventListener('scroll', handleScroll)
        }
      },
      {
        rootMargin: '20% 0px 20% 0px',
      }
    )

    observer.observe(trackRef.value)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }

  // Detect if device should use horizontal scroll
  const shouldUseHorizontalScroll = computed(() => {
    if (!import.meta.client) return true
    return window.innerWidth >= 768 // Desktop and large tablets
  })

  onMounted(() => {
    const cleanup = setupIntersectionObserver()

    onUnmounted(() => {
      cleanup?.()
    })
  })

  return {
    trackRef,
    frameRef,
    trackHeight,
    frameTransform,
    isActive,
    progress,
    shouldUseHorizontalScroll,
    itemWidths,
    itemPositions,
    totalTrackWidth,
  }
}
