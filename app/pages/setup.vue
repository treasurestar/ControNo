<template>
  <div class="text-center w-full max-w-[440px]">
    <div class="auth-actions flex justify-end mb-3">
      <ThemeToggle />
    </div>
    <div class="flex justify-center mb-5">
      <img
        v-if="theme === 'dark'"
        src="~/assets/img/logo-dark.png"
        alt="ControNô"
        class="h-14 w-auto object-contain"
      />
      <img
        v-else
        src="~/assets/img/logo-light.png"
        alt="ControNô"
        class="h-14 w-auto object-contain"
      />
    </div>
    <p class="mb-7" style="color: var(--text-secondary);">Criar novo usuário</p>

    <div class="card text-left">
      <h2 class="text-[22px] mb-2 font-semibold" style="color: var(--text-primary);">Criar Usuário</h2>
      <p class="text-sm mb-6" style="color: var(--text-secondary);">Preencha os dados para criar uma conta</p>

      <form @submit.prevent="handleCreate">
        <div class="mb-5">
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Email</label>
          <input v-model="email" type="text" class="form-input" placeholder="usuario@exemplo.com" required />
        </div>

        <div class="mb-5">
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Senha</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input pr-11"
              placeholder="Mínimo 6 caracteres"
              minlength="6"
              required
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

        <div class="flex flex-col gap-3 mb-5">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="autoConfirm"
              type="checkbox"
              class="w-5 h-5 rounded cursor-pointer accent-[var(--accent-color)]"
            />
            <div>
              <span class="text-sm font-medium" style="color: var(--text-primary);">Auto Confirm</span>
              <p class="text-xs" style="color: var(--text-secondary);">Confirma o email automaticamente (não precisa de email real)</p>
            </div>
          </label>

          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="isAdmin"
              type="checkbox"
              class="w-5 h-5 rounded cursor-pointer accent-[var(--accent-color)]"
            />
            <div>
              <span class="text-sm font-medium" style="color: var(--text-primary);">Administrador</span>
              <p class="text-xs" style="color: var(--text-secondary);">Dar permissões de administrador a este usuário</p>
            </div>
          </label>
        </div>

        <p v-if="errorMsg" class="text-sm mb-4" style="color: var(--vencido-color);">{{ errorMsg }}</p>
        <p v-if="successMsg" class="text-sm mb-4" style="color: var(--ok-color);">{{ successMsg }}</p>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Criando...' : 'Criar Usuário' }}
        </button>
      </form>

      <p class="text-center mt-5 text-sm" style="color: var(--text-secondary);">
        Já tem uma conta?
        <NuxtLink to="/login" class="font-medium no-underline" style="color: var(--accent-color);">Fazer login</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { theme } = useTheme()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const autoConfirm = ref(true)
const isAdmin = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

async function handleCreate() {
  errorMsg.value = ''
  successMsg.value = ''

  if (password.value.length < 6) {
    errorMsg.value = 'A senha deve ter no mínimo 6 caracteres.'
    return
  }

  loading.value = true
  try {
    const result = await $fetch('/api/setup/create-user', {
      method: 'POST',
      body: {
        email: email.value.toLowerCase().trim(),
        password: password.value,
        autoConfirm: autoConfirm.value,
        isAdmin: isAdmin.value
      }
    })

    successMsg.value = `Usuário criado com sucesso! (${result.role})`
    email.value = ''
    password.value = ''
    isAdmin.value = false
  } catch (e: any) {
    errorMsg.value = e.data?.message || e.message || 'Erro ao criar usuário.'
  } finally {
    loading.value = false
  }
}
</script>
