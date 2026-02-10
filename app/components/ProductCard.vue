<template>
  <div
    class="card relative"
    :style="{
      borderLeft: `4px solid ${borderColor}`
    }"
  >
    <div class="flex justify-between items-start mb-3">
      <div class="flex items-center gap-2">
        <!-- Status icon -->
        <svg v-if="status === 'ok'" class="w-5 h-5" style="color: var(--ok-color);" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else-if="status === 'vencendo'" class="w-5 h-5" style="color: var(--vencendo-color);" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <svg v-else class="w-5 h-5" style="color: var(--vencido-color);" viewBox="0 0 24 24" fill="none">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="2"/>
          <path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <!-- Dropdown -->
      <div class="relative inline-block">
        <button
          class="bg-transparent border-none cursor-pointer p-1"
          style="color: var(--text-secondary);"
          @click.stop="dropdownOpen = !dropdownOpen"
        >
          <svg viewBox="0 0 24 24" fill="none" class="w-5 h-5">
            <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
          </svg>
        </button>
        <div
          v-if="dropdownOpen"
          class="absolute right-0 top-full rounded-lg z-10 min-w-[150px] overflow-hidden"
          style="background: var(--bg-secondary); border: 1px solid var(--border-color); box-shadow: var(--shadow);"
        >
          <button class="flex items-center gap-2 py-3 px-4 text-sm cursor-pointer transition-colors w-full text-left bg-transparent border-none" style="color: var(--text-primary);" @click="$emit('edit', product); dropdownOpen = false">
            <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Editar
          </button>
          <button class="flex items-center gap-2 py-3 px-4 text-sm cursor-pointer transition-colors w-full text-left bg-transparent border-none" style="color: var(--text-primary);" @click="$emit('print', product); dropdownOpen = false">
            <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="6" y="14" width="12" height="8" stroke="currentColor" stroke-width="2"/>
            </svg>
            Imprimir
          </button>
          <button class="flex items-center gap-2 py-3 px-4 text-sm cursor-pointer transition-colors w-full text-left bg-transparent border-none" style="color: var(--vencido-color);" @click="$emit('delete', product); dropdownOpen = false">
            <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Excluir
          </button>
        </div>
      </div>
    </div>

    <h3 class="text-base font-semibold mb-2" style="color: var(--text-primary);">Produto: {{ product.name }}</h3>
    <p class="text-[13px] mb-3 leading-relaxed" style="color: var(--text-secondary);">
      <strong>Ingredientes:</strong> {{ product.ingredients }}
    </p>
    <p v-if="product.responsible" class="text-[13px] mb-3 leading-relaxed" style="color: var(--text-secondary);">
      <strong>Responsável:</strong> {{ product.responsible }}
    </p>

    <div class="flex gap-4 flex-wrap">
      <span
        class="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-[20px] text-xs font-medium"
        style="background: rgba(139, 115, 85, 0.15); color: var(--accent-color);"
      >
        <svg viewBox="0 0 24 24" fill="none" class="w-3.5 h-3.5">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
          <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Fabricação: {{ formatDateShort(product.fabrication) }}
      </span>
      <span
        class="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-[20px] text-xs font-medium"
        :style="{ background: valBg, color: valColor }"
      >
        <svg viewBox="0 0 24 24" fill="none" class="w-3.5 h-3.5">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Vencimento: {{ formatDateShort(product.expiration) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~~/shared/types'

const props = defineProps<{ product: Product }>()
defineEmits(['edit', 'print', 'delete'])

const dropdownOpen = ref(false)

const status = computed(() => getProductStatus(props.product.expiration))

const borderColor = computed(() => {
  const colors = { ok: 'var(--ok-color)', vencendo: 'var(--vencendo-color)', vencido: 'var(--vencido-color)' }
  return colors[status.value]
})

const valBg = computed(() => {
  const bgs = { ok: 'rgba(34, 197, 94, 0.15)', vencendo: 'rgba(245, 158, 11, 0.15)', vencido: 'rgba(239, 68, 68, 0.15)' }
  return bgs[status.value]
})

const valColor = computed(() => {
  const colors = { ok: 'var(--ok-color)', vencendo: 'var(--vencendo-color)', vencido: 'var(--vencido-color)' }
  return colors[status.value]
})

// Close dropdown when clicking outside
if (import.meta.client) {
  const handleClickOutside = () => { dropdownOpen.value = false }
  onMounted(() => document.addEventListener('click', handleClickOutside))
  onUnmounted(() => document.removeEventListener('click', handleClickOutside))
}
</script>
