<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content modal-content-large">
      <button
        class="absolute top-4 right-5 bg-transparent border-none text-[28px] cursor-pointer leading-none"
        style="color: var(--text-secondary);"
        @click="$emit('close')"
      >
        &times;
      </button>
      <h2 class="mb-4 text-lg font-semibold" style="color: var(--text-primary);">{{ title }}</h2>

      <div
        class="flex items-center gap-3 rounded-lg py-3 px-4 mb-5"
        style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
      >
        <svg class="w-5 h-5 flex-shrink-0" style="color: var(--text-secondary);" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input
          v-model="searchTerm"
          type="text"
          class="flex-1 border-none bg-transparent text-sm outline-none"
          style="color: var(--text-primary);"
          placeholder="Buscar produtos..."
        />
      </div>

      <ProductList
        :products="filteredList"
        :view-mode="viewMode"
        @edit="$emit('edit', $event)"
        @print="$emit('print', $event)"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product, ProductStatus, ViewMode } from '~~/shared/types'

const props = defineProps<{
  show: boolean
  category: ProductStatus | 'total'
  viewMode: ViewMode
}>()

const emit = defineEmits(['close', 'edit', 'print', 'delete'])

const searchTerm = ref('')

const { products } = useProducts()
const { isAdmin, currentProfile } = useAuth()
const { selectedUnitId } = useUnits()

const title = computed(() => {
  const titles: Record<string, string> = {
    total: 'Todos os Produtos',
    ok: 'Produtos OK',
    vencendo: 'Produtos Vencendo',
    vencido: 'Produtos Vencidos'
  }
  return titles[props.category] || 'Produtos'
})

const filteredList = computed(() => {
  let result = products.value

  // Filter by unit
  if (isAdmin.value) {
    if (selectedUnitId.value) {
      result = result.filter(p => p.unit_id === selectedUnitId.value)
    }
  } else if (currentProfile.value?.unit_id) {
    result = result.filter(p => p.unit_id === currentProfile.value!.unit_id)
  }

  if (props.category !== 'total') {
    result = result.filter(p => getProductStatus(p.expiration) === props.category)
  }

  if (searchTerm.value) {
    result = result.filter(p =>
      p.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  return result
})

function handleDelete(product: Product) {
  emit('delete', product)
}
</script>
