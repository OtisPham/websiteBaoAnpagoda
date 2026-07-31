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
    .map((form) => {
      const isCauAn = form.form_type === 'CAU_AN';
      const traiChuTarget = (form.targets || []).find((t) => t.relation === 'TRAI_CHU');
      const traiChuName = traiChuTarget ? traiChuTarget.full_name : form.users?.full_name || 'Gia chủ';
      const traiChuDharma = traiChuTarget?.dharma_name;
      const actualTargets = (form.targets || []).filter((t) => t.relation !== 'TRAI_CHU');

      const bgStyle = templateUrl
        ? `background-image: url('${escapeAttribute(templateUrl)}'); background-size: cover; background-position: center;`
        : 'background: #fdfbf7;';

      // Targets Column Splitting using lineWeight.ts chunkSoColumns
      let targetsContentHtml = '';
      if (actualTargets.length === 0) {
        targetsContentHtml = `
          <p style="font-size: 14px; font-style: italic; color: #78716c; padding: 16px 0; text-align: center;">
            (Gia chủ cúng dường chung cho gia quyến)
          </p>`;
      } else {
        const soColumns = chunkSoColumns([{ ...form, targets: actualTargets }]);

        const gridColsCss = `display: grid; grid-template-columns: repeat(${soColumns.length}, minmax(0, 1fr)); gap: 16px 12px;`;

        const colsHtml = soColumns
          .map((col) => {
            const itemsHtml = col.lines
              .map((line) => {
                if (line.type === 'FORM_CODE' || line.type === 'FORM_CODE_CONTINUED') {
                  return `
                    <div style="font-weight: bold; color: #78350f; font-size: 12px; padding: 4px 0; border-bottom: 1px dashed rgba(120, 53, 15, 0.4); margin-bottom: 4px;">
                      ${escapeHtml(line.text)}
                    </div>`;
                }

                const t = actualTargets.find((item) => item.id === line.personId);
                const personIdx = actualTargets.findIndex((item) => item.id === line.personId);
                const globalNum = personIdx >= 0 ? personIdx + 1 : '';

                if (!t) {
                  return `
                    <div style="display: flex; align-items: baseline; justify-content: space-between; border-bottom: 1px solid #e7e5e4; padding: 4px 0; font-size: 12px;">
                      <span style="font-weight: 600; color: #1c1917;">${escapeHtml(line.text)}</span>
                    </div>`;
                }

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
                  <div style="display: flex; align-items: baseline; justify-content: space-between; border-bottom: 1px solid #e7e5e4; padding: 4px 0; font-size: 16px; line-height: 1.2;">
                    <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 8px;">
                      <span style="font-weight: 600; color: #1c1917;">${globalNum ? `${globalNum}. ` : ''}${escapeHtml(
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
                        ? `<div style="font-size: 14px; color: #57534e; flex-shrink: 0; margin-left: 4px; align-self: center;">${escapeHtml(
                            details.trim()
                          )}</div>`
                        : ''
                    }
                  </div>`;
              })
              .join('');

            return `<div style="display: flex; flex-direction: column; gap: 4px;">${itemsHtml}</div>`;
          })
          .join('');

        targetsContentHtml = `<div style="${gridColsCss}">${colsHtml}</div>`;
      }

      return `
        <div class="so-page-block vertical-page" style="page-break-after: always; width: 210mm; max-width: 210mm; margin: 0 auto; padding: 16px; box-sizing: border-box; font-family: 'Times New Roman', Times, serif;">
          <div style="position: relative; width: 100%; height: 270mm; max-height: 270mm; border: 2px solid rgba(120, 53, 15, 0.4); border-radius: 12px; padding: 24px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; ${bgStyle}">
            
            <!-- Top Section: Header & Trai Chu Card -->
            <div style="display: flex; flex-direction: column; gap: 16px; overflow: hidden;">
              
              <!-- Header Bar -->
              <div style="display: flex; align-items: flex-start; justify-content: center; border-bottom: 2px solid rgba(120, 53, 15, 0.3); padding-bottom: 16px;">
                
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
              <div style="background: rgba(120, 53, 15, 0.05); border: 1px solid rgba(120, 53, 15, 0.2); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px;">
                  <span style="font-family: 'Times New Roman', serif; font-weight: bold; font-size: 25px; line-height: 1.2; color: #451a03;">
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
              <div>
                <h3 style="font-family: 'Times New Roman', serif; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #78350f; border-bottom: 1px solid rgba(120, 53, 15, 0.2); padding-bottom: 8px; margin: 0 0 12px 0;">
                  ${
                    isCauAn
                      ? 'Danh Sách Hương Linh & Phật Tử Cầu An Tiêu Tai'
                      : 'Danh Sách Chư Hương Linh Phục Nguyện Siêu Độ'
                  }
                </h3>
                ${targetsContentHtml}
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
