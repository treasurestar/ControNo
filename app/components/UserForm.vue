<template>
  <div class="card">
    <h3 class="mb-4 font-semibold" style="color: var(--text-primary);">Adicionar usuário</h3>
    <form class="grid grid-cols-4 gap-4 items-end max-lg:grid-cols-2 max-sm:grid-cols-1" @submit.prevent="handleSubmit">
      <div>
        <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Nome</label>
        <input v-model="form.name" type="text" class="form-input" required />
      </div>
      <div>
        <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Email</label>
        <input v-model="form.email" type="email" class="form-input" required />
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
      <div>
        <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Senha</label>
        <input v-model="form.password" type="password" class="form-input" minlength="6" required />
      </div>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Adicionando...' : 'Adicionar' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['created'])

const { units } = useUnits()
const loading = ref(false)
const form = ref({
  name: '',
  email: '',
  unitName: '',
  role: 'user',
  password: ''
})

async function handleSubmit() {
  loading.value = true
  try {
    await $fetch('/api/admin/create-user', {
      method: 'POST',
      body: {
        name: form.value.name,
        email: form.value.email.toLowerCase(),
        password: form.value.password,
        unitName: form.value.unitName,
        role: form.value.role
      }
    })
    form.value = { name: '', email: '', unitName: '', role: 'user', password: '' }
    emit('created')
  } catch (e: any) {
    alert(e.data?.message || e.message || 'Erro ao criar usuário.')
  } finally {
    loading.value = false
  }
}
</script>
