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

    <div class="card text-center">
      <svg class="w-14 h-14 mx-auto mb-4" style="color: var(--ok-color);" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M8 12l3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <h2 class="text-[22px] mb-3 font-semibold" style="color: var(--text-primary);">Email Confirmado!</h2>
      <p class="text-sm mb-6" style="color: var(--text-secondary);">
        Seu email foi confirmado com sucesso. Aguarde a aprovação do administrador para acessar o sistema.
      </p>
      <NuxtLink
        to="/login"
        class="btn-primary inline-block no-underline text-center"
      >
        Ir para Login
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { theme } = useTheme()
</script>
