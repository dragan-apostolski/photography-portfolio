<template>
  <div
    class="flex h-screen flex-col bg-primary text-primary dark:bg-primary-dark dark:text-primary-dark"
  >
    <!-- Toolbar -->
    <header
      class="z-20 flex shrink-0 items-center justify-between gap-4 border-b border-secondary-200 px-4 py-3 md:px-6 dark:border-secondary-800"
    >
      <div class="flex min-w-0 items-center gap-3">
        <NuxtLink
          :to="`/projects/${slug}`"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-secondary-200 transition-colors hover:cursor-pointer hover:bg-secondary-100 dark:border-secondary-800 dark:hover:bg-secondary-900"
          aria-label="Back to project"
        >
          <Icon name="heroicons:arrow-left" class="h-4 w-4" />
        </NuxtLink>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span
              class="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-accent uppercase"
            >
              Edit
            </span>
            <h1 class="truncate text-base font-semibold md:text-lg">
              {{ project?.title || slug }}
            </h1>
          </div>
          <p class="truncate text-xs text-secondary-500 dark:text-secondary-400">
            Drag photos on the timeline to reorder · {{ photos.length }} photos<span
              v-if="hiddenCount"
              >, {{ hiddenCount }} hidden</span
            >
          </p>
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-2 md:gap-3">
        <Transition name="fade">
          <span
            v-if="isDirty"
            class="hidden items-center gap-1.5 text-xs font-medium text-accent sm:flex"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-accent" />
            Unsaved changes
          </span>
          <span
            v-else-if="justSaved"
            class="hidden items-center gap-1.5 text-xs font-medium text-secondary-500 sm:flex dark:text-secondary-400"
          >
            <Icon name="heroicons:check-circle" class="h-4 w-4 text-accent" />
            Saved
          </span>
        </Transition>

        <button
          :disabled="!isDirty || saving"
          class="rounded-full border border-secondary-200 px-3 py-1.5 text-sm transition-colors hover:cursor-pointer hover:bg-secondary-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-secondary-800 dark:hover:bg-secondary-900"
          @click="reset"
        >
          Reset
        </button>
        <button
          :disabled="!isDirty || saving"
          class="flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-primary transition-opacity hover:cursor-pointer hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          @click="save"
        >
          <Icon v-if="saving" name="heroicons:arrow-path" class="h-4 w-4 animate-spin" />
          {{ saving ? 'Saving' : 'Save order' }}
        </button>
      </div>
    </header>

    <!-- Loading / error -->
    <div v-if="pending" class="flex flex-1 items-center justify-center">
      <Icon name="heroicons:arrow-path" class="h-6 w-6 animate-spin text-secondary-400" />
    </div>
    <div
      v-else-if="!project || photos.length === 0"
      class="flex flex-1 items-center justify-center"
    >
      <p class="text-secondary-500">No reorderable photos found for this project.</p>
    </div>

    <template v-else>
      <!-- Preview of the active photo -->
      <section class="relative flex flex-1 items-center justify-center overflow-hidden p-4 md:p-8">
        <Transition name="preview" mode="out-in">
          <figure
            v-if="activePhoto"
            :key="activePhoto.fileName"
            class="flex h-full w-full flex-col items-center justify-center gap-3"
          >
            <NuxtImg
              :src="activePhoto.src"
              :alt="activePhoto.fileName"
              class="max-h-[calc(100%-2rem)] max-w-full rounded-2xl object-contain shadow-2xl transition-all"
              :class="activePhoto.hidden ? 'opacity-40 grayscale' : ''"
              loading="eager"
              quality="80"
              sizes="100vw md:80vw"
            />
            <figcaption
              class="flex items-center gap-3 text-xs text-secondary-500 dark:text-secondary-400"
            >
              <span class="font-mono">{{ activePhoto.fileName }}</span>
              <span class="text-secondary-300 dark:text-secondary-700">·</span>
              <span class="capitalize">{{ activePhoto.aspectRatio }}</span>
              <template v-if="activePhoto.hidden">
                <span class="text-secondary-300 dark:text-secondary-700">·</span>
                <span
                  class="flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 font-semibold text-accent uppercase"
                >
                  <Icon name="heroicons:eye-slash" class="h-3 w-3" />
                  Hidden
                </span>
              </template>
            </figcaption>
          </figure>
        </Transition>

        <!-- Position pill -->
        <div
          v-if="activeIndex >= 0"
          class="absolute top-4 left-4 rounded-full bg-secondary-100/80 px-3 py-1 text-xs font-semibold backdrop-blur md:top-8 md:left-8 dark:bg-secondary-900/80"
        >
          {{ activeIndex + 1 }} / {{ photos.length }}
        </div>
      </section>

      <!-- Timeline filmstrip -->
      <section
        class="shrink-0 border-t border-secondary-200 bg-secondary-100/50 dark:border-secondary-800 dark:bg-secondary-900/40"
      >
        <div
          ref="stripRef"
          class="flex items-stretch gap-2 overflow-x-auto px-4 py-4 md:px-6"
          @dragover="onStripDragOver"
          @drop.prevent="onDragEnd"
        >
          <div
            v-for="(photo, index) in photos"
            :key="photo.fileName"
            :data-active="photo.fileName === activeFileName ? 'true' : undefined"
            :data-fname="photo.fileName"
            draggable="true"
            tabindex="0"
            class="group/item relative flex h-28 shrink-0 cursor-grab flex-col overflow-hidden rounded-lg ring-2 transition-all duration-150 select-none focus:outline-none active:cursor-grabbing md:h-32"
            :class="[
              photo.fileName === activeFileName
                ? 'ring-accent'
                : 'ring-transparent hover:ring-secondary-300 dark:hover:ring-secondary-700',
              photo.fileName === draggingFile ? 'scale-95 opacity-40' : 'opacity-100',
            ]"
            @click="activeFileName = photo.fileName"
            @focus="activeFileName = photo.fileName"
            @keydown="onKeydown($event, index)"
            @dragstart="onDragStart(index, $event)"
            @dragend="onDragEnd"
          >
            <!-- Thumbnail -->
            <div
              class="relative h-full overflow-hidden bg-secondary-200 dark:bg-secondary-800"
              :class="thumbAspect(photo.aspectRatio)"
            >
              <NuxtImg
                :src="photo.src"
                :alt="photo.fileName"
                class="pointer-events-none h-full w-full object-cover transition-all"
                :class="photo.hidden ? 'opacity-30 grayscale' : ''"
                loading="lazy"
                quality="40"
                sizes="200px"
                width="200"
              />
              <!-- Position badge -->
              <span
                class="absolute top-1 left-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/80 px-1 text-[10px] font-bold text-primary-dark tabular-nums dark:bg-primary-dark/80 dark:text-primary"
              >
                {{ index + 1 }}
              </span>

              <!-- Hidden indicator overlay -->
              <div
                v-if="photo.hidden"
                class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25"
              >
                <Icon name="heroicons:eye-slash" class="h-6 w-6 text-white/90 drop-shadow" />
              </div>

              <!-- Hide / show toggle -->
              <button
                class="absolute top-1 right-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:cursor-pointer hover:bg-black/70"
                :class="
                  photo.hidden
                    ? 'opacity-100'
                    : 'opacity-0 group-hover/item:opacity-100 group-focus/item:opacity-100'
                "
                :aria-label="photo.hidden ? 'Show photo in gallery' : 'Hide photo from gallery'"
                :title="photo.hidden ? 'Show in gallery' : 'Hide from gallery'"
                @click.stop="toggleHidden(photo.fileName)"
                @mousedown.stop
              >
                <Icon
                  :name="photo.hidden ? 'heroicons:eye-slash' : 'heroicons:eye'"
                  class="h-3.5 w-3.5"
                />
              </button>

              <!-- Nudge controls -->
              <div
                class="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-1 opacity-0 transition-opacity group-hover/item:opacity-100 group-focus/item:opacity-100"
              >
                <button
                  :disabled="index === 0"
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:cursor-pointer hover:bg-white/30 disabled:opacity-0"
                  aria-label="Move left"
                  @click.stop="move(index, index - 1)"
                >
                  <Icon name="heroicons:chevron-left" class="h-4 w-4" />
                </button>
                <button
                  :disabled="index === photos.length - 1"
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:cursor-pointer hover:bg-white/30 disabled:opacity-0"
                  aria-label="Move right"
                  @click.stop="move(index, index + 1)"
                >
                  <Icon name="heroicons:chevron-right" class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <p
          class="px-4 pb-3 text-center text-[11px] text-secondary-400 md:px-6 dark:text-secondary-500"
        >
          Drag to reorder · click to preview · use ← → to nudge · eye icon to hide from gallery
        </p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ProjectWithPhotos } from '~/types/project'

