<template>
  <div>
    <div v-if="products.length === 0" class="text-center py-16" style="color: var(--text-secondary);">
      <svg class="w-16 h-16 mx-auto mb-4 opacity-50" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="2"/>
        <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <p class="text-base">Nenhum produto encontrado</p>
    </div>

    <div v-else-if="viewMode === 'cards'" class="grid gap-4">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        @edit="$emit('edit', $event)"
        @print="$emit('print', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>

    <ProductTable
      v-else-if="viewMode === 'table'"
      :products="products"
      @edit="$emit('edit', $event)"
      @print="$emit('print', $event)"
      @delete="$emit('delete', $event)"
    />

    <ProductFlag
      v-else
      :products="products"
      @edit="$emit('edit', $event)"
      @print="$emit('print', $event)"
      @delete="$emit('delete', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { Product, ViewMode } from '~~/shared/types'

defineProps<{
  products: Product[]
  viewMode: ViewMode
}>()

defineEmits(['edit', 'print', 'delete'])
</script>
