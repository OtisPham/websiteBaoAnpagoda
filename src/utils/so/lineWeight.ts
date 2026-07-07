export interface TargetPerson {
  id: string
  full_name: string
  dharma_name?: string | null
  birth_year?: number | null
  death_year?: number | null
  relation?: string | null
  type: 'CAU_AN' | 'CAU_SIEU'
}

export interface FormWithTargets {
  id: string
  form_code: string
  form_type: 'CAU_AN' | 'CAU_SIEU'
  scheduled_date: string
  selected_time_slot?: string | null
  note?: string | null
  targets: TargetPerson[]
}

export type LineType = 'FORM_CODE' | 'FORM_CODE_CONTINUED' | 'PERSON'

export interface SoLine {
  type: LineType
  text: string
  linesUsed: number
  formCode: string
  personId?: string
  dharmaName?: string | null
}

export interface SoColumn {
  lines: SoLine[]
  totalLines: number
}

const MAX_LINES_PER_COL = 28
const FORM_CODE_WEIGHT = 4
const SHORT_NAME_WEIGHT = 1
const LONG_NAME_WEIGHT = 2

/**
 * Thuật toán Line-Weight chia cột sớ (HTML-Overlay)
 * Chia danh sách các phiếu cúng và người thụ hưởng vào các cột sớ (tối đa 28 dòng/cột).
 * Tự động chèn lại mã phiếu có hậu tố (Tiếp) khi ngắt cột giữa chừng.
 */
export function chunkSoColumns(forms: FormWithTargets[]): SoColumn[] {
  const columns: SoColumn[] = []
  let currentColumn: SoColumn = { lines: [], totalLines: 0 }

  const addLineToColumn = (line: SoLine) => {
    currentColumn.lines.push(line)
    currentColumn.totalLines += line.linesUsed
  }

  const startNewColumn = () => {
    if (currentColumn.lines.length > 0) {
      columns.push(currentColumn)
    }
    currentColumn = { lines: [], totalLines: 0 }
  }

  for (const form of forms) {
    // 1. Tính toán xem cột hiện tại có đủ chỗ để chèn mã phiếu (4 dòng) hay không.
    // Nếu dòng còn lại < 4, ta phải ngắt cột trước khi viết phiếu mới.
    if (currentColumn.totalLines + FORM_CODE_WEIGHT > MAX_LINES_PER_COL) {
      startNewColumn()
    }

    // Thêm dòng Form Code vào cột hiện tại
    addLineToColumn({
      type: 'FORM_CODE',
      text: form.form_code,
      linesUsed: FORM_CODE_WEIGHT,
      formCode: form.form_code
    })

    // Duyệt qua từng hương linh / người cầu an trong phiếu
    for (let i = 0; i < form.targets.length; i++) {
      const target = form.targets[i]
      
      // Tính trọng số dòng của tên người
      // Tên dài (>= 15 ký tự) hoặc có kèm pháp danh/năm sinh -> 2 dòng, tên ngắn -> 1 dòng
      const isLongName = target.full_name.length >= 15 || !!target.dharma_name
      const weight = isLongName ? LONG_NAME_WEIGHT : SHORT_NAME_WEIGHT

      // Kiểm tra xem cột hiện tại có đủ chỗ để chèn hương linh này không
      if (currentColumn.totalLines + weight > MAX_LINES_PER_COL) {
        // Hết chỗ! Ngắt cột hiện tại và chuyển sang cột mới
        startNewColumn()

        // Ở đầu cột mới, chèn lại mã phiếu phụ [Mã phiếu (Tiếp)] chiếm 4 dòng
        addLineToColumn({
          type: 'FORM_CODE_CONTINUED',
          text: `${form.form_code} (Tiếp)`,
          linesUsed: FORM_CODE_WEIGHT,
          formCode: form.form_code
        })
      }

      // Thêm thông tin hương linh / người cầu an vào cột hiện tại
      let text = target.full_name
      if (target.dharma_name) {
        text += ` (PD: ${target.dharma_name})`
      }
      if (target.birth_year) {
        text += ` - SN: ${target.birth_year}`
      }

      addLineToColumn({
        type: 'PERSON',
        text: text,
        linesUsed: weight,
        formCode: form.form_code,
        personId: target.id,
        dharmaName: target.dharma_name
      })
    }
  }

  // Chèn cột cuối cùng nếu có dữ liệu
  if (currentColumn.lines.length > 0) {
    columns.push(currentColumn)
  }

  return columns
}
