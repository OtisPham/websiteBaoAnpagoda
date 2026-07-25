# HANDOFF REPORT — EXPLORER 1 (MILESTONE M1)

**Working Directory**: `c:\Users\ADMIN\Desktop\pagodaweb\.agents\explorer_m1_1`  
**Target Project**: `c:\Users\ADMIN\Desktop\pagodaweb`  
**Date**: 2026-07-24  

---

## 1. Observation

Direct observations from examining the legacy Next.js codebase at `c:\Users\ADMIN\Desktop\pagodaweb`:

1. **Print Station Component (`src/app/dashboard/print/PrintStation.tsx`)**:
   - `printMode` state supports three modes: `'READING' | 'POSTER' | 'PHUNG_VI'` (Line 48).
   - Mode 1: `READING` ("Mẫu Quý Thầy Đọc (A4 Dọc Chuẩn)") (Lines 381-558).
     - Renders vertical A4 page block: `<div className="so-page-block ... print:w-[180mm] print:h-[273mm]" style={{ pageBreakAfter: 'always', page: 'so-portrait-page' }}>`.
     - Static text headers: `"Phật Giáo Việt Nam • Bổn Tự Chùa Báo Ân"` (Line 413), `"Báo Ân Cổ Tự Pháp Ấn"` (Line 408), `"Sớ Phục Nguyện Cầu An"` / `"Sớ Phục Nguyện Cầu Siêu"` (Lines 418-419), `"Nam Mô Tiêu Tai Diên Thọ Dược Sư Lưu Ly Quang Vương Phật"` / `"Nam Mô Tiếp Dẫn Đạo Sư A Di Đà Phật"` (Lines 423-424).
     - Static wishes: `"Đệ tử chúng đẳng thành tâm khấu bái, nguyện cầu Tam Bảo chứng minh, gia quyến khang ninh khương thái cát tường, sở cầu như ý, sở nguyện tòng tâm."` (Line 539) & `"Đệ tử chúng đẳng thành tâm khấu bái, nguyện cầu Tiếp Dẫn Đạo Sư A Di Đà Phật phóng quang tiếp độ chư hương linh trút bỏ trần duyên, siêu sinh tịnh độ."` (Line 540).
     - Target grid column splitting logic: `MAX_PER_COL = 15` (Line 470). If `actualTargets.length <= 15` and `> 4`, automatically splits into 2 balanced columns.
   - Mode 2: `POSTER` ("Mẫu Dán Chánh Điện (Bảng Biểu)") (Lines 258-380, 362-376).
     - Renders horizontal landscape page block: `style={{ pageBreakAfter: 'always', page: 'so-page' }}`.
     - Grouping: `MAX_LINES_PER_COL = 13`, `MAX_COLS_PER_PAGE = 4`.
     - Short code header: `col.shortCode` (`form.form_code.slice(-3)`) in `text-[64px] font-bold`.
     - Dashed cut borders with scissors: `border-dashed border-stone-400 print:border-stone-500` with `✂` unicode scissor characters at borders.
   - Mode 3: `PHUNG_VI` ("Mẫu Linh Vị (Phụng Vì - Tọa Vị)") (Lines 258-380, 328-361).
     - **Removes short code / form code at top**.
     - Top title (Đỉnh bài vị): `"PHỤNG VÌ"` (`text-3xl font-serif font-bold text-amber-950 uppercase tracking-widest border-b-2 border-amber-900/40 pb-2 w-full`) (Line 336).
     - Sub-header: `"Nam Mô Tiếp Dẫn Đạo Sư A Di Đà Phật"` (Line 333).
     - Center list: Upper-case target names (`col.names`) (Lines 342-348).
     - Bottom footer (Đáy bài vị): `"TỌA VỊ"` (`text-2xl font-serif font-bold text-amber-950 uppercase tracking-widest`) with `"Chùa Báo Ân • Linh Vị"` (Lines 355-358).

2. **Line-Weight Column Chunking (`src/utils/so/lineWeight.ts`)**:
   - Implements `chunkSoColumns(forms: FormWithTargets[]): SoColumn[]`.
   - Constants: `MAX_LINES_PER_COL = 28`, `FORM_CODE_WEIGHT = 4`, `SHORT_NAME_WEIGHT = 1`, `LONG_NAME_WEIGHT = 2`.
   - Inserts `${form.form_code} (Tiếp)` occupying 4 lines when form data breaks across column boundaries.

3. **DOCX Template Renderer (`src/utils/so/docxRenderer.ts`)**:
   - Uses `docxtemplater` and `pizzip` to render `.docx` templates from buffer using data key-value maps.

4. **Print CSS Styles (`src/app/globals.css`)**:
   - Enforces Times New Roman for print:
     ```css
     .so-page-block, .so-page-block *, .receipt-print-area, .receipt-print-area *, .receipt-preview, .receipt-preview *, .print-font-times, .print-font-times * {
       font-family: "Times New Roman", Times, serif !important;
     }
     ```
   - `@page so-portrait-page`: `size: A4 portrait; margin: 12mm 15mm;`
   - `@page so-page`: `size: A4 landscape; margin: 10mm;`
   - `-webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;`

