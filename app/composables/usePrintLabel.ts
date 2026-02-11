import type { Product } from '~~/shared/types'

export function usePrintLabel() {
  function printLabel(product: Product) {
    const unitText = product.unidade || product.units?.name || '-'
    const weightText = product.weight || '-'
    const responsibleText = product.responsible || '-'
    const ingredientsText = product.ingredients ? product.ingredients.toUpperCase() : '-'

    const now = new Date()
    const printDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
    const printTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

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
  size: 70mm 70mm;
  margin: 3mm;
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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 2mm;
}

.product-name {
  font-size: 16pt;
  font-weight: 900;
  text-transform: uppercase;
  border-bottom: 0.5mm solid #000;
  padding-bottom: 1.5mm;
  margin-bottom: 1mm;
  word-wrap: break-word;
  line-height: 1.1;
}

.ingredients {
  margin-bottom: 1.5mm;
  line-height: 1.25;
}
.ingredients-label {
  font-size: 9pt;
  font-weight: 700;
  text-transform: uppercase;
}
.ingredients-text {
  font-size: 9pt;
  text-transform: uppercase;
  word-wrap: break-word;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  border-top: 0.4mm solid #000;
  border-bottom: 0.4mm solid #000;
  margin-bottom: 2mm;
}
.info-table th {
  font-size: 7.5pt;
  font-weight: 700;
  text-transform: uppercase;
  color: #000;
  padding: 0.8mm 1mm 0;
  text-align: center;
  border-right: 0.3mm solid #000;
}
.info-table th:last-child {
  border-right: none;
}
.info-table td {
  font-size: 11pt;
  font-weight: 700;
  text-align: center;
  padding: 0 1mm 1mm;
  border-right: 0.3mm solid #000;
}
.info-table td:last-child {
  border-right: none;
}

.dates {
  display: flex;
  justify-content: space-between;
  gap: 4mm;
  flex: 1;
}
.date-block {
  flex: 1;
  text-align: center;
}
.date-label {
  font-size: 8pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3mm;
}
.date-value {
  font-size: 15pt;
  font-weight: 900;
}

.footer {
  text-align: center;
  font-size: 6.5pt;
  color: #333;
  margin-top: auto;
  padding-top: 1mm;
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
  </div>
  <div class="footer">Impresso em ${printDate} às ${printTime}</div>
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
