<template>
  <div class="text-center w-full max-w-[400px]">
    <div class="auth-actions flex justify-between mb-3">
      <NuxtLink
        to="/login"
        class="inline-flex items-center gap-1.5 text-sm no-underline transition-colors"
        style="color: var(--text-secondary);"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Voltar
      </NuxtLink>
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
    <p class="mb-7" style="color: var(--text-secondary);">Crie sua conta para começar</p>

    <div class="card text-left">
      <h2 class="text-[22px] mb-2 font-semibold" style="color: var(--text-primary);">Criar Conta</h2>
      <p class="text-sm mb-6" style="color: var(--text-secondary);">Preencha os dados para se cadastrar</p>

      <form @submit.prevent="handleRegister">
        <div class="mb-5">
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Nome</label>
          <input v-model="name" type="text" class="form-input" placeholder="Seu nome" required />
        </div>

        <div class="mb-5">
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Email</label>
          <input v-model="email" type="email" class="form-input" placeholder="seu@email.com" required />
        </div>

        <div class="mb-5">
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Unidade</label>
          <select v-model="unidade" class="form-input" required>
            <option value="">Selecione uma unidade</option>
            <option v-for="unit in units" :key="unit.id" :value="unit.name">{{ unit.name }}</option>
          </select>
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

        <div class="mb-5">
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Confirmar Senha</label>
          <div class="relative">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="form-input pr-11"
              placeholder="Repita a senha"
              required
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer"
              style="color: var(--text-secondary);"
              @click="showConfirmPassword = !showConfirmPassword"
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
          {{ loading ? 'Criando...' : 'Criar Conta' }}
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

const name = ref('')
const email = ref('')
const unidade = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')

const { units, fetchUnits } = useUnits()

onMounted(async () => {
  await fetchUnits()
})

async function handleRegister() {
  errorMsg.value = ''

  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'As senhas não coincidem!'
    return
  }

  if (email.value.toLowerCase() === 'admin@controno.com.br') {
    errorMsg.value = 'Este email é reservado para o administrador.'
    return
  }

  loading.value = true
  try {
    const { register } = useAuth()
    await register(name.value, email.value, unidade.value, password.value)
    alert('Conta criada. Se o email exigir confirmação, verifique sua caixa de entrada.')
    await navigateTo('/login')
  } catch (e: any) {
    errorMsg.value = e.message || 'Erro ao criar conta.'
  } finally {
    loading.value = false
  }
}
</script>
