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
  PageOrientation,
} from 'docx'
import { writeFileSync } from 'fs'

// Conversions: 1mm = 56.7 twips (1 inch = 1440 twips, 1 inch = 25.4mm)
const mm = (val) => Math.round(val * 56.7)

const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          size: {
            width: mm(68),
            height: mm(68),
            orientation: PageOrientation.LANDSCAPE,
          },
          margin: {
            top: mm(8),
            left: mm(1),
            bottom: mm(3),
            right: mm(3),
          },
        },
      },
      children: [
        // Product Name
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: mm(1) },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
          },
          children: [
            new TextRun({
              text: 'NOME DO PRODUTO',
              bold: true,
              size: 24, // 12pt
              font: 'Arial',
              allCaps: true,
            }),
          ],
        }),

        // Ingredients label
        new Paragraph({
          spacing: { before: mm(0.5), after: 0 },
          children: [
            new TextRun({
              text: 'INGREDIENTES:',
              bold: true,
              size: 14, // 7pt
              font: 'Arial',
              allCaps: true,
            }),
          ],
        }),

        // Ingredients text
        new Paragraph({
          spacing: { after: mm(1) },
          children: [
            new TextRun({
              text: 'INGREDIENTE 1, INGREDIENTE 2, INGREDIENTE 3',
              size: 16, // 8pt
              font: 'Arial',
            }),
          ],
        }),

        // Info row: Unidade | Peso | Resp.
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
          },
          rows: [
            new TableRow({
              children: [
                createInfoCell('UNIDADE', true, '444444', 11),
                createInfoCell('PESO', true, '444444', 11),
                createInfoCell('RESP.', true, '444444', 11),
              ],
            }),
            new TableRow({
              children: [
                createInfoCell('BDN 01', false, '000000', 16, true),
                createInfoCell('500g', false, '000000', 16, true),
                createInfoCell('João', false, '000000', 16, true),
              ],
            }),
          ],
        }),

        // Spacer
        new Paragraph({ spacing: { before: mm(1) }, children: [] }),

        // Dates row: Fabricação | Validade
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
                createInfoCell('FABRICAÇÃO', true, '444444', 12),
                createInfoCell('VALIDADE', true, '444444', 12),
              ],
            }),
            new TableRow({
              children: [
                createInfoCell('09/02/2026', false, '000000', 22, true),
                createInfoCell('14/02/2026', false, '000000', 22, true),
              ],
            }),
          ],
        }),

        // Footer
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: mm(0.5) },
          children: [
            new TextRun({
              text: 'Impresso em 09/02/2026 às 14:00',
              size: 10, // 5pt
              font: 'Arial',
              color: '888888',
            }),
          ],
        }),
      ],
    },
  ],
})

function createInfoCell(text, isLabel, color, fontSize, bold = false) {
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
            bold,
            size: fontSize,
            font: 'Arial',
            color,
            allCaps: isLabel,
          }),
        ],
      }),
    ],
  })
}

const buffer = await Packer.toBuffer(doc)
const outputPath = 'C:\\Users\\Aprendiz TI\\Downloads\\etiqueta-modelo.docx'
writeFileSync(outputPath, buffer)
console.log('Arquivo gerado em: ' + outputPath)
