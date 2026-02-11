import jsPDF from 'jspdf'
import type { Product } from '~~/shared/types'

export function usePrintLabel() {
  function printLabel(product: Product) {
    const unitText = product.unidade || product.units?.name || '-'
    const weightText = product.weight || '-'
    const responsibleText = product.responsible || '-'
    const ingredientsText = product.ingredients ? product.ingredients.toUpperCase() : '-'
    const fabricationText = product.fabrication ? formatDateToBR(product.fabrication) : '-'
    const expirationText = product.expiration ? formatDateToBR(product.expiration) : '-'

    const now = new Date()
    const printDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`
    const printTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    // Page: 70x70mm landscape, margins: 5mm all sides (safe for printer non-printable zone)
    const doc = new jsPDF({ unit: 'mm', format: [70, 70], orientation: 'landscape' })
    const mL = 5, mR = 5, mT = 5
    const xL = mL, xR = 70 - mR, W = 70 - mL - mR, xC = 35
    let y = mT

    const lh = () => doc.getLineHeight() / doc.internal.scaleFactor

    // ── Product Name — 20pt bold ──
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(0)
    const nameLines = doc.splitTextToSize(product.name.toUpperCase(), W)
    doc.text(nameLines, xL, y, { baseline: 'top' })
    y += lh() * nameLines.length + 0.5

    // Bottom border
    doc.setDrawColor(0)
    doc.setLineWidth(0.3)
    doc.line(xL, y, xR, y)
    y += 1.5

    // ── Ingredients — 10pt (bold label + normal text inline) ──
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const ingFull = 'INGREDIENTES: ' + ingredientsText
    const ingLines = doc.splitTextToSize(ingFull, W)
    doc.text(ingLines, xL, y, { baseline: 'top' })
    // Overdraw label in bold on first line
    doc.setFont('helvetica', 'bold')
    doc.text('INGREDIENTES: ', xL, y, { baseline: 'top' })
    y += lh() * ingLines.length + 1.5

    // ── Info Table — headers 9pt, values 12pt bold ──
    const colW = W / 3
    doc.setDrawColor(0)
    doc.setLineWidth(0.2)
    const tableTop = y
    doc.line(xL, tableTop, xR, tableTop)
    y += 0.8

    // Headers
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(0)
    const headers = ['UNIDADE', 'PESO', 'RESP.']
    headers.forEach((h, i) => {
      doc.text(h, xL + colW * i + colW / 2, y, { baseline: 'top', align: 'center' })
    })
    y += lh()

    // Values
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    const values = [unitText, weightText, responsibleText]
    values.forEach((v, i) => {
      doc.text(v, xL + colW * i + colW / 2, y, { baseline: 'top', align: 'center' })
    })
    y += lh() + 0.8

    // Bottom border + vertical dividers
    const tableBottom = y
    doc.setLineWidth(0.2)
    doc.line(xL, tableBottom, xR, tableBottom)
    doc.line(xL + colW, tableTop, xL + colW, tableBottom)
    doc.line(xL + colW * 2, tableTop, xL + colW * 2, tableBottom)
    y += 2

    // ── Dates — labels 9pt, values 18pt bold ──
    const dColW = W / 2

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(0)
    doc.text('FABRICAÇÃO', xL + dColW / 2, y, { baseline: 'top', align: 'center' })
    doc.text('VALIDADE', xL + dColW + dColW / 2, y, { baseline: 'top', align: 'center' })
    y += lh()

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text(fabricationText, xL + dColW / 2, y, { baseline: 'top', align: 'center' })
    doc.text(expirationText, xL + dColW + dColW / 2, y, { baseline: 'top', align: 'center' })
    y += lh() + 1

    // ── Footer — 7pt gray ──
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(136, 136, 136)
    doc.text(`Impresso em ${printDate} às ${printTime}`, xC, y, { baseline: 'top', align: 'center' })

    // ── Open PDF in new tab for printing ──
    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    window.open(pdfUrl)
  }

  return { printLabel }
}
