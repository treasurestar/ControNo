<template>
  <div class="grid gap-3">
    <div
      v-for="product in products"
      :key="product.id"
      class="card flex justify-between items-center"
      :style="{ borderLeft: `4px solid ${getBorderColor(product)}` }"
    >
      <div>
        <h4 class="mb-1 font-semibold" style="color: var(--text-primary);">{{ product.name }}</h4>
        <div class="text-xs" style="color: var(--text-secondary);">
          FAB: {{ formatDateShort(product.fabrication) }} | VAL: {{ formatDateShort(product.expiration) }}
        </div>
      </div>
      <div class="flex items-center gap-2">
        <StatusBadge :status="getProductStatus(product.expiration)" />
        <button class="table-action" @click="$emit('edit', product)">Editar</button>
        <button class="table-action" @click="$emit('print', product)">Imprimir</button>
        <button class="table-action table-action-delete" @click="$emit('delete', product)">Excluir</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~~/shared/types'

defineProps<{ products: Product[] }>()
defineEmits(['edit', 'print', 'delete'])

function getBorderColor(product: Product) {
  const status = getProductStatus(product.expiration)
  const colors = { ok: 'var(--ok-color)', vencendo: 'var(--vencendo-color)', vencido: 'var(--vencido-color)' }
  return colors[status]
}
</script>
