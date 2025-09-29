<template>
  <section
    ref="trackRef"
    class="horizontal-scroll-track relative bg-primary dark:bg-primary-dark"
    :class="{
      'md:h-[var(--track-height)]': shouldUseHorizontalScroll,
      'h-auto': !shouldUseHorizontalScroll,
    }"
    :style="{ '--track-height': trackHeight }"
  >
    <!-- Camera: Viewport-sized sticky container -->
    <div
      class="horizontal-scroll-camera bg-primary dark:bg-primary-dark"
      :class="{
        'md:sticky md:top-0 md:h-screen md:w-screen md:overflow-hidden': shouldUseHorizontalScroll,
        'h-auto w-auto overflow-visible': !shouldUseHorizontalScroll,
      }"
    >
      <!-- Frame: Container that moves horizontally -->
      <div
        ref="frameRef"
        class="horizontal-scroll-frame transition-transform duration-75 ease-linear"
        :class="{
          'md:flex md:h-full md:flex-row': shouldUseHorizontalScroll,
          'flex flex-col': !shouldUseHorizontalScroll,
        }"
        :style="{
          transform: shouldUseHorizontalScroll ? frameTransform : 'none',
        }"
      >
        <!-- Items: Individual scrollable content -->
        <div
          v-for="(item, index) in items"
          :key="item.id || index"
          class="horizontal-scroll-item flex-shrink-0"
          :class="{
            'md:h-screen': shouldUseHorizontalScroll,
            'md:w-[50vw]': shouldUseHorizontalScroll && item.aspectRatio === 'vertical',
            'md:w-[75vw]': shouldUseHorizontalScroll && item.aspectRatio === 'square',
            'md:w-screen': shouldUseHorizontalScroll && item.aspectRatio === 'horizontal',
            'min-h-screen w-full': !shouldUseHorizontalScroll,
          }"
        >
          <slot name="item" :item="item" :index="index" :progress="progress" :is-active="isActive">
            <!-- Default item content -->
            <div
              class="flex h-full w-full items-center justify-center bg-secondary-100 dark:bg-secondary-800"
            >
              <div class="p-8 text-center">
                <h3 class="mb-4 text-2xl font-bold">Item {{ index + 1 }}</h3>
                <p class="text-lg">{{ item.content || 'Horizontal scroll content' }}</p>
              </div>
            </div>
          </slot>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HorizontalScrollItem } from '~/composables/useHorizontalScroll'

interface Props {
  items: HorizontalScrollItem[]
  startOffset?: number
  endOffset?: number
}

const props = withDefaults(defineProps<Props>(), {
  startOffset: 0.2,
  endOffset: 0.15,
})

const {
  trackRef,
  frameRef,
  trackHeight,
  frameTransform,
  isActive,
  progress,
  shouldUseHorizontalScroll,
} = useHorizontalScroll({
  items: props.items,
  startOffset: props.startOffset,
  endOffset: props.endOffset,
})

// Expose reactive values for parent components
defineExpose({
  isActive,
  progress,
  shouldUseHorizontalScroll,
})
</script>

<style scoped>
.horizontal-scroll-track {
  /* Ensure smooth scrolling performance */
  will-change: scroll-position;
}

.horizontal-scroll-camera {
  /* Optimize rendering for sticky positioning */
  will-change: transform;
}

.horizontal-scroll-frame {
  /* Optimize for transform animations */
  will-change: transform;
}

.horizontal-scroll-item {
  /* Ensure items don't shrink in flex layout */
  flex-shrink: 0;
}

/* Smooth scroll behavior for better UX */
@media (prefers-reduced-motion: no-preference) {
  .horizontal-scroll-frame {
    transition-duration: 75ms;
  }
}

/* Disable transitions for reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .horizontal-scroll-frame {
    transition: none !important;
  }
}
</style>
