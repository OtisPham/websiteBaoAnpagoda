import { FormRecord, TargetPerson, TemplateOptions } from '../types';

/**
 * HTML/CSS generator for Vertical A4 / Dọc A4 (A4 Portrait)
 * Specs:
 * - A4 Portrait layout (180mm x 273mm printable inner frame, outer 210mm x 297mm)
 * - Header: "Phật Giáo Việt Nam • Chùa Báo Ân"
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

      const MAX_ITEMS_PER_PAGE = 30; // 15 rows max

      // Phân bổ dữ liệu thành các trang
      const pagesData: TargetPerson[][] = [];
      for (let i = 0; i < actualTargets.length; i += MAX_ITEMS_PER_PAGE) {
        pagesData.push(actualTargets.slice(i, i + MAX_ITEMS_PER_PAGE));
      }

      if (pagesData.length === 0) {
        pagesData.push([]);
      }

      // Biến đếm thứ tự tổng (Global Numbering)
      let currentGlobalNum = 1;

      // Tạo HTML cho từng trang
      return pagesData.map((pageTargets, pageSubIndex) => {
        const colsPerPage = pageTargets.length <= 15 ? 1 : 2;
        const itemPadding = '2px 0';
        const itemFontSize = '14pt';
        const itemLineHeight = '1.1';
        const columnGap = '16px';

        // Targets Grid Rendering
        let targetsContentHtml = '';
        if (actualTargets.length === 0) {
          targetsContentHtml = `
            <p style="font-size: 14px; font-style: italic; color: #78716c; padding: 16px 0; text-align: center;">
              (Gia chủ cúng dường chung cho gia quyến)
            </p>`;
        } else {
          const gridColsCss = `display: grid; grid-template-columns: repeat(${colsPerPage}, minmax(0, 1fr)); gap: 12px 24px; margin-bottom: 8px; padding-bottom: 8px;`;

          // Tính toán số dòng của trang này
          const numRows = Math.ceil(pageTargets.length / colsPerPage);
          
          // Render item theo dòng để các item trên cùng dòng có chiều cao bằng nhau (nhờ CSS Grid)
          let itemsHtml = '';
          for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < colsPerPage; col++) {
              // Lấy phần tử theo cột, mục đích là cột 1 chứa từ 1 đến N, cột 2 chứa từ N+1 đến 2N
              // Với N là numRows
              const targetIndex = col * numRows + row;
              
              if (targetIndex < pageTargets.length) {
                const t = pageTargets[targetIndex];
                
                // Vì ta thay đổi trật tự render để CSS Grid layout row-by-row, ta cần đánh số chính xác.
                // Tuy nhiên, việc đánh số theo chiều dọc (cột 1 rồi cột 2) yêu cầu số thứ tự = Số đã đánh trước trang này + targetIndex + 1.
                // Tính global index cho phần tử này.
                const pastTargets = pageSubIndex * MAX_ITEMS_PER_PAGE;
                const globalNum = pastTargets + targetIndex + 1;

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

                itemsHtml += `
                  <div style="display: flex; align-items: baseline; justify-content: space-between; border-bottom: 1px solid #e7e5e4; padding: ${itemPadding}; font-size: ${itemFontSize}; line-height: ${itemLineHeight}; height: 100%;">
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
              } else {
                // Ô trống nếu cột không đầy
                itemsHtml += `<div></div>`;
              }
            }
          }

          targetsContentHtml = `<div style="${gridColsCss}">${itemsHtml}</div>`;
        }

        return `
          <div class="so-page-block vertical-page" style="page-break-after: __PAGE_BREAK__; width: 210mm; height: 297mm; max-width: 210mm; max-height: 297mm; margin: 0 auto; padding: 1.27cm; box-sizing: border-box; font-family: 'Times New Roman', Times, serif;">
          <div style="position: relative; width: 100%; height: 100%; border: 2px solid rgba(120, 53, 15, 0.4); border-radius: 12px; padding: 24px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; ${bgStyle}">
            
            <!-- Top Section: Header & Trai Chu Card -->
            <div style="display: flex; flex-direction: column; gap: 16px; flex: 1; overflow: hidden;">
              
              <!-- Header Bar -->
              <div style="border-bottom: 2px solid rgba(120, 53, 15, 0.3); padding-bottom: 12px; flex-shrink: 0; position: relative;">
                
                <!-- Main Title -->
                <div style="text-align: center; width: 100%;">
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

                <!-- Form Code & Time (Moved below and right-aligned) -->
                <div style="text-align: right; font-size: 12px; color: #44403c; font-weight: 500; display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px; align-items: center;">
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
                <h3 style="font-family: 'Times New Roman', serif; font-weight: bold; text-align: center; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #78350f; border-bottom: 1px solid rgba(120, 53, 15, 0.2); padding-bottom: 8px; margin: 0 0 12px 0; flex-shrink: 0;">
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
                  <p style="font-family: 'Times New Roman', serif; font-weight: bold; color: #18181b; font-size: 14px; margin: 0;">Chùa Báo Ân • Khâm Nguyện</p>
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