definePageMeta({ layout: false })

const route = useRoute()
const slug = route.params.slug as string

// This editor is a local-only admin tool — never reachable in production.
if (!import.meta.dev) {
  throw createError({ statusCode: 404, statusMessage: 'Not found', fatal: true })
}

const { getProjectWithPhotos } = useProjects()

const { data: project, pending } = await useAsyncData(`edit-project-${slug}`, () =>
  getProjectWithPhotos(slug)
)

// Local working copy of the order + hidden state. Source of truth is the .md file.
type StripPhoto = ProjectWithPhotos['photos'][number]
type PhotoState = { fileName: string; hidden: boolean }
const photos = ref<StripPhoto[]>([])
// Last saved (or initial) order + hidden state, used for dirty-tracking and reset.
const baseline = ref<PhotoState[]>([])
const activeFileName = ref<string>('')

// Seed the working copy from the loaded project. This watches `project` only —
// not `activeFileName` — so selecting or dragging a photo never re-seeds and
// wipes out in-progress edits. It re-runs solely when the source data loads or
// changes; edits accumulate in `photos` until the user clicks Save. Each photo
// is cloned so toggling `hidden` never mutates the cached project data.
watch(
  project,
  (proj) => {
    if (!proj?.photos?.length) return
    photos.value = proj.photos.map((p) => ({ ...p, hidden: !!p.hidden }))
    baseline.value = proj.photos.map((p) => ({ fileName: p.fileName, hidden: !!p.hidden }))
    if (!activeFileName.value) activeFileName.value = proj.photos[0].fileName
  },
  { immediate: true }
)

