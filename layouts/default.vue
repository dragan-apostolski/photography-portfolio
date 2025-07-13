<script setup lang="ts">
// The default layout includes the SiteNavbar, content area, and SiteFooter
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <SiteNavbar />
    <main class="flex-grow">
      <!-- Added pt-16 to account for fixed navbar height -->
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
