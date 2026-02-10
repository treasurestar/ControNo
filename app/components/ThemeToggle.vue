<template>
  <button
    class="p-2 rounded-lg cursor-pointer transition-colors"
    style="background: none; border: none; color: var(--text-secondary);"
    title="Alternar tema"
    @click="toggleTheme"
  >
    <svg v-if="theme === 'light'" class="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
    <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
</template>

<script setup lang="ts">
const { theme, toggleTheme } = useTheme()
</script>
