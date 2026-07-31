import { FormRecord, TargetPerson } from './types';

export const MAX_LINES_PER_COL_VERTICAL = 28;
export const MAX_LINES_PER_COL_HORIZONTAL = 21;
export const MAX_COLS_PER_PAGE_HORIZONTAL = 4;

export const FORM_CODE_WEIGHT = 4;
export const SHORT_NAME_WEIGHT = 1;
export const LONG_NAME_WEIGHT = 2;

export type LineType = 'FORM_CODE' | 'FORM_CODE_CONTINUED' | 'PERSON';

export interface SoLine {
  type: LineType;
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

export interface HorizontalColumn {
  shortCode: string;
  formCode: string;
  names: string[];
}

export interface HorizontalPage {
  columns: HorizontalColumn[];
}

/**
 * Calculates line weight of a person entry based on name length, word count, or extra metadata.
 */
export function calculateNameWeight(
  fullName: string,
  dharmaName?: string | null,
  birthYear?: number | null
): number {
  const name = (fullName || '').trim();
  const wordCount = name ? name.split(/\s+/).length : 0;
  const isLong = name.length >= 15 || wordCount >= 4 || !!dharmaName || !!birthYear;
  return isLong ? LONG_NAME_WEIGHT : SHORT_NAME_WEIGHT;
}

/**
 * Thuật toán Line-Weight chia cột sớ (Vertical A4 / HTML-Overlay)
 * Chia danh sách các phiếu cúng và người thụ hưởng vào các cột sớ (tối đa 28 dòng/cột).
 * Tự động chèn lại mã phiếu phụ (Tiếp) chiếm 4 dòng khi ngắt cột giữa chừng.
 */
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
    // 1. Check if current column has space for initial form code (4 lines)
    if (currentColumn.totalLines + FORM_CODE_WEIGHT > maxLinesPerCol) {
      startNewColumn();
    }

    // Add form code line
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

      // If adding this person exceeds maxLinesPerCol, break column
      if (currentColumn.totalLines + weight > maxLinesPerCol) {
        startNewColumn();

        // Re-insert continued form code header (4 lines)
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

/**
 * Thuật toán chia cột cho chế độ Ngang dán chánh điện & Phụng Vì - Tọa Vị
 * Gom các cột từ danh sách phiếu cúng (Tối đa 13 dòng/cột, 4 cột/trang A4 Ngang).
 */
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
      const linesNeeded = wordCount >= 4 || name.length >= 15 ? LONG_NAME_WEIGHT : SHORT_NAME_WEIGHT;

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
