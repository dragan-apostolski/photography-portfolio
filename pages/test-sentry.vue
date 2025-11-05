<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <h1 class="text-3xl font-bold mb-6">Sentry Error Tracking Test</h1>
    
    <div class="space-y-4 mb-8">
      <div class="bg-secondary p-4 rounded-lg">
        <p class="text-sm mb-2">This page helps you test if Sentry is properly configured.</p>
        <p class="text-xs text-muted">After clicking a test button, check your Sentry dashboard for the error.</p>
      </div>
    </div>

    <div class="space-y-4">
      <div>
        <h2 class="text-xl font-semibold mb-3">Test Error Types</h2>
        
        <div class="space-y-3">
          <button
            @click="testSynchronousError"
            class="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:cursor-pointer hover:opacity-90 transition-opacity"
          >
            Test Synchronous Error
          </button>

          <button
            @click="testAsyncError"
            class="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:cursor-pointer hover:opacity-90 transition-opacity"
          >
            Test Async/Promise Error
          </button>

          <button
            @click="testUnhandledRejection"
            class="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:cursor-pointer hover:opacity-90 transition-opacity"
          >
            Test Unhandled Promise Rejection
          </button>

          <button
            @click="testVueError"
            class="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:cursor-pointer hover:opacity-90 transition-opacity"
          >
            Test Vue Component Error
          </button>
        </div>
      </div>

      <div v-if="lastTest" class="mt-6 p-4 bg-secondary rounded-lg">
        <p class="text-sm font-semibold mb-1">Last Test:</p>
        <p class="text-xs">{{ lastTest }}</p>
        <p class="text-xs text-muted mt-2">Check your Sentry dashboard to see if the error was captured.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const lastTest = ref<string>('')

const testSynchronousError = () => {
  lastTest.value = 'Synchronous error triggered at ' + new Date().toLocaleTimeString()
  throw new Error('Test synchronous error from Sentry test page')
}

const testAsyncError = async () => {
  lastTest.value = 'Async error triggered at ' + new Date().toLocaleTimeString()
  await new Promise((resolve) => setTimeout(resolve, 100))
  throw new Error('Test async error from Sentry test page')
}

const testUnhandledRejection = () => {
  lastTest.value = 'Unhandled rejection triggered at ' + new Date().toLocaleTimeString()
  Promise.reject(new Error('Test unhandled promise rejection from Sentry test page'))
}

const testVueError = () => {
  lastTest.value = 'Vue component error triggered at ' + new Date().toLocaleTimeString()
  // Simulate a component error by accessing undefined property
  const obj: any = null
  obj.nonExistentProperty.value = 'This will cause an error'
}

useHead({
  title: 'Sentry Test',
})
</script>

