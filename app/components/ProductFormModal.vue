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
      <h2 class="mb-2 text-lg font-semibold" style="color: var(--text-primary);">Cadastrar Produto</h2>
      <p class="text-sm mb-6" style="color: var(--text-secondary);">Preencha os dados do novo produto</p>

      <form @submit.prevent="handleSubmit">
        <!-- Unit selector for admin -->
        <div v-if="isAdmin" class="mb-5">
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Unidade</label>
          <select v-model="form.unitId" class="form-input" required>
            <option value="">Selecione uma unidade</option>
            <option v-for="unit in units" :key="unit.id" :value="unit.id">{{ unit.name }}</option>
          </select>
        </div>

        <div class="mb-5">
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Nome do Produto</label>
          <input v-model="form.name" type="text" class="form-input" placeholder="Ex: Maionese" required />
        </div>

        <div class="mb-5">
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Ingredientes</label>
          <textarea v-model="form.ingredients" class="form-input min-h-[80px] resize-y" placeholder="Ex: óleo de milho, cebola, alho, ovo" rows="3"></textarea>
        </div>

        <div class="mb-5">
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Responsável</label>
          <input v-model="form.responsible" type="text" class="form-input" placeholder="Ex: Nome do responsável" />
        </div>

        <div class="mb-5">
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Peso</label>
          <input v-model="form.weight" type="text" class="form-input" placeholder="Ex: 1,2 kg" />
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

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['close', 'created'])

const { currentProfile, isAdmin } = useAuth()
const { units, selectedUnitId } = useUnits()
const { addProduct } = useProducts()

const props = defineProps<{ show: boolean }>()

const loading = ref(false)
const form = ref({
  name: '',
  ingredients: '',
  responsible: '',
  weight: '',
  fabrication: '',
  expiration: '',
  unitId: ''
})

// Pre-select unit from header when modal opens
watch(() => props.show, (open) => {
  if (open && selectedUnitId.value) {
    form.value.unitId = selectedUnitId.value
  }
})

async function handleSubmit() {
  if (form.value.expiration < form.value.fabrication) {
    alert('A data de vencimento não pode ser anterior à data de fabricação.')
    return
  }

  loading.value = true
  try {
    // Determine unit_id: admin form selection > user's own unit
    let unitId = ''
    if (isAdmin.value) {
      unitId = form.value.unitId
    } else {
      unitId = currentProfile.value?.unit_id || ''
    }

    if (!unitId) {
      alert('Selecione uma unidade.')
      return
    }

    const data = await addProduct({
      name: form.value.name.toUpperCase(),
      ingredients: form.value.ingredients,
      responsible: form.value.responsible,
      weight: form.value.weight,
      fabrication: form.value.fabrication,
      expiration: form.value.expiration,
      unit_id: unitId
    })

    // Reset form
    form.value = { name: '', ingredients: '', responsible: '', weight: '', fabrication: '', expiration: '', unitId: '' }
    emit('created', data)
    emit('close')
  } catch (e: any) {
    alert('Erro ao cadastrar o produto: ' + (e.message || ''))
  } finally {
    loading.value = false
  }
}
</script>
