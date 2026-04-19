<template>
  <div
    class="group relative aspect-video w-full overflow-hidden rounded-2xl bg-secondary-100 shadow-2xl dark:bg-secondary-900"
  >
    <template v-if="!showIframe">
      <NuxtImg
        :src="thumbnailSrc"
        :alt="title ? `${title} — video thumbnail` : 'Video thumbnail'"
        class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        loading="lazy"
        sizes="100vw md:1024px lg:1280px"
        :onerror="handleThumbnailError"
      />

      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"
      />

      <button
        type="button"
        :aria-label="title ? `Play ${title}` : 'Play video'"
        class="absolute inset-0 flex cursor-pointer items-center justify-center focus:outline-none"
        @click="showIframe = true"
      >
        <span
          class="flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent bg-black/40 text-accent backdrop-blur-sm transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:bg-accent group-hover:text-primary md:h-24 md:w-24 dark:group-hover:text-primary-dark"
          style="will-change: transform"
        >
          <Icon name="ph:play-fill" class="h-8 w-8 translate-x-0.5 md:h-10 md:w-10" />
        </span>
      </button>
    </template>

    <iframe
      v-else
      :src="embedSrc"
      :title="title || 'YouTube video player'"
      class="h-full w-full border-0"
      loading="lazy"
      allowfullscreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  videoUrl: string
  title?: string
}

const props = defineProps<Props>()

const showIframe = ref(false)

const thumbnailSrc = ref(getYouTubeThumbnail(props.videoUrl, 'max'))
const hqFallback = getYouTubeThumbnail(props.videoUrl, 'hq')

const embedSrc = computed(() => getYouTubeEmbedUrl(props.videoUrl, { autoplay: true }))

const handleThumbnailError = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (img && !img.dataset.fallbackApplied && hqFallback) {
    img.dataset.fallbackApplied = 'true'
    img.src = hqFallback
    thumbnailSrc.value = hqFallback
  }
}
</script>
