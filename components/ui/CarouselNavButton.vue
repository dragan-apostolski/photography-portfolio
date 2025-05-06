<script setup lang="ts">
interface Props {
  label: string
  active?: boolean
}

withDefaults(defineProps<Props>(), {
  active: false,
})

const emit = defineEmits<{
  click: []
  mouseenter: []
  mouseleave: []
}>()
</script>

<template>
  <button
    class="group relative cursor-pointer px-2 py-1 tracking-wider uppercase transition-all duration-300 lg:text-xl"
    :class="[
      active
        ? 'font-semibold text-primary-dark'
        : 'text-secondary-300 hover:text-accent dark:hover:text-accent',
    ]"
    @click="emit('click')"
    @mouseenter="emit('mouseenter')"
    @mouseleave="emit('mouseleave')"
  >
    {{ label }}
    <span
      class="absolute bottom-0 left-0 h-0.5 w-0 bg-accent transition-all duration-300 ease-in-out"
      :class="{
        'w-full': active,
        'group-hover:w-full': !active,
      }"
    />
  </button>
</template>
