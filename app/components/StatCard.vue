<template>
  <div
    class="card flex items-center gap-4 cursor-pointer transition-all hover:-translate-y-0.5"
    @click="$emit('click')"
  >
    <div
      class="w-12 h-12 rounded-[10px] flex items-center justify-center"
      :style="iconStyle"
    >
      <slot name="icon" />
    </div>
    <div class="flex flex-col">
      <span class="text-[28px] font-bold" :style="{ color: countColor }">{{ count }}</span>
      <span class="text-sm" style="color: var(--text-secondary);">{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  count: number
  label: string
  status: 'total' | 'ok' | 'vencendo' | 'vencido'
}>()

defineEmits(['click'])

const iconStyle = computed(() => {
  const styles: Record<string, { bg: string; color: string }> = {
    total: { bg: 'rgba(139, 115, 85, 0.15)', color: 'var(--accent-color)' },
    ok: { bg: 'rgba(34, 197, 94, 0.15)', color: 'var(--ok-color)' },
    vencendo: { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--vencendo-color)' },
    vencido: { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--vencido-color)' }
  }
  const s = styles[props.status]
  return { background: s.bg, color: s.color }
})

const countColor = computed(() => {
  const colors: Record<string, string> = {
    total: 'var(--text-primary)',
    ok: 'var(--ok-color)',
    vencendo: 'var(--vencendo-color)',
    vencido: 'var(--vencido-color)'
  }
  return colors[props.status]
})
</script>
