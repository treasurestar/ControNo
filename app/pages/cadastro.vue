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
    <p class="mb-7" style="color: var(--text-secondary);">Crie sua conta para acessar o sistema</p>

    <div class="card text-left">
      <h2 class="text-[22px] mb-2 font-semibold" style="color: var(--text-primary);">Criar Conta</h2>
      <p class="text-sm mb-6" style="color: var(--text-secondary);">Preencha os dados para se cadastrar</p>

      <!-- Success message -->
      <div v-if="successMsg" class="text-center py-4">
        <svg class="w-12 h-12 mx-auto mb-3" style="color: var(--ok-color);" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M8 12l3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <p class="text-sm mb-2" style="color: var(--ok-color);">{{ successMsg }}</p>
        <p class="text-sm" style="color: var(--text-secondary);">
          Verifique seu email e aguarde a aprovação do administrador para acessar o sistema.
        </p>
      </div>

      <!-- Registration form -->
      <form v-else @submit.prevent="handleRegister">
        <div class="mb-4">
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Nome</label>
          <input v-model="name" type="text" class="form-input" placeholder="Seu nome completo" required />
        </div>

        <div class="mb-4">
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Email</label>
          <input v-model="email" type="email" class="form-input" placeholder="seu@email.com" required />
        </div>

        <div class="mb-4">
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Unidade</label>
          <select v-model="unitId" class="form-input" required>
            <option value="" disabled>Selecione sua unidade</option>
            <option v-for="unit in units" :key="unit.id" :value="unit.id">{{ unit.name }}</option>
          </select>
        </div>

        <div class="mb-4">
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
          <input
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            placeholder="Repita a senha"
            required
          />
        </div>

        <p v-if="errorMsg" class="text-sm mb-4" style="color: var(--vencido-color);">{{ errorMsg }}</p>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Criando conta...' : 'Criar Conta' }}
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
import type { Unit } from '~~/shared/types'

definePageMeta({ layout: 'auth' })

const { theme } = useTheme()

const name = ref('')
const email = ref('')
const unitId = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const units = ref<Unit[]>([])

onMounted(async () => {
  try {
    units.value = await $fetch<Unit[]>('/api/units')
  } catch {
    errorMsg.value = 'Erro ao carregar unidades.'
  }
})

async function handleRegister() {
  errorMsg.value = ''

  if (password.value.length < 6) {
    errorMsg.value = 'A senha deve ter no mínimo 6 caracteres.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'As senhas não coincidem.'
    return
  }

  if (!unitId.value) {
    errorMsg.value = 'Selecione sua unidade.'
    return
  }

  loading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        name: name.value,
        email: email.value,
        password: password.value,
        unit_id: unitId.value
      }
    })
    successMsg.value = 'Conta criada com sucesso!'
  } catch (e: any) {
    errorMsg.value = e.data?.message || e.message || 'Erro ao criar conta.'
  } finally {
    loading.value = false
  }
}
</script>
