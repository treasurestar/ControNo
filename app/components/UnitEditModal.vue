<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button
        class="absolute top-4 right-5 bg-transparent border-none text-[28px] cursor-pointer leading-none"
        style="color: var(--text-secondary);"
        @click="$emit('close')"
      >
        &times;
      </button>
      <h2 class="mb-4 text-lg font-semibold" style="color: var(--text-primary);">Editar Produto</h2>

      <form @submit.prevent="handleSubmit">
        <div class="mb-5">
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Nome do Produto</label>
          <input v-model="form.name" type="text" class="form-input" required />
        </div>

        <div class="mb-5">
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Ingredientes</label>
          <textarea v-model="form.ingredients" class="form-input min-h-[80px] resize-y" rows="3"></textarea>
        </div>

        <div class="mb-5">
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Responsável</label>
          <input v-model="form.responsible" type="text" class="form-input" />
        </div>

        <div class="mb-5">
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Peso</label>
          <input v-model="form.weight" type="text" class="form-input" />
        </div>

        <div class="grid grid-cols-2 gap-4 mb-5 max-sm:grid-cols-1">
          <div>
            <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Data de Fabricação</label>
            <input v-model="form.fabrication" type="date" class="form-input" required />
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Data de Vencimento</label>
            <input v-model="form.expiration" type="date" class="form-input" required />
          </div>
        </div>

        <div class="flex gap-3 mt-2.5">
          <button type="submit" class="btn-primary flex-1" :disabled="loading">
            {{ loading ? 'Salvando...' : 'Salvar' }}
          </button>
          <button type="button" class="btn-secondary flex-1" @click="$emit('close')">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~~/shared/types'

const props = defineProps<{
  show: boolean
  product: Product | null
}>()
const emit = defineEmits(['close', 'updated'])

const supabase = useSupabaseClient()
const loading = ref(false)
const form = ref({
  name: '',
  ingredients: '',
  responsible: '',
  weight: '',
  fabrication: '',
  expiration: ''
})

watch(() => props.product, (p) => {
  if (p) {
    form.value = {
      name: p.name,
      ingredients: p.ingredients || '',
      responsible: p.responsible || '',
      weight: p.weight || '',
      fabrication: p.fabrication,
      expiration: p.expiration
    }
  }
}, { immediate: true })

async function handleSubmit() {
  if (!props.product) return

  if (form.value.expiration < form.value.fabrication) {
    alert('A data de vencimento não pode ser anterior à data de fabricação.')
    return
  }

  loading.value = true
  try {
    const { error } = await supabase
      .from('products')
      .update({
        name: form.value.name.toUpperCase(),
        ingredients: form.value.ingredients,
        responsible: form.value.responsible,
        weight: form.value.weight,
        fabrication: form.value.fabrication,
        expiration: form.value.expiration
      })
      .eq('id', props.product.id)

    if (error) throw error

    emit('updated')
    emit('close')
  } catch (e: any) {
    alert('Erro ao atualizar o produto: ' + (e.message || ''))
  } finally {
    loading.value = false
  }
}
</script>
