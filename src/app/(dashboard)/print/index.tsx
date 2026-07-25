import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Printer,
  Share2,
  FileDown,
  Edit3,
  Plus,
  Trash2,
  Eye,
  Settings2,
  CheckCircle2,
  RefreshCw,
  FileText,
} from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// ==========================================
// 1. TYPES & DATA STRUCTURES
// ==========================================
export type FormType = 'CAU_AN' | 'CAU_SIEU';
export type PrintMode = 'HORIZONTAL_CHANH_DIEN' | 'VERTICAL_A4' | 'PHUNG_VI_TOA_VI';

export interface TargetPerson {
  id: string;
  full_name: string;
  dharma_name?: string | null;
  birth_year?: number | null;
  death_year?: number | null;
  relation?: string | null;
  type: FormType;
}

export interface FormRecord {
  id: string;
  form_code: string;
  form_type: FormType;
  status: string;
  is_delegated: boolean;
  scheduled_date: string;
  selected_time_slot?: string | null;
  note?: string | null;
  created_at?: string;
  users?: { full_name: string; phone: string } | null;
  targets: TargetPerson[];
}

export interface TemplateOptions {
  templateUrl?: string | null;
  printMode?: PrintMode;
  templeName?: string;
}

// ==========================================
// 2. LINE WEIGHT ALGORITHM & TEMPLATE GENERATORS
// ==========================================
const MAX_LINES_PER_COL_VERTICAL = 28;
const MAX_LINES_PER_COL_HORIZONTAL = 13;
const MAX_COLS_PER_PAGE_HORIZONTAL = 4;

const FORM_CODE_WEIGHT = 4;
const SHORT_NAME_WEIGHT = 1;
const LONG_NAME_WEIGHT = 2;

export function calculateNameWeight(
  fullName: string,
  dharmaName?: string | null,
  birthYear?: number | null
): number {
  const name = (fullName || '').trim();
  const wordCount = name ? name.split(/\s+/).length : 0;
  const isLong = name.length >= 15 || wordCount >= 5 || !!dharmaName || !!birthYear;
  return isLong ? LONG_NAME_WEIGHT : SHORT_NAME_WEIGHT;
}

export interface SoLine {
  type: 'FORM_CODE' | 'FORM_CODE_CONTINUED' | 'PERSON';
  text: string;
  linesUsed: number;
  formCode: string;
  personId?: string;
  dharmaName?: string | null;
}

export interface SoColumn {
  lines: SoLine[];
  totalLines: number;
}

export function chunkSoColumns(
  forms: FormRecord[],
  maxLinesPerCol: number = MAX_LINES_PER_COL_VERTICAL
): SoColumn[] {
  const columns: SoColumn[] = [];
  let currentColumn: SoColumn = { lines: [], totalLines: 0 };

  const addLineToColumn = (line: SoLine) => {
    currentColumn.lines.push(line);
    currentColumn.totalLines += line.linesUsed;
  };

  const startNewColumn = () => {
    if (currentColumn.lines.length > 0) {
      columns.push(currentColumn);
    }
    currentColumn = { lines: [], totalLines: 0 };
  };

  for (const form of forms) {
    if (currentColumn.totalLines + FORM_CODE_WEIGHT > maxLinesPerCol) {
      startNewColumn();
    }

    addLineToColumn({
      type: 'FORM_CODE',
      text: form.form_code,
      linesUsed: FORM_CODE_WEIGHT,
      formCode: form.form_code,
    });

    const targets = form.targets || [];
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      const weight = calculateNameWeight(target.full_name, target.dharma_name, target.birth_year);

      if (currentColumn.totalLines + weight > maxLinesPerCol) {
        startNewColumn();

        addLineToColumn({
          type: 'FORM_CODE_CONTINUED',
          text: `${form.form_code} (Tiếp)`,
          linesUsed: FORM_CODE_WEIGHT,
          formCode: form.form_code,
        });
      }

      let text = target.full_name;
      if (target.dharma_name) {
        text += ` (PD: ${target.dharma_name})`;
      }
      if (target.birth_year) {
        text += ` - SN: ${target.birth_year}`;
      }

      addLineToColumn({
        type: 'PERSON',
        text,
        linesUsed: weight,
        formCode: form.form_code,
        personId: target.id,
        dharmaName: target.dharma_name,
      });
    }
  }

  if (currentColumn.lines.length > 0) {
    columns.push(currentColumn);
  }

  return columns;
}

export interface HorizontalColumn {
  shortCode: string;
  formCode: string;
  names: string[];
}

export interface HorizontalPage {
  columns: HorizontalColumn[];
}

