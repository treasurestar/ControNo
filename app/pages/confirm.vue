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

    <div class="card text-center py-10 px-8">
      <!-- Animated check icon -->
      <div
        class="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
        style="background: rgba(76, 175, 80, 0.1);"
      >
        <svg class="w-10 h-10" style="color: var(--ok-color);" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <h2 class="text-2xl mb-3 font-bold" style="color: var(--text-primary);">
        Email Confirmado!
      </h2>

      <p class="text-sm mb-2" style="color: var(--text-secondary);">
        Seu email foi verificado com sucesso.
      </p>

      <div
        class="rounded-lg py-4 px-5 my-6 text-left"
        style="background: rgba(139, 115, 85, 0.08); border: 1px solid rgba(139, 115, 85, 0.2);"
      >
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 flex-shrink-0 mt-0.5" style="color: var(--accent-color);" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <div>
            <p class="text-sm font-medium mb-1" style="color: var(--text-primary);">Próximo passo</p>
            <p class="text-[13px]" style="color: var(--text-secondary);">
              Aguarde a aprovação do administrador para acessar o sistema. Você receberá acesso assim que sua conta for aprovada.
            </p>
          </div>
        </div>
      </div>

      <NuxtLink
        to="/login"
        class="btn-primary inline-flex items-center justify-center gap-2 no-underline w-full"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Ir para Login
      </NuxtLink>
    </div>

    <p class="mt-7 text-[13px]" style="color: var(--text-secondary);">Sistema de Controle de Validade</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { theme } = useTheme()
</script>
