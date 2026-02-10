<template>
  <div />
</template>

<script setup lang="ts">
const user = useSupabaseUser()

watchEffect(() => {
  if (user.value) {
    navigateTo('/dashboard')
  } else {
    navigateTo('/login')
  }
})
</script>