export function chunkHorizontalColumns(
  forms: FormRecord[],
  maxLinesPerCol: number = MAX_LINES_PER_COL_HORIZONTAL,
  maxColsPerPage: number = MAX_COLS_PER_PAGE_HORIZONTAL
): HorizontalPage[] {
  const allColumns: HorizontalColumn[] = [];

  for (const form of forms) {
    const shortCode = form.form_code ? form.form_code.slice(-3) : '';
    const actualTargets = (form.targets || []).filter((t) => t.relation !== 'TRAI_CHU');

    let currentColNames: string[] = [];
    let currentLines = 0;

    for (const t of actualTargets) {
      const name = (t.full_name || '').trim();
      const wordCount = name ? name.split(/\s+/).length : 0;
      const linesNeeded = wordCount >= 5 || name.length >= 15 ? LONG_NAME_WEIGHT : SHORT_NAME_WEIGHT;

      if (currentLines + linesNeeded > maxLinesPerCol && currentColNames.length > 0) {
        allColumns.push({
          shortCode,
          formCode: form.form_code,
          names: currentColNames,
        });
        currentColNames = [];
        currentLines = 0;
      }

      currentColNames.push(name);
      currentLines += linesNeeded;
    }

    if (currentColNames.length > 0) {
      allColumns.push({
        shortCode,
        formCode: form.form_code,
        names: currentColNames,
      });
    }
  }

  const pages: HorizontalPage[] = [];
  for (let i = 0; i < allColumns.length; i += maxColsPerPage) {
    pages.push({
      columns: allColumns.slice(i, i + maxColsPerPage),
    });
  }

  return pages;
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

export function generateHorizontalTemplate(
  forms: FormRecord | FormRecord[],
  options?: TemplateOptions
): string {
  const formList = Array.isArray(forms) ? forms : [forms];
  const pages: HorizontalPage[] = chunkHorizontalColumns(formList);

  if (pages.length === 0) {
    return `<div class="empty-state" style="text-align: center; padding: 40px; font-family: 'Times New Roman', serif;">Không có dữ liệu phiếu sớ để in.</div>`;
  }

  return pages
    .map((page) => {
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

              <div style="font-size: 64px; font-weight: bold; line-height: 1; margin-bottom: 24px; color: #000000; text-align: center; letter-spacing: -0.05em;">
                ${escapeHtml(col.shortCode)}
              </div>

              <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; margin: auto 0;">
                ${namesHtml}
              </div>
            </div>
          `;
        })
        .join('');

      return `
        <div class="so-page-block horizontal-page" style="page-break-after: always; width: 277mm; height: 190mm; max-width: 277mm; max-height: 190mm; margin: 0 auto; padding: 16px; background: #ffffff; color: #000000; display: flex; justify-content: center; overflow: hidden; box-sizing: border-box;">
          ${colsHtml}
        </div>
      `;
    })
    .join('');
}

export function generateVerticalA4Template(
  forms: FormRecord | FormRecord[],
  options?: TemplateOptions
): string {
  const formList = Array.isArray(forms) ? forms : [forms];
  const templateUrl = options?.templateUrl;
  const templeName = options?.templeName || 'Bổn Tự Chùa Báo Ân';

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
                  <div style="display: flex; align-items: baseline; justify-content: space-between; border-bottom: 1px solid #e7e5e4; padding: 4px 0; font-size: 12px;">
                    <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
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
                        ? `<div style="font-size: 11px; color: #57534e; flex-shrink: 0; margin-left: 4px;">${escapeHtml(
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
            
            <div style="display: flex; flex-direction: column; gap: 16px; overflow: hidden;">
              <div style="display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 2px solid rgba(120, 53, 15, 0.3); padding-bottom: 16px;">
                <div style="border: 4px double #b91c1c; color: #b91c1c; font-family: 'Times New Roman', serif; font-weight: bold; padding: 8px 12px; font-size: 12px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em; text-align: center; line-height: 1.25; user-select: none;">
                  Báo Ân Cổ Tự<br />Pháp Ấn
                </div>

                <div style="text-align: center; flex: 1; padding: 0 16px;">
                  <p style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #78716c; margin: 0 0 4px 0;">
                    Phật Giáo Việt Nam • ${escapeHtml(templeName)}
                  </p>
                  <h2 style="font-family: 'Times New Roman', serif; font-size: 26px; font-weight: bold; color: #451a03; letter-spacing: 0.025em; text-transform: uppercase; margin: 0;">
                    ${isCauAn ? 'Sớ Phục Nguyện Cầu An' : 'Sớ Phục Nguyện Cầu Siêu'}
                  </h2>
                  <p style="font-family: 'Times New Roman', serif; font-style: italic; font-size: 14px; color: #92400e; margin: 4px 0 0 0;">
                    ${
                      isCauAn
                        ? 'Nam Mô Tiêu Tai Diên Thọ Dược Sư Lưu Ly Quang Vương Phật'
                        : 'Nam Mô Tiếp Dẫn Đạo Sư A Di Đà Phật'
                    }
                  </p>
                </div>

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

              <div style="background: rgba(120, 53, 15, 0.05); border: 1px solid rgba(120, 53, 15, 0.2); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px;">
                  <span style="font-family: 'Times New Roman', serif; font-weight: bold; font-size: 16px; color: #451a03;">
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

export function generatePhungViToaViTemplate(
  forms: FormRecord | FormRecord[],
  options?: TemplateOptions
): string {
  const formList = Array.isArray(forms) ? forms : [forms];
  const pages: HorizontalPage[] = chunkHorizontalColumns(formList);

  if (pages.length === 0) {
    return `<div class="empty-state" style="text-align: center; padding: 40px; font-family: 'Times New Roman', serif;">Không có dữ liệu phiếu sớ để in.</div>`;
  }

  return pages
    .map((page) => {
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

              <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 24px; text-align: center; width: 100%;">
                <div style="font-size: 11px; font-family: 'Times New Roman', Times, serif; font-style: italic; color: #78716c; margin-bottom: 4px;">
                  Nam Mô Tiếp Dẫn Đạo Sư A Di Đà Phật
                </div>
                <div style="font-size: 28px; font-family: 'Times New Roman', Times, serif; font-weight: bold; color: #451a03; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 2px solid rgba(120, 53, 15, 0.4); padding-bottom: 8px; width: 100%;">
                  PHỤNG VÌ
                </div>
              </div>

              <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 16px; margin: auto 0; width: 100%; padding: 8px 0;">
                ${namesHtml}
              </div>

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
}

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
  <title>Bổn Tự Chùa Báo Ân - In Sớ</title>
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

// ==========================================
// 3. MOCK DATASETS
// ==========================================
export const mockCauAnForm: FormRecord = {
  id: 'form-ca-001',
  form_code: 'CA-0001',
  form_type: 'CAU_AN',
  status: 'Accepted',
  is_delegated: false,
  scheduled_date: '15/07/2026',
  selected_time_slot: '09:00 - 10:30',
  note: 'Cầu cho gia đạo bình an, tai qua nạn khỏi, công danh thành đạt.',
  created_at: '2026-07-20T08:00:00Z',
  users: {
    full_name: 'Nguyễn Văn An',
    phone: '0901234567',
  },
  targets: [
    {
      id: 'tgt-ca-0',
      full_name: 'Nguyễn Văn An',
      dharma_name: 'Thiện Tâm',
      birth_year: 1975,
      relation: 'TRAI_CHU',
      type: 'CAU_AN',
    },
    {
      id: 'tgt-ca-1',
      full_name: 'Trần Thị Mai',
      dharma_name: 'Diệu Hương',
      birth_year: 1978,
      relation: 'Vợ',
      type: 'CAU_AN',
    },
    {
      id: 'tgt-ca-2',
      full_name: 'Nguyễn Minh Trí',
      dharma_name: 'Minh Trí',
      birth_year: 2005,
      relation: 'Con trai',
      type: 'CAU_AN',
    },
    {
      id: 'tgt-ca-3',
      full_name: 'Nguyễn Ngọc Trinh',
      dharma_name: 'Diệu Thảo',
      birth_year: 2008,
      relation: 'Con gái',
      type: 'CAU_AN',
    },
    {
      id: 'tgt-ca-4',
      full_name: 'Lê Văn Bình',
      dharma_name: 'Thiện Từ',
      birth_year: 1950,
      relation: 'Ông ngoại',
      type: 'CAU_AN',
    },
  ],
};

export const mockCauSieuForm: FormRecord = {
  id: 'form-cs-001',
  form_code: 'CS-0002',
  form_type: 'CAU_SIEU',
  status: 'Accepted',
  is_delegated: true,
  scheduled_date: '15/07/2026',
  selected_time_slot: null,
  note: 'Nguyện cầu chư hương linh trút bỏ trần duyên, vãn sinh Tây Phương Cực Lạc.',
  created_at: '2026-07-21T09:30:00Z',
  users: {
    full_name: 'Phạm Thị Hoa',
    phone: '0987654321',
  },
  targets: [
    {
      id: 'tgt-cs-0',
      full_name: 'Phạm Thị Hoa',
      dharma_name: 'Diệu Pháp',
      relation: 'TRAI_CHU',
      type: 'CAU_SIEU',
    },
    {
      id: 'tgt-cs-1',
      full_name: 'Phạm Văn Thành',
      dharma_name: 'Thiện Đức',
      birth_year: 1942,
      death_year: 2024,
      relation: 'Thân phụ',
      type: 'CAU_SIEU',
    },
    {
      id: 'tgt-cs-2',
      full_name: 'Hoàng Thị Tuyết',
      dharma_name: 'Diệu Vân',
      birth_year: 1945,
      death_year: 2025,
      relation: 'Thân mẫu',
      type: 'CAU_SIEU',
    },
    {
      id: 'tgt-cs-3',
      full_name: 'Phạm Quốc Hùng',
      dharma_name: 'Minh Đức',
      birth_year: 1970,
      death_year: 2020,
      relation: 'Anh trai',
      type: 'CAU_SIEU',
    },
    {
      id: 'tgt-cs-4',
      full_name: 'Nguyễn Thị Cúc',
      dharma_name: 'Diệu Nghiêm',
      birth_year: 1920,
      death_year: 1998,
      relation: 'Bà nội',
      type: 'CAU_SIEU',
    },
  ],
};

export const mockPhungViForm: FormRecord = {
  id: 'form-pv-001',
  form_code: 'PV-0003',
  form_type: 'CAU_SIEU',
  status: 'Accepted',
  is_delegated: false,
  scheduled_date: '15/07/2026',
  selected_time_slot: '14:00 - 15:30',
  note: 'Linh vị phụng vì gia tiên nội ngoại.',
  created_at: '2026-07-22T10:00:00Z',
  users: {
    full_name: 'Trần Văn Đức',
    phone: '0912345678',
  },
  targets: [
    {
      id: 'tgt-pv-0',
      full_name: 'Trần Văn Đức',
      relation: 'TRAI_CHU',
      type: 'CAU_SIEU',
    },
    {
      id: 'tgt-pv-1',
      full_name: 'Cụ Ông Trần Văn Ninh',
      dharma_name: 'Thiện Phúc',
      type: 'CAU_SIEU',
    },
    {
      id: 'tgt-pv-2',
      full_name: 'Cụ Bà Võ Thị Thắm',
      dharma_name: 'Diệu Nhẫn',
      type: 'CAU_SIEU',
    },
    {
      id: 'tgt-pv-3',
      full_name: 'Hương Linh Trần Văn Hải',
      dharma_name: 'Minh Thông',
      type: 'CAU_SIEU',
    },
  ],
};

export const mockFormsList: FormRecord[] = [
  mockCauAnForm,
  mockCauSieuForm,
  mockPhungViForm,
];

// ==========================================
// 4. LIVE PREVIEW COMPONENT (CROSS-PLATFORM)
// ==========================================
function LivePreview({ html }: { html: string }) {
  if (Platform.OS === 'web') {
    return (
      <View className="flex-1 bg-white rounded-lg overflow-hidden border border-stone-200 shadow-inner">
        {React.createElement('iframe', {
          srcDoc: html,
          style: { width: '100%', height: '100%', border: 'none' },
          title: 'Sớ Live Preview',
        })}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white rounded-lg overflow-hidden border border-stone-200 shadow-inner">
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={{ flex: 1, backgroundColor: '#ffffff' }}
        scalesPageToFit
      />
    </View>
  );
}

// ==========================================
// 5. MAIN PRINT STATION SCREEN
// ==========================================
export default function PrintStationScreen() {
  const [printMode, setPrintMode] = useState<PrintMode>('VERTICAL_A4');
  const [selectedFormKey, setSelectedFormKey] = useState<'CAU_AN' | 'CAU_SIEU' | 'PHUNG_VI' | 'ALL'>('CAU_AN');
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Form Field State for Interactive Live Adjustments
  const [templeName, setTempleName] = useState<string>('Chùa Báo Ân');
  const [formType, setFormType] = useState<FormType>('CAU_AN');
  const [traiChuName, setTraiChuName] = useState<string>('Nguyễn Văn An');
  const [phone, setPhone] = useState<string>('0901234567');
  const [scheduledDate, setScheduledDate] = useState<string>('15/07/2026');
  const [timeSlot, setTimeSlot] = useState<string>('09:00 - 10:30');
  const [noteText, setNoteText] = useState<string>('Cầu cho gia đạo bình an, tai qua nạn khỏi, công danh thành đạt.');
  
  // Targets State
  const [targets, setTargets] = useState<TargetPerson[]>([
    { id: 't-1', full_name: 'Trần Thị Mai', dharma_name: 'Diệu Hương', birth_year: 1978, relation: 'Vợ', type: 'CAU_AN' },
    { id: 't-2', full_name: 'Nguyễn Minh Trí', dharma_name: 'Minh Trí', birth_year: 2005, relation: 'Con trai', type: 'CAU_AN' },
    { id: 't-3', full_name: 'Nguyễn Ngọc Trinh', dharma_name: 'Diệu Thảo', birth_year: 2008, relation: 'Con gái', type: 'CAU_AN' },
    { id: 't-4', full_name: 'Lê Văn Bình', dharma_name: 'Thiện Từ', birth_year: 1950, relation: 'Ông ngoại', type: 'CAU_AN' },
  ]);

  // Target Input Form State
  const [newFullName, setNewFullName] = useState<string>('');
  const [newDharmaName, setNewDharmaName] = useState<string>('');
  const [newBirthYear, setNewBirthYear] = useState<string>('');
  const [newRelation, setNewRelation] = useState<string>('');

  // Handle Preset Switching
  const handleSelectPreset = (key: 'CAU_AN' | 'CAU_SIEU' | 'PHUNG_VI' | 'ALL') => {
    setSelectedFormKey(key);
    if (key === 'CAU_AN') {
      setFormType('CAU_AN');
      setTraiChuName(mockCauAnForm.users?.full_name || '');
      setPhone(mockCauAnForm.users?.phone || '');
      setScheduledDate(mockCauAnForm.scheduled_date);
      setTimeSlot(mockCauAnForm.selected_time_slot || '');
      setNoteText(mockCauAnForm.note || '');
      setTargets(mockCauAnForm.targets.filter((t) => t.relation !== 'TRAI_CHU'));
    } else if (key === 'CAU_SIEU') {
      setFormType('CAU_SIEU');
      setTraiChuName(mockCauSieuForm.users?.full_name || '');
      setPhone(mockCauSieuForm.users?.phone || '');
      setScheduledDate(mockCauSieuForm.scheduled_date);
      setTimeSlot(mockCauSieuForm.selected_time_slot || '');
      setNoteText(mockCauSieuForm.note || '');
      setTargets(mockCauSieuForm.targets.filter((t) => t.relation !== 'TRAI_CHU'));
    } else if (key === 'PHUNG_VI') {
      setFormType('CAU_SIEU');
      setTraiChuName(mockPhungViForm.users?.full_name || '');
      setPhone(mockPhungViForm.users?.phone || '');
      setScheduledDate(mockPhungViForm.scheduled_date);
      setTimeSlot(mockPhungViForm.selected_time_slot || '');
      setNoteText(mockPhungViForm.note || '');
      setTargets(mockPhungViForm.targets.filter((t) => t.relation !== 'TRAI_CHU'));
    }
  };

  // Add Target Person
  const handleAddTarget = () => {
    if (!newFullName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập họ và tên.');
      return;
    }
    const newTarget: TargetPerson = {
      id: `custom-t-${Date.now()}`,
      full_name: newFullName.trim(),
      dharma_name: newDharmaName.trim() || null,
      birth_year: newBirthYear ? parseInt(newBirthYear, 10) : null,
      relation: newRelation.trim() || null,
      type: formType,
    };
    setTargets((prev) => [...prev, newTarget]);
    setNewFullName('');
    setNewDharmaName('');
    setNewBirthYear('');
    setNewRelation('');
  };

  // Remove Target Person
  const handleRemoveTarget = (id: string) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
  };

  // Construct Active Form Record(s) for rendering
  const activeFormData = useMemo<FormRecord | FormRecord[]>(() => {
    if (selectedFormKey === 'ALL') {
      return mockFormsList;
    }

    const traiChuTarget: TargetPerson = {
      id: 'tc-active',
      full_name: traiChuName,
      relation: 'TRAI_CHU',
      type: formType,
    };

    return {
      id: 'form-active',
      form_code: selectedFormKey === 'CAU_AN' ? 'CA-0001' : selectedFormKey === 'CAU_SIEU' ? 'CS-0002' : 'PV-0003',
      form_type: formType,
      status: 'Accepted',
      is_delegated: false,
      scheduled_date: scheduledDate,
      selected_time_slot: timeSlot,
      note: noteText,
      users: {
        full_name: traiChuName,
        phone,
      },
      targets: [traiChuTarget, ...targets],
    };
  }, [selectedFormKey, formType, traiChuName, phone, scheduledDate, timeSlot, noteText, targets]);

  // Render HTML String Live
  const htmlContent = useMemo(() => {
    return renderSoHtml(activeFormData, {
      printMode,
      templeName,
    });
  }, [activeFormData, printMode, templeName]);

  // Action Bar: In Sớ (Print)
  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 500);
        } else {
          Alert.alert('Lỗi', 'Trình duyệt đã chặn cửa sổ in tự động.');
        }
      } else {
        await Print.printAsync({ html: htmlContent });
      }
    } catch (error) {
      Alert.alert('Thất bại', 'Không thể khởi chạy dịch vụ in: ' + String(error));
    } finally {
      setIsPrinting(false);
    }
  };

  // Action Bar: Xuất PDF / Chia Sẻ
  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      if (Platform.OS === 'web') {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `So_Print_Station_${printMode}_${Date.now()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Alert.alert('Thành công', 'Đã tải xuống file bản in.');
      } else {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Chia sẻ file sớ PDF',
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert('Thành công', `Đã xuất file PDF tại đường dẫn:\n${uri}`);
        }
      }
    } catch (error) {
      Alert.alert('Thất bại', 'Không thể xuất file PDF: ' + String(error));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#081B24]">
      {/* Top Header */}
      <View className="bg-[#081B24] border-b border-stone-800 px-4 py-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-[#D69F4C]/20 items-center justify-center border border-[#D69F4C]/40">
            <Printer size={20} color="#D69F4C" />
          </View>
          <View>
            <Text className="text-white font-bold text-lg tracking-wide">TRẠM IN SỚ BỔN TỰ</Text>
            <Text className="text-[#D69F4C] text-xs font-medium">Cấu hình định dạng & Live Preview</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setShowControls(!showControls)}
          className="flex-row items-center bg-stone-800 border border-stone-700 px-3 py-1.5 rounded-lg"
        >
          <Settings2 size={16} color="#D69F4C" />
          <Text className="text-stone-200 text-xs font-semibold ml-1.5">
            {showControls ? 'Ẩn bộ điều khiển' : 'Hiện bộ điều khiển'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Container */}
      <View className="flex-1 flex-col lg:flex-row bg-[#faf8f5]">
        {/* Left / Top Controls Sidebar */}
        {showControls && (
          <ScrollView className="w-full lg:w-96 bg-white border-r border-stone-200 p-4 shadow-sm">
            {/* Mode Switcher */}
            <View className="mb-5">
              <Text className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                1. ĐỊNH DẠNG KHUÔN SỚ (PRINT MODE)
              </Text>

              <View className="gap-2">
                <TouchableOpacity
                  onPress={() => setPrintMode('HORIZONTAL_CHANH_DIEN')}
                  className={`p-3 rounded-lg border flex-row items-center justify-between ${
                    printMode === 'HORIZONTAL_CHANH_DIEN'
                      ? 'bg-[#D69F4C]/10 border-[#D69F4C]'
                      : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <View className="flex-1 pr-2">
                    <Text className={`font-bold text-sm ${printMode === 'HORIZONTAL_CHANH_DIEN' ? 'text-[#8B4513]' : 'text-stone-800'}`}>
                      1. Ngang dán chánh điện
                    </Text>
                    <Text className="text-xs text-stone-500 mt-0.5">A4 Landscape • Tối đa 4 cột/trang • Mã số 64px</Text>
                  </View>
                  {printMode === 'HORIZONTAL_CHANH_DIEN' && <CheckCircle2 size={18} color="#D69F4C" />}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPrintMode('VERTICAL_A4')}
                  className={`p-3 rounded-lg border flex-row items-center justify-between ${
                    printMode === 'VERTICAL_A4'
                      ? 'bg-[#D69F4C]/10 border-[#D69F4C]'
                      : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <View className="flex-1 pr-2">
                    <Text className={`font-bold text-sm ${printMode === 'VERTICAL_A4' ? 'text-[#8B4513]' : 'text-stone-800'}`}>
                      2. Dọc A4 (Phục Nguyện)
                    </Text>
                    <Text className="text-xs text-stone-500 mt-0.5">A4 Portrait • Quốc hiệu • Ấn triện • Cột chia tự động</Text>
                  </View>
                  {printMode === 'VERTICAL_A4' && <CheckCircle2 size={18} color="#D69F4C" />}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPrintMode('PHUNG_VI_TOA_VI')}
                  className={`p-3 rounded-lg border flex-row items-center justify-between ${
                    printMode === 'PHUNG_VI_TOA_VI'
                      ? 'bg-[#D69F4C]/10 border-[#D69F4C]'
                      : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <View className="flex-1 pr-2">
                    <Text className={`font-bold text-sm ${printMode === 'PHUNG_VI_TOA_VI' ? 'text-[#8B4513]' : 'text-stone-800'}`}>
                      3. Phụng Vì - Tọa Vị (Linh Vị)
                    </Text>
                    <Text className="text-xs text-stone-500 mt-0.5">A4 Landscape • Đỉnh PHỤNG VÌ • Đáy TỌA VỊ (Bỏ mã số)</Text>
                  </View>
                  {printMode === 'PHUNG_VI_TOA_VI' && <CheckCircle2 size={18} color="#D69F4C" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Form Selector */}
            <View className="mb-5 border-t border-stone-200 pt-4">
              <Text className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                2. CHỌN MẪU DỮ LIỆU SỚ (PRESETS)
              </Text>
              
              <View className="flex-row flex-wrap gap-2 mb-3">
                <TouchableOpacity
                  onPress={() => handleSelectPreset('CAU_AN')}
                  className={`px-3 py-1.5 rounded-full border ${
                    selectedFormKey === 'CAU_AN' ? 'bg-[#0D3A4B] border-[#0D3A4B]' : 'bg-stone-100 border-stone-300'
                  }`}
                >
                  <Text className={`text-xs font-semibold ${selectedFormKey === 'CAU_AN' ? 'text-white' : 'text-stone-700'}`}>
                    Sớ Cầu An (CA-0001)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSelectPreset('CAU_SIEU')}
                  className={`px-3 py-1.5 rounded-full border ${
                    selectedFormKey === 'CAU_SIEU' ? 'bg-[#0D3A4B] border-[#0D3A4B]' : 'bg-stone-100 border-stone-300'
                  }`}
                >
                  <Text className={`text-xs font-semibold ${selectedFormKey === 'CAU_SIEU' ? 'text-white' : 'text-stone-700'}`}>
                    Sớ Cầu Siêu (CS-0002)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSelectPreset('PHUNG_VI')}
                  className={`px-3 py-1.5 rounded-full border ${
                    selectedFormKey === 'PHUNG_VI' ? 'bg-[#0D3A4B] border-[#0D3A4B]' : 'bg-stone-100 border-stone-300'
                  }`}
                >
                  <Text className={`text-xs font-semibold ${selectedFormKey === 'PHUNG_VI' ? 'text-white' : 'text-stone-700'}`}>
                    Phụng Vì (PV-0003)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSelectPreset('ALL')}
                  className={`px-3 py-1.5 rounded-full border ${
                    selectedFormKey === 'ALL' ? 'bg-[#8B4513] border-[#8B4513]' : 'bg-stone-100 border-stone-300'
                  }`}
                >
                  <Text className={`text-xs font-semibold ${selectedFormKey === 'ALL' ? 'text-white' : 'text-stone-700'}`}>
                    In gộp tất cả (3 phiếu)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Field Adjustments */}
            {selectedFormKey !== 'ALL' && (
              <View className="mb-6 border-t border-stone-200 pt-4">
                <Text className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
                  3. ĐIỀU CHỈNH THÔNG TIN SỚ
                </Text>

                <View className="gap-3">
                  <View>
                    <Text className="text-xs font-semibold text-stone-700 mb-1">Tên Chùa / Bổn Tự</Text>
                    <TextInput
                      value={templeName}
                      onChangeText={setTempleName}
                      className="bg-stone-50 border border-stone-300 rounded-md px-3 py-1.5 text-sm text-stone-900"
                    />
                  </View>

                  <View className="flex-row gap-2">
                    <View className="flex-1">
                      <Text className="text-xs font-semibold text-stone-700 mb-1">Họ tên Gia chủ</Text>
                      <TextInput
                        value={traiChuName}
                        onChangeText={setTraiChuName}
                        className="bg-stone-50 border border-stone-300 rounded-md px-3 py-1.5 text-sm text-stone-900"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-semibold text-stone-700 mb-1">Số điện thoại</Text>
                      <TextInput
                        value={phone}
                        onChangeText={setPhone}
                        className="bg-stone-50 border border-stone-300 rounded-md px-3 py-1.5 text-sm text-stone-900"
                      />
                    </View>
                  </View>

                  <View className="flex-row gap-2">
                    <View className="flex-1">
                      <Text className="text-xs font-semibold text-stone-700 mb-1">Ngày dâng cúng</Text>
                      <TextInput
                        value={scheduledDate}
                        onChangeText={setScheduledDate}
                        className="bg-stone-50 border border-stone-300 rounded-md px-3 py-1.5 text-sm text-stone-900"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-semibold text-stone-700 mb-1">Khung giờ</Text>
                      <TextInput
                        value={timeSlot}
                        onChangeText={setTimeSlot}
                        className="bg-stone-50 border border-stone-300 rounded-md px-3 py-1.5 text-sm text-stone-900"
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="text-xs font-semibold text-stone-700 mb-1">Lời khấn / Ghi chú sớ</Text>
                    <TextInput
                      value={noteText}
                      onChangeText={setNoteText}
                      multiline
                      numberOfLines={2}
                      className="bg-stone-50 border border-stone-300 rounded-md px-3 py-1.5 text-sm text-stone-900 h-16"
                    />
                  </View>

                  {/* Target List Sub-Editor */}
                  <View className="border-t border-stone-200 pt-3 mt-1">
                    <Text className="text-xs font-bold text-[#8B4513] uppercase mb-2">
                      Danh sách người cầu an / hương linh ({targets.length} người)
                    </Text>

                    {targets.map((item, idx) => (
                      <View key={item.id} className="bg-stone-50 border border-stone-200 rounded p-2 mb-1.5 flex-row items-center justify-between">
                        <View className="flex-1 pr-2">
                          <Text className="text-xs font-bold text-stone-800">
                            {idx + 1}. {item.full_name} {item.dharma_name ? `(PD: ${item.dharma_name})` : ''}
                          </Text>
                          <Text className="text-[10px] text-stone-500">
                            {item.birth_year ? `SN: ${item.birth_year}` : ''} {item.relation ? `• ${item.relation}` : ''}
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => handleRemoveTarget(item.id)} className="p-1">
                          <Trash2 size={14} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}

                    {/* Quick Add Form */}
                    <View className="bg-stone-100 p-2 rounded-md mt-2 gap-2">
                      <Text className="text-[11px] font-bold text-stone-600">Thêm người vào sớ:</Text>
                      <View className="flex-row gap-1.5">
                        <TextInput
                          placeholder="Họ và tên *"
                          value={newFullName}
                          onChangeText={setNewFullName}
                          className="flex-1 bg-white border border-stone-300 rounded px-2 py-1 text-xs"
                        />
                        <TextInput
                          placeholder="Pháp danh"
                          value={newDharmaName}
                          onChangeText={setNewDharmaName}
                          className="flex-1 bg-white border border-stone-300 rounded px-2 py-1 text-xs"
                        />
                      </View>
                      <View className="flex-row gap-1.5">
                        <TextInput
                          placeholder="Năm sinh"
                          value={newBirthYear}
                          onChangeText={setNewBirthYear}
                          keyboardType="numeric"
                          className="w-24 bg-white border border-stone-300 rounded px-2 py-1 text-xs"
                        />
                        <TextInput
                          placeholder="Quan hệ"
                          value={newRelation}
                          onChangeText={setNewRelation}
                          className="flex-1 bg-white border border-stone-300 rounded px-2 py-1 text-xs"
                        />
                        <TouchableOpacity
                          onPress={handleAddTarget}
                          className="bg-[#D69F4C] px-3 py-1.5 rounded justify-center items-center flex-row"
                        >
                          <Plus size={14} color="#ffffff" />
                          <Text className="text-white text-xs font-bold ml-1">Thêm</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* Right / Center Live Preview Window */}
        <View className="flex-1 p-4 flex-col">
          <View className="flex-row items-center justify-between mb-3 bg-white px-3 py-2 rounded-lg border border-stone-200 shadow-sm">
            <View className="flex-row items-center gap-2">
              <Eye size={16} color="#8B4513" />
              <Text className="font-bold text-stone-800 text-xs uppercase tracking-wide">
                Xem Trước Bản In Tươi (Live Preview)
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Text className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                Khuôn: {printMode}
              </Text>
            </View>
          </View>

          {/* Rendered HTML Container */}
          <LivePreview html={htmlContent} />

          {/* Action Bar Footer */}
          <View className="bg-[#081B24] mt-3 p-3 rounded-xl border border-stone-800 flex-row items-center justify-between gap-3 shadow-lg">
            <View className="flex-1">
              <Text className="text-white text-xs font-bold">Sẵn sàng xuất trang in sớ</Text>
              <Text className="text-stone-400 text-[10px]">Định dạng: {printMode === 'VERTICAL_A4' ? 'A4 Dọc' : 'A4 Ngang'}</Text>
            </View>

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleExportPdf}
                disabled={isExporting}
                className="bg-stone-800 hover:bg-stone-700 border border-stone-700 px-4 py-2.5 rounded-lg flex-row items-center justify-center"
              >
                {isExporting ? (
                  <ActivityIndicator size="small" color="#D69F4C" />
                ) : (
                  <>
                    <Share2 size={16} color="#D69F4C" />
                    <Text className="text-stone-200 text-xs font-bold ml-2">Xuất PDF / Chia sẻ</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePrint}
                disabled={isPrinting}
                className="bg-[#D69F4C] hover:bg-[#b88338] px-5 py-2.5 rounded-lg flex-row items-center justify-center shadow-md"
              >
                {isPrinting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Printer size={16} color="#ffffff" />
                    <Text className="text-white text-xs font-extrabold ml-2 uppercase">In Sớ Ngay</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
