import type { Product } from '~~/shared/types'

// Estado compartilhado (module-level)
const showPrintConfirm = ref(false)
const pendingProduct = ref<Product | null>(null)

export function usePrintLabel() {
  function requestPrint(product: Product) {
    pendingProduct.value = product
    showPrintConfirm.value = true
  }

  function confirmPrint(responsible: string) {
    if (!pendingProduct.value) return
    printLabel(pendingProduct.value, responsible)
    showPrintConfirm.value = false
    pendingProduct.value = null
  }

  function cancelPrint() {
    showPrintConfirm.value = false
    pendingProduct.value = null
  }

  function printLabel(product: Product, responsibleOverride?: string) {
    const unitText = product.unidade || product.units?.name || '-'
    const weightText = product.weight || '-'
    const responsibleText = responsibleOverride || product.responsible || '-'
    const ingredientsText = product.ingredients ? product.ingredients.toUpperCase() : '-'

    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;border:none;'
    document.body.appendChild(iframe)

    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) { document.body.removeChild(iframe); return }

    doc.open()
    doc.write(`<!DOCTYPE html>
<html>
<head>
<style>
@page {
  size: 70mm 70mm portrait;
  margin: 0;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
  margin: 0;
  padding: 0;
  width: 70mm;
  height: 70mm;
  overflow: hidden;
  font-family: Arial, Helvetica, sans-serif;
}

.label {
  width: 70mm;
  height: 70mm;
  padding: 4mm 6mm 3mm 6mm;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.product-name {
  font-size: 14pt;
  font-weight: 900;
  text-transform: uppercase;
  border-bottom: 0.3mm solid #000;
  padding-bottom: 1mm;
  margin-bottom: 1mm;
  word-wrap: break-word;
  line-height: 1.1;
}

.ingredients {
  margin-bottom: 1.5mm;
  line-height: 1.2;
  flex: 1;
  overflow: hidden;
}
.ingredients-label {
  font-size: 8pt;
  font-weight: 700;
  text-transform: uppercase;
}
.ingredients-text {
  font-size: 8pt;
  text-transform: uppercase;
  word-wrap: break-word;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  border-top: 0.3mm solid #000;
  border-bottom: 0.3mm solid #000;
  margin-bottom: 2mm;
}
.info-table th {
  font-size: 6pt;
  font-weight: 700;
  text-transform: uppercase;
  color: #000;
  padding: 0.5mm 0.5mm 0;
  text-align: center;
  border-right: 0.3mm solid #000;
}
.info-table th:last-child {
  border-right: none;
}
.info-table td {
  font-size: 8pt;
  font-weight: 700;
  text-align: center;
  padding: 0.3mm 0.5mm 0.5mm;
  border-right: 0.3mm solid #000;
}
.info-table td:last-child {
  border-right: none;
}

.dates {
  display: flex;
  justify-content: space-around;
  margin-top: 1.5mm;
}
.date-block {
  text-align: center;
}
.date-label {
  font-size: 6pt;
  font-weight: 700;
  text-transform: uppercase;
}
.date-value {
  font-size: 12pt;
  font-weight: 900;
}


</style>
</head>
<body>
<div class="label">
  <div class="product-name">${product.name}</div>
  <div class="ingredients">
    <span class="ingredients-label">Ingredientes: </span>
    <span class="ingredients-text">${ingredientsText}</span>
  </div>
  <table class="info-table">
    <tr>
      <th>Unidade</th>
      <th>Peso</th>
      <th>Resp.</th>
    </tr>
    <tr>
      <td>${unitText}</td>
      <td>${weightText}</td>
      <td>${responsibleText}</td>
    </tr>
  </table>
  <div class="dates">
    <div class="date-block">
      <div class="date-label">Fabricação</div>
      <div class="date-value">${formatDateToBR(product.fabrication)}</div>
    </div>
    <div class="date-block">
      <div class="date-label">Validade</div>
      <div class="date-value">${formatDateToBR(product.expiration)}</div>
    </div>
  </div></div></body></html>`)
    doc.close()

    iframe.contentWindow?.focus()
    setTimeout(() => {
      iframe.contentWindow?.print()
      setTimeout(() => { document.body.removeChild(iframe) }, 1000)
    }, 250)
  }

  return { printLabel, requestPrint, confirmPrint, cancelPrint, showPrintConfirm, pendingProduct }
}
