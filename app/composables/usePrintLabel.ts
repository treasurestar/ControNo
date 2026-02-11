import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
} from 'docx'
import { renderAsync } from 'docx-preview'
import type { Product } from '~~/shared/types'

const mm = (val: number) => Math.round(val * 56.7)

function createInfoCell(
  text: string,
  size: number,
  options: { bold?: boolean; color?: string; allCaps?: boolean } = {},
): TableCell {
  return new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [
          new TextRun({
            text,
            bold: options.bold ?? false,
            size,
            font: 'Arial',
            color: options.color ?? '000000',
            allCaps: options.allCaps ?? false,
          }),
        ],
      }),
    ],
  })
}

export function usePrintLabel() {
  async function printLabel(product: Product) {
    const unitText = product.unidade || product.units?.name || '-'
    const weightText = product.weight || '-'
    const responsibleText = product.responsible || '-'
    const ingredientsText = product.ingredients ? product.ingredients.toUpperCase() : '-'
    const fabricationText = product.fabrication ? formatDateToBR(product.fabrication) : '-'
    const expirationText = product.expiration ? formatDateToBR(product.expiration) : '-'

    const now = new Date()
    const printDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`
    const printTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: { width: mm(70), height: mm(70) },
              margin: {
                top: mm(3),
                left: mm(2),
                bottom: mm(2),
                right: mm(2),
              },
            },
          },
          children: [
            // Product name
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { after: mm(1) },
              border: {
                bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              },
              children: [
                new TextRun({
                  text: product.name.toUpperCase(),
                  bold: true,
                  size: 48,
                  font: 'Arial',
                }),
              ],
            }),

            // Ingredients label + text
            new Paragraph({
              spacing: { before: mm(0.5), after: mm(1) },
              children: [
                new TextRun({
                  text: 'INGREDIENTES: ',
                  bold: true,
                  size: 24,
                  font: 'Arial',
                }),
                new TextRun({
                  text: ingredientsText,
                  size: 24,
                  font: 'Arial',
                }),
              ],
            }),

            // Info table: Unidade | Peso | Resp.
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                insideHorizontal: { style: BorderStyle.NONE },
              },
              rows: [
                new TableRow({
                  children: [
                    createInfoCell('UNIDADE', 20, { allCaps: true }),
                    createInfoCell('PESO', 20, { allCaps: true }),
                    createInfoCell('RESP.', 20, { allCaps: true }),
                  ],
                }),
                new TableRow({
                  children: [
                    createInfoCell(unitText, 28, { bold: true }),
                    createInfoCell(weightText, 28, { bold: true }),
                    createInfoCell(responsibleText, 28, { bold: true }),
                  ],
                }),
              ],
            }),

            // Spacer
            new Paragraph({ spacing: { before: mm(1) }, children: [] }),

            // Dates table: Fabricação | Validade
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
              },
              rows: [
                new TableRow({
                  children: [
                    createInfoCell('FABRICAÇÃO', 20, { allCaps: true }),
                    createInfoCell('VALIDADE', 20, { allCaps: true }),
                  ],
                }),
                new TableRow({
                  children: [
                    createInfoCell(fabricationText, 44, { bold: true }),
                    createInfoCell(expirationText, 44, { bold: true }),
                  ],
                }),
              ],
            }),

            // Footer
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: mm(1) },
              children: [
                new TextRun({
                  text: `Impresso em ${printDate} às ${printTime}`,
                  size: 16,
                  font: 'Arial',
                  color: '888888',
                }),
              ],
            }),
          ],
        },
      ],
    })

    // Generate .docx blob
    const blob = await Packer.toBlob(doc)

    // Open new tab and render the .docx for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Etiqueta - ${product.name}</title>
  <style>
    @page { size: 70mm 70mm; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { display: flex; justify-content: center; padding: 10px; }
    #container { width: 70mm; }
    @media print {
      body { padding: 0; }
      #container { width: 100%; }
    }
  </style>
</head>
<body>
  <div id="container"></div>
</body>
</html>`)
    printWindow.document.close()

    const container = printWindow.document.getElementById('container')!
    await renderAsync(blob, container, undefined, {
      inWrapper: false,
      ignoreWidth: true,
      ignoreHeight: true,
    })
  }

  return { printLabel }
}
