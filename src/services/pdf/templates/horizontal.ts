import { FormRecord, TemplateOptions } from '../types';
import { chunkHorizontalColumns, HorizontalPage } from '../lineWeight';

/**
 * HTML/CSS generator for Horizontal / Ngang dán chánh điện (A4 Landscape)
 * Specs:
 * - A4 Landscape layout (297mm x 210mm)
 * - Up to 4 vertical columns per sheet
 * - 64px bold form code shortCode (e.g. "001")
 * - Target names listed vertically in bold uppercase
 * - Dashed borders with ✂ scissors marks at corners
 */
export function generateHorizontalTemplate(
  forms: FormRecord | FormRecord[],
  options?: TemplateOptions
): string {
  const formList = Array.isArray(forms) ? forms : [forms];
  const pages: HorizontalPage[] = chunkHorizontalColumns(formList);

  if (pages.length === 0) {
    return `<div class="empty-state" style="text-align: center; padding: 40px; font-family: 'Times New Roman', serif;">Không có dữ liệu phiếu sớ để in.</div>`;
  }

  const pageBlocksHtml = pages
    .map((page, pageIdx) => {
      const colsHtml = page.columns
        .map((col, colIdx) => {
          const isLastCol = colIdx === page.columns.length - 1;
          const borderStyle = `border-top: 2px dashed #a8a29e; border-bottom: 2px dashed #a8a29e; border-left: 2px dashed #a8a29e; ${
            isLastCol ? 'border-right: 2px dashed #a8a29e;' : ''
          }`;

          const namesHtml = col.names
            .map(
              (name) =>
                `<div style="font-size: 20px; font-weight: bold; text-align: center; color: #000000; text-transform: uppercase; line-height: 1.25;">${escapeHtml(
                  name
                )}</div>`
            )
            .join('');

          return `
            <div class="horizontal-col" style="flex: 1; max-width: 265px; padding: 24px 20px; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: space-between; ${borderStyle}">
              <!-- Scissors Cut Indicators -->
              <span style="position: absolute; top: -14px; left: -10px; font-size: 12px; color: #78716c; user-select: none;">✂</span>
              <span style="position: absolute; bottom: -14px; left: -10px; font-size: 12px; color: #78716c; user-select: none; transform: rotate(180deg);">✂</span>
              ${
                isLastCol
                  ? `
              <span style="position: absolute; top: -14px; right: -10px; font-size: 12px; color: #78716c; user-select: none;">✂</span>
              <span style="position: absolute; bottom: -14px; right: -10px; font-size: 12px; color: #78716c; user-select: none; transform: rotate(180deg);">✂</span>
              `
                  : ''
              }

              <!-- Short Form Code Number Header (72px bold) -->
              <div style="font-size: 72px; font-weight: bold; line-height: 1; margin-bottom: 4px; color: #000000; text-align: center; letter-spacing: -0.05em;">
                ${escapeHtml(col.shortCode)}
              </div>

              <!-- Names List -->
              <div style="display: flex; flex-direction: column; gap: 4px; width: 100%; margin: auto 0;">
                ${namesHtml}
              </div>
            </div>
          `;
        })
        .join('');

      return `
        <div class="so-page-block horizontal-page" style="page-break-after: always; width: 297mm; height: 210mm; max-width: 297mm; max-height: 210mm; margin: 0 auto; padding: 8px; background: #ffffff; color: #000000; display: flex; justify-content: center; overflow: hidden; box-sizing: border-box;">
          ${colsHtml}
        </div>
      `;
    })
    .join('');

  return pageBlocksHtml;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
