import { FormRecord, TemplateOptions } from '../types';
import { chunkHorizontalColumns, HorizontalPage } from '../lineWeight';

/**
 * HTML/CSS generator for Phụng Vì - Tọa Vị (A4 Landscape)
 * Specs:
 * - A4 Landscape layout (297mm x 210mm)
 * - 4 vertical spirit-tablet columns per sheet
 * - Top header: Sub-header "Nam Mô Tiếp Dẫn Đạo Sư A Di Đà Phật" + Title "PHỤNG VÌ"
 * - Middle: Target names in bold uppercase serif
 * - Bottom footer: Title "TỌA VỊ" + Subtitle "Chùa Báo Ân • Linh Vị"
 * - STRICT REQUIREMENT: Strictly omit all form code numbers and column numbers.
 */
export function generatePhungViToaViTemplate(
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
                `<div style="font-size: 20px; font-weight: bold; font-family: 'Times New Roman', Times, serif; text-align: center; color: #1c1917; text-transform: uppercase; line-height: 1.375;">${escapeHtml(
                  name
                )}</div>`
            )
            .join('');

          return `
            <div class="phung-vi-col" style="flex: 1; max-width: 265px; padding: 24px 20px; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: space-between; ${borderStyle}">
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

              <!-- Top Section: PHỤNG VÌ (NO Form Code) -->
              <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 24px; text-align: center; width: 100%;">
                <div style="font-size: 11px; font-family: 'Times New Roman', Times, serif; font-style: italic; color: #78716c; margin-bottom: 4px;">
                  Nam Mô Tiếp Dẫn Đạo Sư A Di Đà Phật
                </div>
                <div style="font-size: 28px; font-family: 'Times New Roman', Times, serif; font-weight: bold; color: #451a03; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 2px solid rgba(120, 53, 15, 0.4); padding-bottom: 8px; width: 100%;">
                  PHỤNG VÌ
                </div>
              </div>

              <!-- Center Section: Target Names -->
              <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 16px; margin: auto 0; width: 100%; padding: 8px 0;">
                ${namesHtml}
              </div>

              <!-- Bottom Section: TỌA VỊ -->
              <div style="margin-top: auto; padding-top: 16px; border-top: 2px solid rgba(120, 53, 15, 0.4); width: 100%; text-align: center;">
                <div style="font-size: 24px; font-family: 'Times New Roman', Times, serif; font-weight: bold; color: #451a03; text-transform: uppercase; letter-spacing: 0.1em;">
                  TỌA VỊ
                </div>
                <span style="font-size: 10px; font-style: italic; color: #78716c; margin-top: 4px; display: block;">
                  Chùa Báo Ân • Linh Vị
                </span>
              </div>
            </div>
          `;
        })
        .join('');

      return `
        <div class="so-page-block phung-vi-page" style="page-break-after: always; width: 277mm; height: 190mm; max-width: 277mm; max-height: 190mm; margin: 0 auto; padding: 16px; background: #ffffff; color: #000000; display: flex; justify-content: center; overflow: hidden; box-sizing: border-box;">
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
