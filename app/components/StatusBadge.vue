<template>
  <span
    class="status-badge"
    :class="{
      'status-badge-ok': status === 'ok',
      'status-badge-vencendo': status === 'vencendo',
      'status-badge-vencido': status === 'vencido'
    }"
  >
    {{ statusLabel(status) }}
  </span>
</template>

<script setup lang="ts">
import type { ProductStatus } from '~~/shared/types'

defineProps<{ status: ProductStatus }>()
</script>