const activeIndex = computed(() =>
  photos.value.findIndex((p) => p.fileName === activeFileName.value)
)
const activePhoto = computed(() => photos.value[activeIndex.value] ?? null)

const currentState = computed<PhotoState[]>(() =>
  photos.value.map((p) => ({ fileName: p.fileName, hidden: !!p.hidden }))
)
const isDirty = computed(
  () => JSON.stringify(currentState.value) !== JSON.stringify(baseline.value)
)
const hiddenCount = computed(() => photos.value.filter((p) => p.hidden).length)

function toggleHidden(fileName: string) {
  const photo = photos.value.find((p) => p.fileName === fileName)
  if (photo) photo.hidden = !photo.hidden
}

const thumbAspect = (ratio: string) =>
  ratio === 'vertical' ? 'aspect-[2/3]' : ratio === 'square' ? 'aspect-square' : 'aspect-[3/2]'

// --- Reordering ---------------------------------------------------------
function move(from: number, to: number) {
  if (to < 0 || to >= photos.value.length || from === to) return
  const arr = [...photos.value]
  const [item] = arr.splice(from, 1)
  arr.splice(to, 0, item)
  photos.value = arr
}

// The fileName of the photo currently being dragged (null when not dragging).
// Tracked by fileName rather than index because the list reorders mid-drag.
const draggingFile = ref<string | null>(null)
const lastPointerX = ref(0)
let autoScrollRaf: number | null = null

