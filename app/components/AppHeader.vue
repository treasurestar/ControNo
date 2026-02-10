<template>
  <header
    class="flex justify-between items-center px-6 py-3 sticky top-0 z-[100]"
    style="background: var(--bg-secondary); box-shadow: var(--shadow);"
  >
    <div class="flex items-center gap-3">
      <!-- Back button -->
      <button
        v-if="showBackButton"
        class="inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
        style="color: var(--text-secondary); background: none; border: 1px solid var(--border-color);"
        title="Voltar"
        @click="goBack"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <img
        v-if="theme === 'dark'"
        src="~/assets/img/logo-dark.png"
        alt="ControNô"
        class="h-9 w-auto object-contain"
      />
      <img
        v-else
        src="~/assets/img/logo-light.png"
        alt="ControNô"
        class="h-9 w-auto object-contain"
      />
      <div class="flex flex-col leading-tight">
        <span class="text-xs font-medium" style="color: var(--text-secondary);">{{ unitLabel }}</span>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <!-- Unit selector for admin -->
      <div v-if="isAdmin" class="relative">
        <select
          :value="selectedUnitId || ''"
          class="py-1.5 px-3 pr-8 rounded-lg text-sm cursor-pointer appearance-none"
          style="background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary);"
          @change="onUnitChange"
        >
          <option value="">Todas as unidades</option>
          <option v-for="unit in units" :key="unit.id" :value="unit.id">{{ unit.name }}</option>
        </select>
        <svg class="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style="color: var(--text-secondary);" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <NuxtLink
        v-if="isAdmin && !isOnConfig"
        to="/configuracoes"
        class="inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
        style="color: var(--text-secondary); background: none; text-decoration: none;"
        title="Configurações"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
          <path d="M19.4 15a1.8 1.8 0 00.36 1.99l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.8 1.8 0 00-1.99-.36 1.8 1.8 0 00-1.09 1.64V21a2 2 0 01-4 0v-.08a1.8 1.8 0 00-1.09-1.64 1.8 1.8 0 00-1.99.36l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.8 1.8 0 005 15a1.8 1.8 0 00-1.64-1.09H3a2 2 0 010-4h.08A1.8 1.8 0 005 8.82a1.8 1.8 0 00-.36-1.99l-.06-.06A2 2 0 015.41 3.94l.06.06A1.8 1.8 0 007.46 5a1.8 1.8 0 001.64-1.09V3a2 2 0 014 0v.08A1.8 1.8 0 0014.18 5a1.8 1.8 0 001.99-.36l.06-.06a2 2 0 012.83 2.83l-.06.06A1.8 1.8 0 0019 8.82a1.8 1.8 0 001.64 1.09H21a2 2 0 010 4h-.08A1.8 1.8 0 0019.4 15z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </NuxtLink>
      <ThemeToggle />
      <div class="flex items-center gap-2" style="color: var(--text-secondary);">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>{{ currentProfile?.name || 'Usuário' }}</span>
      </div>
      <button
        class="py-2 px-4 rounded-md text-sm cursor-pointer transition-all"
        style="background: none; border: 1px solid var(--border-color); color: var(--text-secondary);"
        @click="logout"
      >
        Sair
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
const { theme } = useTheme()
const { currentProfile, isAdmin, logout } = useAuth()
const { units, selectedUnitId, selectedUnit, selectUnit, fetchUnits } = useUnits()

const isOnConfig = computed(() => route.path === '/configuracoes')
const showBackButton = computed(() => route.path !== '/dashboard')

const unitLabel = computed(() => {
  if (isAdmin.value) {
    return selectedUnit.value?.name || 'Todas as unidades'
  }
  // User's unit: try profile join, then fallback to local units list
  const profile = currentProfile.value
  if (profile?.units?.name) return profile.units.name
  if (profile?.unit_id) {
    const found = units.value.find(u => u.id === profile.unit_id)
    if (found) return found.name
  }
  return ''
})

function onUnitChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  selectUnit(value || null)
}

function goBack() {
  navigateTo('/dashboard')
}

onMounted(async () => {
  if (units.value.length === 0) {
    await fetchUnits()
  }
})
</script>
