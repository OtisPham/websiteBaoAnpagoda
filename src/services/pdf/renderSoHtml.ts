import { FormRecord, TemplateOptions, PrintMode } from './types';
import { generateHorizontalTemplate } from './templates/horizontal';
import { generateVerticalA4Template } from './templates/verticalA4';
import { generatePhungViToaViTemplate } from './templates/phungViToaVi';

/**
 * Main entry function for temple form HTML rendering.
 * Selects template generator based on printMode and returns complete standalone HTML string.
 */
export function renderSoHtml(
  data: FormRecord | FormRecord[],
  options?: TemplateOptions
): string {
  const mode: PrintMode = options?.printMode || 'VERTICAL_A4';
  let bodyHtml = '';

  switch (mode) {
    case 'HORIZONTAL_CHANH_DIEN':
      bodyHtml = generateHorizontalTemplate(data, options);
      break;
    case 'PHUNG_VI_TOA_VI':
      bodyHtml = generatePhungViToaViTemplate(data, options);
      break;
    case 'VERTICAL_A4':
    default:
      bodyHtml = generateVerticalA4Template(data, options);
      break;
  }

  const isLandscape = mode === 'HORIZONTAL_CHANH_DIEN' || mode === 'PHUNG_VI_TOA_VI';
  const pageMargin = isLandscape ? '10mm' : '12mm 15mm';
  const pageSize = isLandscape ? 'A4 landscape' : 'A4 portrait';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Chùa Báo Ân - In Sớ</title>
  <style>
    @page {
      size: ${pageSize};
      margin: ${pageMargin};
    }
    
    * {
      box-sizing: border-box;
      font-family: "Times New Roman", Times, serif !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    html, body {
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      color: #000000;
      font-size: 14px;
      line-height: 1.4;
    }

    .so-page-block {
      page-break-after: always;
      break-after: page;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .empty-state {
      font-family: "Times New Roman", Times, serif;
      text-align: center;
      padding: 40px;
      color: #78716c;
      font-size: 16px;
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
        background: none;
      }
      .so-page-block {
        box-shadow: none !important;
        border: none !important;
      }
    }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}
