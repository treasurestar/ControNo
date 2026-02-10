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
      <h2 class="mb-4 text-lg font-semibold" style="color: var(--text-primary);">Editar Usuário</h2>

      <form class="grid grid-cols-2 gap-4 items-end max-sm:grid-cols-1" @submit.prevent="handleSubmit">
        <div>
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Nome</label>
          <input v-model="form.name" type="text" class="form-input" required />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Email</label>
          <input :value="form.email" type="email" class="form-input opacity-60" disabled />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Unidade</label>
          <select v-model="form.unitName" class="form-input" required>
            <option v-for="unit in units" :key="unit.id" :value="unit.name">{{ unit.name }}</option>
          </select>
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Perfil</label>
          <select v-model="form.role" class="form-input" required>
            <option value="user">Usuário</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="col-span-2 max-sm:col-span-1">
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Nova Senha</label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input pr-11"
              placeholder="Deixe vazio para manter a atual"
              minlength="6"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer"
              style="color: var(--text-secondary);"
              @click="showPassword = !showPassword"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="flex gap-3 col-span-2 max-sm:col-span-1">
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
import type { Profile } from '~~/shared/types'

const props = defineProps<{
  show: boolean
  user: Profile | null
}>()
const emit = defineEmits(['close', 'updated'])

const { units } = useUnits()
const loading = ref(false)
const showPassword = ref(false)
const form = ref({
  name: '',
  email: '',
  unitName: '',
  role: 'user',
  password: ''
})

watch(() => props.user, (u) => {
  if (u) {
    form.value = {
      name: u.name || '',
      email: u.email || '',
      unitName: u.units?.name || '',
      role: u.role || 'user',
      password: ''
    }
    showPassword.value = false
  }
}, { immediate: true })

async function handleSubmit() {
  if (!props.user) return
  loading.value = true
  try {
    await $fetch(`/api/admin/profiles/${props.user.id}`, {
      method: 'PATCH',
      body: {
        name: form.value.name,
        unitName: form.value.unitName,
        role: form.value.role,
        password: form.value.password || undefined
      }
    })
    emit('updated')
    emit('close')
  } catch (e: any) {
    alert(e.data?.message || e.message || 'Erro ao atualizar usuário.')
  } finally {
    loading.value = false
  }
}
</script>
