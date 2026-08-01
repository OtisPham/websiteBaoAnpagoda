import { FormRecord, TargetPerson, TemplateOptions } from '../types';
import { chunkSoColumns } from '../lineWeight';

/**
 * HTML/CSS generator for Vertical A4 / Dọc A4 (A4 Portrait)
 * Specs:
 * - A4 Portrait layout (180mm x 273mm printable inner frame, outer 210mm x 297mm)
 * - Header: "Phật Giáo Việt Nam • Bổn Tự Chùa Báo Ân"
 * - Titles: "Sớ Phục Nguyện Cầu An" / "Sớ Phục Nguyện Cầu Siêu"
 * - Invocations: Dược Sư (Cầu An) / A Di Đà (Cầu Siêu)
 * - Seal: Red double-border square "Báo Ân Cổ Tự Pháp Ấn"
 * - Gia chủ / Trai chủ info card
 * - Dynamic target list auto-split into 1-4 columns
 * - Tailored wish prayer texts and signatures
 */
export function generateVerticalA4Template(
  forms: FormRecord | FormRecord[],
  options?: TemplateOptions
): string {
  const formList = Array.isArray(forms) ? forms : [forms];
  const templateUrl = options?.templateUrl;

  if (formList.length === 0) {
    return `<div class="empty-state" style="text-align: center; padding: 40px; font-family: 'Times New Roman', serif;">Không có dữ liệu phiếu sớ để in.</div>`;
  }

  return formList
    .map((form, index) => {
      const isCauAn = form.form_type === 'CAU_AN';
      const traiChuTarget = (form.targets || []).find((t) => t.relation === 'TRAI_CHU');
      const traiChuName = traiChuTarget ? traiChuTarget.full_name : form.users?.full_name || 'Gia chủ';
      const traiChuDharma = traiChuTarget?.dharma_name;
      const actualTargets = (form.targets || []).filter((t) => t.relation !== 'TRAI_CHU');

      const bgStyle = templateUrl
        ? `background-image: url('${escapeAttribute(templateUrl)}'); background-size: cover; background-position: center;`
        : 'background: #fdfbf7;';

      const MAX_LINES_PER_COL = 20;
      const MAX_LINES_PER_PAGE = MAX_LINES_PER_COL * 2;

      // Bước 1: Tính toán số dòng cho mỗi mục
      const targetsWithLines = actualTargets.map((t) => {
        const name = (t.full_name || '').trim();
        const wordCount = name ? name.split(/\s+/).length : 0;
        const linesNeeded = wordCount >= 4 ? 2 : 1;
        return { target: t, lines: linesNeeded };
      });

      // Bước 2: Chia mục tiêu thành các trang (tối đa 38 dòng/trang)
      const pagesData: { target: TargetPerson; lines: number }[][] = [];
      let currentPageData: { target: TargetPerson; lines: number }[] = [];
      let currentPageLines = 0;

      for (const item of targetsWithLines) {
        if (currentPageLines + item.lines > MAX_LINES_PER_PAGE && currentPageData.length > 0) {
          pagesData.push(currentPageData);
          currentPageData = [];
          currentPageLines = 0;
        }
        currentPageData.push(item);
        currentPageLines += item.lines;
      }
      if (currentPageData.length > 0) {
        pagesData.push(currentPageData);
      }
      if (pagesData.length === 0) {
        pagesData.push([]); // Đảm bảo luôn có ít nhất 1 trang
      }

      // Bước 3: Tạo HTML cho từng trang
      return pagesData.map((pageTargets, pageSubIndex) => {
        // Cân bằng hai cột (Two-column Balance Algorithm) cho trang hiện tại
        const chunks: TargetPerson[][] = [[], []];
        let leftColLines = 0;
        let rightColLines = 0;

        const halfItems = Math.ceil(pageTargets.length / 2);

        pageTargets.forEach((item, idx) => {
          if (idx < halfItems) {
            chunks[0].push(item.target);
            leftColLines += item.lines;
          } else {
            chunks[1].push(item.target);
            rightColLines += item.lines;
          }
        });

        // Bỏ cột 2 nếu không có dữ liệu
        if (chunks[1].length === 0) {
          chunks.pop();
        }

        // Tự động điều chỉnh khoảng cách nếu cần (dù đã giới hạn 19 dòng/cột)
        const maxLinesInCol = Math.max(leftColLines, rightColLines);
        let itemPadding = '4px 0';
        let itemFontSize = '12pt';
        let itemLineHeight = '1.2';
        let columnGap = '4px';

        if (maxLinesInCol >= 20) {
          // Fallback an toàn (thực tế maxLinesInCol <= 20 do logic chia trang)
          itemPadding = '3px 0';
          itemFontSize = '11.5pt';
          itemLineHeight = '1.2';
        }

        let currentGlobalNum = 1 + (pagesData.slice(0, pageSubIndex).reduce((sum, p) => sum + p.length, 0));

        // Targets Column Splitting
      let targetsContentHtml = '';
      if (actualTargets.length === 0) {
        targetsContentHtml = `
          <p style="font-size: 14px; font-style: italic; color: #78716c; padding: 16px 0; text-align: center;">
            (Gia chủ cúng dường chung cho gia quyến)
          </p>`;
      } else {
        // Điều chỉnh margin/padding để không sát viền dưới
        const gridColsCss = `display: grid; grid-template-columns: repeat(${chunks.length}, minmax(0, 1fr)); gap: 16px 24px; margin-bottom: 8px; padding-bottom: 8px;`;

        const colsHtml = chunks
          .map((colItems) => {
            const itemsHtml = colItems
              .map((t) => {
                const globalNum = currentGlobalNum++;

                let details = '';
                if (!isCauAn) {
                  if (t.birth_year || t.death_year) {
                    details = `${t.birth_year ? `SN: ${t.birth_year}` : ''} ${
                      t.death_year ? `MT: ${t.death_year}` : ''
                    }`;
                  }
                } else {
                  details = `${t.birth_year ? `SN: ${t.birth_year}` : ''} ${
                    t.relation ? `• ${t.relation}` : ''
                  }`;
                }

                return `
                  <div style="display: flex; align-items: baseline; justify-content: space-between; border-bottom: 1px solid #e7e5e4; padding: ${itemPadding}; font-size: ${itemFontSize}; line-height: ${itemLineHeight};">
                    <div style="padding-right: 8px; word-break: break-word; max-width: 75%;">
                      <span style="font-weight: 600; color: #1c1917;">${globalNum}. ${escapeHtml(
                  t.full_name
                )}</span>
                      ${
                        t.dharma_name
                          ? `<span style="color: #78350f; margin-left: 4px; font-weight: 500;">(PD: ${escapeHtml(
                              t.dharma_name
                            )})</span>`
                          : ''
                      }
                    </div>
                    ${
                      details
                        ? `<div style="font-size: 0.9em; color: #57534e; flex-shrink: 0; margin-left: 4px; align-self: center;">${escapeHtml(
                            details.trim()
                          )}</div>`
                        : ''
                    }
                  </div>`;
              })
              .join('');

            return `<div style="display: flex; flex-direction: column; gap: ${columnGap};">${itemsHtml}</div>`;
          })
          .join('');

        targetsContentHtml = `<div style="${gridColsCss}">${colsHtml}</div>`;
      }

        return `
          <div class="so-page-block vertical-page" style="page-break-after: __PAGE_BREAK__; width: 210mm; height: 297mm; max-width: 210mm; max-height: 297mm; margin: 0 auto; padding: 1.27cm; box-sizing: border-box; font-family: 'Times New Roman', Times, serif;">
          <div style="position: relative; width: 100%; height: 100%; border: 2px solid rgba(120, 53, 15, 0.4); border-radius: 12px; padding: 24px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; ${bgStyle}">
            
            <!-- Top Section: Header & Trai Chu Card -->
            <div style="display: flex; flex-direction: column; gap: 16px; flex: 1; overflow: hidden;">
              
              <!-- Header Bar -->
              <div style="display: flex; align-items: flex-start; justify-content: center; border-bottom: 2px solid rgba(120, 53, 15, 0.3); padding-bottom: 16px; flex-shrink: 0;">
                
                <!-- Main Title -->
                <div style="text-align: center; flex: 1; padding: 0 16px;">
                  <p style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #78716c; margin: 0 0 2px 0;">
                    Giáo Hội Phật Giáo Việt Nam
                  </p>
                  <p style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #78716c; margin: 0 0 4px 0;">
                    Chùa Báo Ân
                  </p>
                  <h2 style="font-family: 'Times New Roman', serif; font-size: 30px; font-weight: bold; color: #451a03; letter-spacing: 0.025em; text-transform: uppercase; margin: 0;">
                    ${isCauAn ? 'Sớ Cầu An' : 'Sớ Cầu Siêu'}
                  </h2>
                  <p style="font-family: 'Times New Roman', serif; font-style: italic; font-size: 14px; color: #92400e; margin: 4px 0 0 0;">
                    ${
                      isCauAn
                        ? 'Nam Mô Tiêu Tai Diên Thọ Dược Sư Lưu Ly Quang Vương Phật'
                        : 'Nam Mô Tiếp Dẫn Đạo Sư A Di Đà Phật'
                    }
                  </p>
                </div>

                <!-- Form Code & Time -->
                <div style="text-align: right; font-size: 12px; color: #44403c; font-weight: 500; display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: inline-block; background: rgba(120, 53, 15, 0.1); color: #451a03; font-weight: bold; padding: 4px 10px; border-radius: 4px;">
                    Mã: ${escapeHtml(form.form_code)}
                  </div>
                  <div>Ngày: ${escapeHtml(form.scheduled_date || 'Hôm nay')}</div>
                  <div>Giờ: ${
                    form.is_delegated
                      ? 'Chùa xếp'
                      : escapeHtml(form.selected_time_slot || 'Mặc định')
                  }</div>
                </div>
              </div>

              <!-- Trai Chu Card -->
              <div style="background: rgba(120, 53, 15, 0.05); border: 1px solid rgba(120, 53, 15, 0.2); border-radius: 8px; padding: 8px; display: flex; flex-direction: column; gap: 4px; flex-shrink: 0;">
                <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px;">
                  <span style="font-family: 'Times New Roman', serif; font-weight: bold; font-size: 14pt; line-height: 1.2; color: #451a03;">
                    Trai Chủ / Gia Chủ: <span style="color: #78350f;">${escapeHtml(
                      traiChuName
                    )}</span>
                    ${
                      traiChuDharma
                        ? ` (Pháp danh: ${escapeHtml(traiChuDharma)})`
                        : ''
                    }
                  </span>
                  <span style="font-size: 12px; color: #57534e;">
                    ${escapeHtml(form.users?.phone || '')}
                  </span>
                </div>
                ${
                  form.note
                    ? `<p style="font-size: 12px; color: #44403c; font-style: italic; margin: 0;">Lời khấn / Ghi chú: &ldquo;${escapeHtml(
                        form.note
                      )}&rdquo;</p>`
                    : ''
                }
              </div>

              <!-- Target List Section -->
              <div style="display: flex; flex-direction: column; flex: 1; overflow: hidden;">
                <h3 style="font-family: 'Times New Roman', serif; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #78350f; border-bottom: 1px solid rgba(120, 53, 15, 0.2); padding-bottom: 8px; margin: 0 0 12px 0; flex-shrink: 0;">
                  ${
                    isCauAn
                      ? 'Danh Sách Hương Linh & Phật Tử Cầu An Tiêu Tai'
                      : 'Danh Sách Chư Hương Linh Phục Nguyện Siêu Độ'
                  }
                </h3>
                <div style="flex: 1; overflow: visible;">
                  ${targetsContentHtml}
                </div>
              </div>
            </div>

            <!-- Bottom Section: Prayers & Signatures -->
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(120, 53, 15, 0.2); display: flex; flex-direction: column; gap: 8px; flex-shrink: 0;">
              <p style="font-family: 'Times New Roman', serif; font-style: italic; text-align: center; font-size: 12px; color: #44403c; line-height: 1.4; padding: 0 16px; margin: 0;">
                ${
                  isCauAn
                    ? 'Đệ tử chúng đẳng thành tâm khấu bái, nguyện cầu Tam Bảo chứng minh, gia quyến khang ninh khương thái cát tường, sở cầu như ý, sở nguyện tòng tâm.'
                    : 'Đệ tử chúng đẳng thành tâm khấu bái, nguyện cầu Tiếp Dẫn Đạo Sư A Di Đà Phật phóng quang tiếp độ chư hương linh trút bỏ trần duyên, siêu sinh tịnh độ.'
                }
              </p>

              <div style="display: flex; justify-content: space-between; align-items: flex-end; text-align: center; font-size: 12px; color: #52525b; padding-top: 4px;">
                <div>
                  <p style="font-weight: 600; color: #27272a; margin: 0;">Trai Chủ Khấn Nguyện</p>
                  <p style="margin: 16px 0 0 0; font-style: italic; color: #71717a;">(Đã đăng ký trực tuyến)</p>
                </div>
                <div>
                  <p style="font-family: 'Times New Roman', serif; font-weight: bold; color: #18181b; font-size: 14px; margin: 0;">Chùa Báo Ân • Bổn Tự Khâm Nguyện</p>
                  <p style="margin: 16px 0 0 0; font-weight: 600; color: #78350f;">Khám Ấn Duyệt Sớ</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      `;
      });
    })
    .flat()
    .map((html, idx, arr) => {
      return html.replace('__PAGE_BREAK__', idx === arr.length - 1 ? 'auto' : 'always');
    })
    .join('');
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

function escapeAttribute(str: string): string {
  if (!str) return '';
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
