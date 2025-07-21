<script setup lang="ts">
interface TagProps {
  label: string
  size?: 'small' | 'medium' | 'large'
  active?: boolean
  onClick?: () => void
}

const props = withDefaults(defineProps<TagProps>(), {
  size: 'medium',
  active: false,
  onClick: undefined,
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'small':
      return 'px-2 py-0.5 text-xs'
    case 'large':
      return 'px-4 py-2 text-base'
    default:
      return 'px-3 py-1 text-sm'
  }
})

const handleClick = () => {
  if (props.onClick) {
    props.onClick()
  }
}
</script>

<template>
  <button
    class="inline-flex items-center rounded-full font-medium uppercase transition-all duration-300 ease-in-out hover:cursor-pointer focus:outline-none"
    :class="[
      sizeClasses,
      active
        ? 'bg-accent text-primary shadow-sm'
        : 'bg-secondary-200 text-primary hover:bg-secondary-300 dark:bg-secondary-800 dark:hover:bg-secondary-700',
    ]"
    @click="handleClick"
  >
    <slot>{{ label }}</slot>
  </button>
</template>
