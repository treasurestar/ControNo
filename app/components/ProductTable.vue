<template>
  <div class="w-full overflow-x-auto">
    <table class="data-table">
      <thead>
        <tr>
          <th>Produto</th>
          <th>Fabricação</th>
          <th>Vencimento</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>{{ product.name }}</td>
          <td>{{ formatDateShort(product.fabrication) }}</td>
          <td>{{ formatDateShort(product.expiration) }}</td>
          <td><StatusBadge :status="getProductStatus(product.expiration)" /></td>
          <td>
            <button class="table-action" @click="$emit('edit', product)">Editar</button>
            <button class="table-action" @click="$emit('print', product)">Imprimir</button>
            <button class="table-action table-action-delete" @click="$emit('delete', product)">Excluir</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~~/shared/types'

defineProps<{ products: Product[] }>()
defineEmits(['edit', 'print', 'delete'])
</script>
