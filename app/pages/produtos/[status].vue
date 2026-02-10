<template>
  <div>
    <!-- Page header -->
    <div class="flex items-center justify-between gap-4 mb-5 flex-wrap">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center"
          :style="{ background: statusBg }"
        >
          <svg v-if="status === 'total'" class="w-5 h-5" :style="{ color: statusColor }" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="2"/>
            <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="status === 'ok'" class="w-5 h-5" :style="{ color: statusColor }" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="status === 'vencendo'" class="w-5 h-5" :style="{ color: statusColor }" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <svg v-else class="w-5 h-5" :style="{ color: statusColor }" viewBox="0 0 24 24" fill="none">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="2"/>
            <path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-semibold" style="color: var(--text-primary);">{{ title }}</h2>
          <p class="text-sm" style="color: var(--text-secondary);">{{ filteredList.length }} produtos</p>
        </div>
      </div>
    </div>

    <!-- Search bar -->
    <div
      class="flex items-center gap-3 rounded-lg py-3 px-4 mb-4"
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

    <!-- View toggle -->
    <div class="flex items-center gap-3 mb-4">
      <span class="text-[13px] uppercase tracking-wide" style="color: var(--text-secondary);">Visualização</span>
      <div class="flex gap-2">
        <button
          v-for="v in (['cards', 'table', 'flags'] as const)"
          :key="v"
          class="py-2 px-3.5 rounded-lg text-[13px] cursor-pointer transition-all"
          :style="{
            background: currentView === v ? 'rgba(139, 115, 85, 0.1)' : 'var(--bg-secondary)',
            border: `1px solid ${currentView === v ? 'var(--accent-color)' : 'var(--border-color)'}`,
            color: currentView === v ? 'var(--accent-color)' : 'var(--text-secondary)'
          }"
          @click="currentView = v"
        >
          {{ v === 'cards' ? 'Cards' : v === 'table' ? 'Tabela' : 'Flags' }}
        </button>
      </div>
    </div>

    <!-- Products list -->
    <ProductList
      :products="filteredList"
      :view-mode="currentView"
      @edit="openEdit"
      @print="handlePrint"
      @delete="handleDelete"
    />

    <!-- Edit modal -->
    <ProductEditModal
      :show="showEditModal"
      :product="editingProduct"
      @close="showEditModal = false"
      @updated="showEditModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { Product, ProductStatus, ViewMode } from '~~/shared/types'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const route = useRoute()
const status = computed(() => (route.params.status as string) || 'total')

const { currentProfile, isAdmin, fetchProfile } = useAuth()
const { products, fetchProducts, deleteProduct } = useProducts()
const { selectedUnitId } = useUnits()
const { printLabel } = usePrintLabel()

const searchTerm = ref('')
const currentView = ref<ViewMode>('cards')
const showEditModal = ref(false)
const editingProduct = ref<Product | null>(null)

const title = computed(() => {
  const titles: Record<string, string> = {
    total: 'Todos os Produtos',
    ok: 'Produtos OK',
    vencendo: 'Produtos Vencendo',
    vencido: 'Produtos Vencidos'
  }
  return titles[status.value] || 'Produtos'
})

const statusColor = computed(() => {
  const colors: Record<string, string> = {
    total: 'var(--accent-color)',
    ok: 'var(--ok-color)',
    vencendo: 'var(--vencendo-color)',
    vencido: 'var(--vencido-color)'
  }
  return colors[status.value] || 'var(--accent-color)'
})

const statusBg = computed(() => {
  const bgs: Record<string, string> = {
    total: 'rgba(139, 115, 85, 0.12)',
    ok: 'rgba(34, 197, 94, 0.12)',
    vencendo: 'rgba(245, 158, 11, 0.12)',
    vencido: 'rgba(239, 68, 68, 0.12)'
  }
  return bgs[status.value] || 'rgba(139, 115, 85, 0.12)'
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

  // Filter by status
  if (status.value !== 'total') {
    result = result.filter(p => getProductStatus(p.expiration) === status.value)
  }

  // Filter by search
  if (searchTerm.value) {
    result = result.filter(p =>
      p.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  return result
})

onMounted(async () => {
  await fetchProfile()
  if (products.value.length === 0) {
    await fetchProducts()
  }

  if (import.meta.client) {
    const saved = localStorage.getItem('dashboardView') as ViewMode | null
    if (saved) currentView.value = saved
  }
})

function openEdit(product: Product) {
  editingProduct.value = product
  showEditModal.value = true
}

function handlePrint(product: Product) {
  printLabel(product)
}

async function handleDelete(product: Product) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return
  try {
    await deleteProduct(product.id)
  } catch (e: any) {
    alert('Erro ao excluir o produto.')
  }
}
</script>
