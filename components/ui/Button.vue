<script setup lang="ts">
interface Props {
  type?: 'button' | 'submit'
  customClasses?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  customClasses: '',
})

const responsiveClasses =
  'px-3 py-1.5 text-sm md:px-4 md:py-2 md:text-base lg:px-5 lg:py-2.5 lg:text-lg'
</script>

<template>
  <button
    :type="props.type"
    class="cursor-pointer rounded-lg border-2 border-accent bg-transparent font-medium tracking-widest text-primary uppercase transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-accent hover:text-primary dark:text-primary-dark dark:hover:text-primary"
    :class="responsiveClasses + ' ' + customClasses"
  >
    <slot />
  </button>
</template>