5. **Database Schema (`supabase/migrations/20260707000000_init_schema.sql` & `setup_templates.txt`)**:
   - `forms` table: `id`, `form_code` (`CA-0001`, `CS-0001`), `form_type` (`CAU_AN`, `CAU_SIEU`), `status` (`Draft` -> `Submitted` -> `Waiting Verification` -> `Accepted` -> `Printed` -> `Completed`), `scheduled_date`, `selected_time_slot`, `is_delegated`, `note`.
   - `target_persons` table: `id`, `form_id`, `full_name`, `dharma_name`, `birth_year`, `death_year`, `relation`, `type`.
   - `templates` table: `id`, `name`, `form_type`, `file_url`, `is_active`.

6. **Test Specifications (`TesterFile.md`)**:
   - TC081: Vertical A4 layout test (`so-portrait-page`, 180mm x 273mm print box).
   - TC082: Horizontal main altar poster test (`so-page`, 4 columns, dashed borders, `✂` scissors).
   - TC083: Multi-column CauSieu layout test (max 15 targets per column).
   - TC084: Phụng Vì - Tọa Vị mode test (`PHUNG_VI`, removes top code, adds `PHỤNG VÌ` header and `TỌA VỊ` footer).
   - TC085: Dynamic image overlay template test (`print-color-adjust: exact`).

---

## 2. Logic Chain

1. **Premise 1**: The user request requires identifying and documenting print templates, layouts, static texts, CSS/styling, font definitions, and data injection mechanisms in `c:\Users\ADMIN\Desktop\pagodaweb`.
2. **Step 1 (Layout Identification)**:
   - Inspection of `PrintStation.tsx` (Lines 48, 258-558) reveals three explicit layout rendering paths controlled by `printMode`:
     - `READING` -> A4 Vertical layout (uses `@page so-portrait-page`, 180mm x 273mm box, background template image).
     - `POSTER` -> A4 Horizontal Main Altar layout (uses `@page so-page`, 4 columns per page, 13 lines/col max, 3-digit short code, `✂` cut lines).
     - `PHUNG_VI` -> Phụng Vì - Tọa Vị layout (uses `@page so-page`, removes form code, header `"PHỤNG VÌ"`, footer `"TỌA VỊ"`).
3. **Step 2 (Static Text & Cultural Phrases Identification)**:
   - Inspection of `PrintStation.tsx` (Lines 333-358, 408-424, 460-465, 539-551) confirms exact Vietnamese Buddhist text strings used for headers, seals, invocations, wish texts, empty state fallback, and signature footers.
4. **Step 3 (Data Injection Mechanism)**:
   - Inspection of `PrintStation.tsx` and `init_schema.sql` shows data structure flow: `FormRecord` containing `targets: TargetPerson[]`.
   - Trai Chủ (Owner) is identified by `relation === 'TRAI_CHU'` (or `users.full_name`).
   - Targets are filtered via `relation !== 'TRAI_CHU'`.
   - Data fields (`full_name`, `dharma_name`, `birth_year`, `death_year`) are injected into columns dynamically.
   - External dynamic templates upload images to Supabase storage bucket `print_templates`, rendered via CSS `backgroundImage`. File templates (.docx) are processed using `docxtemplater` in `docxRenderer.ts`.
5. **Step 4 (Line-Weight Algorithm Analysis)**:
   - `lineWeight.ts` defines standard weighted line allocation (`MAX_LINES_PER_COL = 28`, `FORM_CODE_WEIGHT = 4`, `SHORT_NAME_WEIGHT = 1`, `LONG_NAME_WEIGHT = 2`) and handles column overflow with `[FORM_CODE (Tiếp)]`.

---

## 3. Caveats

- **No runtime backend state modified**: Exploration was conducted strictly read-only.
- **Client vs Server Rendering**: `PrintStation.tsx` is a client component (`'use client'`), which handles print preview and browser window printing (`window.print()`). Server actions in `actions.ts` update `forms.status` to `Printed` and log into `print_history`.

---

## 4. Conclusion

The legacy Next.js codebase contains a complete print engine for pagoda forms:
1. **Three Layout Modes**: Vertical A4 (`READING`), Horizontal Main Altar (`POSTER`), and Phụng Vì - Tọa Vị (`PHUNG_VI`).
2. **Static Vietnamese Buddhist Texts**: Fully cataloged and mapped to specific component locations.
3. **Data Injection**: Structured via `forms` and `target_persons` relations, supporting inline dynamic columns, background template overlays, and `.docx` document templating.
4. **CSS & Fonts**: Times New Roman font stack enforced for print; distinct `@page` media rules for A4 Portrait (`12mm 15mm`) and Landscape (`10mm`).

Comprehensive details have been documented in `c:\Users\ADMIN\Desktop\pagodaweb\.agents\explorer_m1_1\analysis.md`.

---

## 5. Verification Method

To verify these findings:
1. **Inspect Files**:
   - `c:\Users\ADMIN\Desktop\pagodaweb\src\app\dashboard\print\PrintStation.tsx` (Lines 48, 258-560)
   - `c:\Users\ADMIN\Desktop\pagodaweb\src\utils\so\lineWeight.ts` (Lines 37-40, 47-127)
   - `c:\Users\ADMIN\Desktop\pagodaweb\src\utils\so\docxRenderer.ts` (Lines 10-30)
   - `c:\Users\ADMIN\Desktop\pagodaweb\src\app\globals.css` (Lines 59-137)
   - `c:\Users\ADMIN\Desktop\pagodaweb\.agents\explorer_m1_1\analysis.md`
2. **Invalidation Conditions**:
   - Finding alternative print rendering components outside `PrintStation.tsx`, `lineWeight.ts`, and `docxRenderer.ts`.
   - Discrepancies between documented layout modes (`READING`, `POSTER`, `PHUNG_VI`) and component implementations.
