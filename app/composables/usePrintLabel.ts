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

    const blob = await Packer.toBlob(doc)

    const safeName = product.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `etiqueta-${safeName}.docx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return { printLabel }
}
