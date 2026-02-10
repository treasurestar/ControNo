<template>
  <div class="flex justify-center items-center min-h-screen">
    <p style="color: var(--text-secondary);">Confirmando...</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const user = useSupabaseUser()

watch(user, (val) => {
  if (val) {
    navigateTo('/dashboard')
  }
}, { immediate: true })
</script>
