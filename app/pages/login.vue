<template>
  <div class="text-center w-full max-w-[400px]">
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
    <p class="mb-7" style="color: var(--text-secondary);">Gerencie a validade dos produtos do seu restaurante</p>

    <div class="card text-left">
      <h2 class="text-[22px] mb-2 font-semibold" style="color: var(--text-primary);">Entrar</h2>
      <p class="text-sm mb-6" style="color: var(--text-secondary);">Digite suas credenciais para acessar o sistema</p>

      <form @submit.prevent="handleLogin">
        <div class="mb-5">
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Email</label>
          <input v-model="email" type="email" class="form-input" placeholder="seu@email.com" />
        </div>

        <div class="mb-5">
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Senha</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input pr-11"
              placeholder="Digite sua senha"
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

        <p v-if="errorMsg" class="text-sm mb-4" style="color: var(--vencido-color);">{{ errorMsg }}</p>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

    </div>

    <p class="mt-7 text-[13px]" style="color: var(--text-secondary);">Sistema de Controle de Validade</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { theme } = useTheme()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const loggingIn = ref(false)
const user = useSupabaseUser()

watch(user, (val) => {
  if (val && !loggingIn.value) navigateTo('/dashboard')
}, { immediate: true })

async function handleLogin() {
  if (!email.value) {
    errorMsg.value = 'Informe o email.'
    return
  }

  loading.value = true
  loggingIn.value = true
  errorMsg.value = ''

  try {
    const { login } = useAuth()
    await login(email.value, password.value)
    await navigateTo('/dashboard')
  } catch (e: any) {
    const msg = e?.message || ''
    if (msg === 'ACCOUNT_PENDING_APPROVAL') {
      errorMsg.value = 'Sua conta ainda não foi aprovada pelo administrador. Aguarde a aprovação para acessar o sistema.'
    } else {
      errorMsg.value = 'Email ou senha inválidos!'
    }
  } finally {
    loading.value = false
    loggingIn.value = false
  }
}
</script>
