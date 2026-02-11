<template>
  <div v-if="showPrintConfirm" class="modal-overlay" @click.self="handleCancel">
    <div class="modal-content" style="max-width: 420px;">
      <button
        class="absolute top-4 right-5 bg-transparent border-none text-[28px] cursor-pointer leading-none"
        style="color: var(--text-secondary);"
        @click="handleCancel"
      >
        &times;
      </button>

      <h2 class="mb-1 text-lg font-semibold" style="color: var(--text-primary);">Imprimir Etiqueta</h2>
      <p class="mb-4 text-sm" style="color: var(--text-secondary);">
        Produto: <strong>{{ pendingProduct?.name }}</strong>
      </p>

      <form @submit.prevent="handleConfirm">
        <div class="mb-5">
          <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Responsável</label>
          <input
            ref="inputRef"
            v-model="responsible"
            type="text"
            class="form-input"
            placeholder="Nome do responsável"
            required
          />
        </div>

        <div class="flex gap-3">
          <button type="button" class="btn-secondary flex-1" @click="handleCancel">Cancelar</button>
          <button type="submit" class="btn-primary flex-1">Confirmar e Imprimir</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const { showPrintConfirm, pendingProduct, confirmPrint, cancelPrint } = usePrintLabel()

const responsible = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

watch(showPrintConfirm, (open) => {
  if (open) {
    responsible.value = ''
    nextTick(() => inputRef.value?.focus())
  }
})

function handleConfirm() {
  if (!responsible.value.trim()) return
  confirmPrint(responsible.value.trim())
}

function handleCancel() {
  cancelPrint()
}
</script>