function onDragStart(index: number, event: DragEvent) {
  draggingFile.value = photos.value[index].fileName
  activeFileName.value = photos.value[index].fileName
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

// Drop position is derived from the pointer's geometry over the strip, not from
// `dragenter` on individual items. This reliably reaches the very end (and any
// off-screen slot, once auto-scroll brings it into view) regardless of which
// thumbnails the pointer happens to cross.
function reorderToPointer() {
  const strip = stripRef.value
  const file = draggingFile.value
  if (!strip || !file) return

  // Count how many *other* thumbnails sit left of the pointer — that count is
  // the insertion index for the dragged photo in the list minus itself.
  let target = 0
  for (const el of strip.querySelectorAll<HTMLElement>('[data-fname]')) {
    if (el.dataset.fname === file) continue
    const box = el.getBoundingClientRect()
    if (lastPointerX.value > box.left + box.width / 2) target++
  }

  const current = photos.value.findIndex((p) => p.fileName === file)
  if (current === -1) return
  const rest = photos.value.filter((p) => p.fileName !== file)
  const dragged = photos.value[current]
  rest.splice(target, 0, dragged)
  // Only reassign when the order actually changes, to avoid redundant renders.
  if (rest.some((p, i) => p.fileName !== photos.value[i]?.fileName)) photos.value = rest
}

// Scroll the strip when the pointer hovers near its left/right edge, so photos
// can be dragged into positions that are currently scrolled out of view.
function autoScrollTick() {
  const strip = stripRef.value
  if (!strip || draggingFile.value === null) {
    autoScrollRaf = null
    return
  }
  const rect = strip.getBoundingClientRect()
  const EDGE = 72 // px from each edge that triggers scrolling
  const MAX_SPEED = 18 // px per frame at the very edge
  let delta = 0
  if (lastPointerX.value < rect.left + EDGE) {
    delta = -MAX_SPEED * Math.min(1, (rect.left + EDGE - lastPointerX.value) / EDGE)
  } else if (lastPointerX.value > rect.right - EDGE) {
    delta = MAX_SPEED * Math.min(1, (lastPointerX.value - (rect.right - EDGE)) / EDGE)
  }
  if (delta !== 0) {
    strip.scrollLeft += delta
    reorderToPointer() // keep advancing the dragged photo as new slots scroll in
    autoScrollRaf = requestAnimationFrame(autoScrollTick)
  } else {
    autoScrollRaf = null
  }
}

function onStripDragOver(event: DragEvent) {
  if (draggingFile.value === null) return
  event.preventDefault() // mark the strip as a valid drop target
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  lastPointerX.value = event.clientX
  reorderToPointer()
  if (autoScrollRaf === null) autoScrollRaf = requestAnimationFrame(autoScrollTick)
}

function onDragEnd() {
  draggingFile.value = null
  if (autoScrollRaf !== null) {
    cancelAnimationFrame(autoScrollRaf)
    autoScrollRaf = null
  }
}

function onKeydown(event: KeyboardEvent, index: number) {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    move(index, index - 1)
    scrollActiveIntoView()
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    move(index, index + 1)
    scrollActiveIntoView()
  }
}

// Keep the active thumbnail visible in the strip after nudging/selecting.
const stripRef = ref<HTMLElement | null>(null)
function scrollActiveIntoView() {
  nextTick(() => {
    const el = stripRef.value?.querySelector('[data-active="true"]')
    el?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' })
  })
}
watch(activeFileName, scrollActiveIntoView)

// --- Persistence --------------------------------------------------------
const saving = ref(false)
const justSaved = ref(false)
let savedTimer: ReturnType<typeof setTimeout> | null = null

async function save() {
  if (!isDirty.value || saving.value) return
  saving.value = true
  try {
    await $fetch('/api/reorder-photos', {
      method: 'POST',
      body: {
        slug,
        order: photos.value.map((p) => p.fileName),
        hidden: photos.value.filter((p) => p.hidden).map((p) => p.fileName),
      },
    })
    baseline.value = currentState.value.map((s) => ({ ...s }))
    justSaved.value = true
    if (savedTimer) clearTimeout(savedTimer)
    savedTimer = setTimeout(() => (justSaved.value = false), 2500)
  } catch (error) {
    alert('Failed to save order. Check the dev server console.')
    console.error(error)
  } finally {
    saving.value = false
  }
}

function reset() {
  const map = new Map(photos.value.map((p) => [p.fileName, p]))
  photos.value = baseline.value
    .map(({ fileName, hidden }) => {
      const photo = map.get(fileName)
      if (!photo) return null
      photo.hidden = hidden
      return photo
    })
    .filter(Boolean) as StripPhoto[]
}

// Warn before leaving with unsaved changes.
function beforeUnload(event: BeforeUnloadEvent) {
  if (isDirty.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}
onMounted(() => window.addEventListener('beforeunload', beforeUnload))
onUnmounted(() => {
  window.removeEventListener('beforeunload', beforeUnload)
  if (savedTimer) clearTimeout(savedTimer)
  if (autoScrollRaf !== null) cancelAnimationFrame(autoScrollRaf)
})

onBeforeRouteLeave(() => {
  if (isDirty.value) {
    return window.confirm('You have unsaved changes. Leave without saving?')
  }
})

useHead({ title: () => `Reorder · ${project.value?.title || slug}` })
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.preview-enter-active,
.preview-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.preview-enter-from {
  opacity: 0;
  transform: scale(0.98);
}
.preview-leave-to {
  opacity: 0;
  transform: scale(1.02);
}
</style>
