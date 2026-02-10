<template>
  <div>
    <!-- Stats -->
    <div class="grid grid-cols-4 gap-4 mb-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
      <StatCard :count="filteredStats.total" label="Total" status="total" @click="openCategory('total')">
        <template #icon>
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="2"/>
            <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
      </StatCard>
      <StatCard :count="filteredStats.ok" label="OK" status="ok" @click="openCategory('ok')">
        <template #icon>
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
      </StatCard>
      <StatCard :count="filteredStats.vencendo" label="Vencendo" status="vencendo" @click="openCategory('vencendo')">
        <template #icon>
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </template>
      </StatCard>
      <StatCard :count="filteredStats.vencido" label="Vencidos" status="vencido" @click="openCategory('vencido')">
        <template #icon>
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="2"/>
            <path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </template>
      </StatCard>
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

    <!-- View toggle + New product -->
    <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
      <div class="flex items-center gap-3">
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
            @click="setView(v)"
          >
            {{ v === 'cards' ? 'Cards' : v === 'table' ? 'Tabela' : 'Flags' }}
          </button>
        </div>
      </div>

      <button
        class="inline-flex items-center gap-2 py-3 px-5 rounded-lg text-sm font-medium cursor-pointer transition-colors text-white"
        style="background-color: var(--accent-color); border: none;"
        @click="showProductForm = true"
      >
        <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Novo Produto
      </button>
    </div>

    <!-- Products list -->
    <ProductList
      :products="displayedProducts"
      :view-mode="currentView"
      @edit="openEdit"
      @print="handlePrint"
      @delete="handleDelete"
    />

    <!-- Modals -->
    <ProductFormModal
      :show="showProductForm"
      @close="showProductForm = false"
      @created="onProductCreated"
    />

    <ProductEditModal
      :show="showEditModal"
      :product="editingProduct"
      @close="showEditModal = false"
      @updated="onProductUpdated"
    />

  </div>
</template>

<script setup lang="ts">
import type { Product, ProductStatus, ViewMode } from '~~/shared/types'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const { currentProfile, isAdmin, fetchProfile } = useAuth()
const { products, fetchProducts, deleteProduct, stats, filteredProducts } = useProducts()
const { selectedUnitId } = useUnits()
const { printLabel } = usePrintLabel()

const searchTerm = ref('')
const currentView = ref<ViewMode>('cards')
const showProductForm = ref(false)
const showEditModal = ref(false)
const editingProduct = ref<Product | null>(null)

// Filter by admin selected unit or user's own unit
const unitFilteredProducts = computed(() => {
  if (isAdmin.value) {
    if (!selectedUnitId.value) return products.value
    return products.value.filter(p => p.unit_id === selectedUnitId.value)
  }
  if (currentProfile.value?.unit_id) {
    return products.value.filter(p => p.unit_id === currentProfile.value!.unit_id)
  }
  return products.value
})

const filteredStats = computed(() => {
  const list = unitFilteredProducts.value
  const total = list.length
  const ok = list.filter(p => getProductStatus(p.expiration) === 'ok').length
  const vencendo = list.filter(p => getProductStatus(p.expiration) === 'vencendo').length
  const vencido = list.filter(p => getProductStatus(p.expiration) === 'vencido').length
  return { total, ok, vencendo, vencido }
})

const displayedProducts = computed(() => {
  let result = unitFilteredProducts.value
  if (searchTerm.value) {
    result = result.filter(p =>
      p.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }
  return result
})

onMounted(async () => {
  await fetchProfile()
  await fetchProducts()

  // Restore saved view
  if (import.meta.client) {
    const saved = localStorage.getItem('dashboardView') as ViewMode | null
    if (saved) currentView.value = saved
  }
})

function setView(view: ViewMode) {
  currentView.value = view
  if (import.meta.client) {
    localStorage.setItem('dashboardView', view)
  }
}

function openCategory(category: ProductStatus | 'total') {
  navigateTo(`/produtos/${category}`)
}

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

function onProductCreated() {
  // Products are already refreshed in the composable
}

function onProductUpdated() {
  // Products are already refreshed in the composable
}
</script>
