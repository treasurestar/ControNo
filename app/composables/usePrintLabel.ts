import type { Product } from '~~/shared/types'

export function usePrintLabel() {
  function printLabel(product: Product) {
    const weightText = product.weight || '-'
    const unitText = product.unidade || '-'
    const responsibleText = product.responsible || '-'
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
  size: 68mm 68mm landscape;
  margin: 8mm 3mm 3mm 1mm;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
body {
  font-family: Arial, Helvetica, sans-serif;
  line-height: 1.25;
  max-height: 100%;
  overflow: hidden;
}

.product-name {
  font-size: 18pt;
  font-weight: 800;
  text-transform: uppercase;
  padding-bottom: 1.5mm;
  border-bottom: 0.4mm solid #000;
  margin-bottom: 1.5mm;
  word-wrap: break-word;
}

.ingredients {
  font-size: 11pt;
  line-height: 1.3;
  padding: 1mm 0;
  word-wrap: break-word;
}
.ingredients .lbl {
  font-weight: 700;
  font-size: 9.5pt;
  text-transform: uppercase;
  display: block;
  margin-bottom: 0.5mm;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 2mm;
  padding: 1.5mm 0;
  border-top: 0.3mm solid #000;
  border-bottom: 0.3mm solid #000;
  margin-top: 1.5mm;
}
.info-row .item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  text-align: center;
}
.info-row .item-label {
  font-size: 8pt;
  text-transform: uppercase;
  color: #444;
}
.info-row .item-value {
  font-weight: 700;
  font-size: 11pt;
  margin-top: 0.3mm;
}

.dates {
  display: flex;
  justify-content: space-between;
  padding: 1.5mm 0 0 0;
  gap: 4mm;
}
.date-block {
  flex: 1;
  text-align: center;
}
.date-label {
  font-size: 8.5pt;
  text-transform: uppercase;
  color: #444;
}
.date-value {
  font-size: 15pt;
  font-weight: 800;
}

</style>
</head>
<body>
<div class="product-name">${product.name}</div>
<div class="ingredients">
  <span class="lbl">Ingredientes:</span>
  ${ingredientsText}
</div>
<div class="info-row">
  <div class="item">
    <span class="item-label">Unidade</span>
    <span class="item-value">${unitText}</span>
  </div>
  <div class="item">
    <span class="item-label">Peso</span>
    <span class="item-value">${weightText}</span>
  </div>
  <div class="item">
    <span class="item-label">Resp.</span>
    <span class="item-value">${responsibleText}</span>
  </div>
</div>
<div class="dates">
  <div class="date-block">
    <div class="date-label">Fabricação</div>
    <div class="date-value">${formatDateToBR(product.fabrication)}</div>
  </div>
  <div class="date-block">
    <div class="date-label">Validade</div>
    <div class="date-value">${formatDateToBR(product.expiration)}</div>
  </div>
</div>
</body>
</html>`)
    doc.close()

    iframe.contentWindow?.focus()
    setTimeout(() => {
      iframe.contentWindow?.print()
      setTimeout(() => { document.body.removeChild(iframe) }, 1000)
    }, 250)
  }

  return { printLabel }
}
