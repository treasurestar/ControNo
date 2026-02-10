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
      <h2 class="mb-2 text-lg font-semibold" style="color: var(--text-primary);">Recuperar Senha</h2>
      <p class="text-sm mb-6" style="color: var(--text-secondary);">Informe seu email para receber o código</p>

      <form @submit.prevent="sendRecovery">
        <div class="mb-5">
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Email</label>
          <input
            v-model="email"
            type="email"
            class="form-input"
            required
          />
        </div>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Enviando...' : 'Enviar Código' }}
        </button>
      </form>

      <p v-if="message" class="mt-4 text-sm text-center" style="color: var(--ok-color);">{{ message }}</p>
      <p v-if="error" class="mt-4 text-sm text-center" style="color: var(--vencido-color);">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ show: boolean }>()
defineEmits(['close'])

const email = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')

async function sendRecovery() {
  loading.value = true
  message.value = ''
  error.value = ''

  try {
    const { resetPassword } = useAuth()
    await resetPassword(email.value)
    message.value = 'Email de recuperação enviado. Verifique sua caixa de entrada.'
  } catch (e: any) {
    error.value = e.message || 'Erro ao enviar email.'
  } finally {
    loading.value = false
  }
}
</script>
