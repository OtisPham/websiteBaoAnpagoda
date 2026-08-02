import { FormRecord, TemplateOptions } from '../types';
import { chunkHorizontalColumns, HorizontalPage } from '../lineWeight';

/**
 * HTML/CSS generator for Phụng Vì - Tọa Vị (A4 Landscape)
 * Specs:
 * - A4 Landscape layout (297mm x 210mm)
 * - 4 vertical spirit-tablet columns per sheet
 * - Top header: Title "PHỤNG VÌ"
 * - Middle: Target names in bold uppercase serif
 * - Bottom footer: Title "TỌA VỊ"
 * - STRICT REQUIREMENT: Strictly omit all form code numbers and column numbers.
 */
export function generatePhungViToaViTemplate(
  forms: FormRecord | FormRecord[],
  options?: TemplateOptions
): string {
  const formList = Array.isArray(forms) ? forms : [forms];
  // Tối đa 15 tên (dòng) mỗi cột, 4 cột 1 trang
  const pages: HorizontalPage[] = chunkHorizontalColumns(formList, 15, 4);

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
                `<div style="font-size: 14pt; font-family: 'Times New Roman', serif; font-weight: bold; text-align: center; color: #1c1917; text-transform: uppercase; margin: 0; padding: 0; line-height: 1.2;">${escapeHtml(
                  name
                )}</div>`
            )
            .join('');

          return `
            <td class="phungvi-col" style="width: 6.5cm; max-width: 6.5cm; padding: 16px; position: relative; border: 2px dashed #a8a29e; border-right-width: ${isLastCol ? '2px' : '0px'}; height: 16cm; vertical-align: top;">
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

              <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start; height: 100%; width: 100%; padding-bottom: 50px; position: relative;">
                
                <!-- Phung Vi Header -->
                <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 12pt; text-align: center; width: 100%; flex-shrink: 0;">
                  <div style="font-size: 24pt; font-family: 'Times New Roman', serif; font-weight: bold; color: #451a03; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 2px solid rgba(120, 53, 15, 0.4); padding-bottom: 8px; width: 100%;">
                    PHỤNG VÌ
                  </div>
                </div>

                <!-- Names List -->
                <div style="display: flex; flex-direction: column; justify-content: flex-start; width: 100%; text-align: center;">
                  ${namesHtml}
                </div>

                <!-- Toa Vi Footer -->
                <div style="position: absolute; bottom: 8px; left: 8px; right: 8px; padding-top: 4px; border-top: 2px solid rgba(120, 53, 15, 0.4); text-align: center;">
                  <div style="font-size: 18pt; font-family: 'Times New Roman', serif; font-weight: bold; color: #431407; text-transform: uppercase; letter-spacing: 0.1em;">
                    TỌA VỊ
                  </div>
                </div>
              </div>
            </td>
          `;
        })
        .join('');

      return `
        <div class="so-page-block horizontal-page" style="page-break-after: always; width: 297mm; height: 210mm; max-width: 297mm; max-height: 210mm; margin: 0 auto; padding: 8px; background: #ffffff; color: #000000; display: flex; align-items: center; justify-content: center; overflow: hidden; box-sizing: border-box;">
          <table style="width: max-content; margin: 0 auto; border-collapse: collapse; table-layout: fixed; height: 16cm;">
            <tbody>
              <tr>
                ${colsHtml}
              </tr>
            </tbody>
          </table>
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
