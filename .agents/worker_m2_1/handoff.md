# HANDOFF REPORT — WORKER 1 (MILESTONE M2: TEMPLATE RESTORATION & ENGINE)

**Working Directory**: `c:\Users\ADMIN\Desktop\pagodaweb\.agents\worker_m2_1`  
**Target Module**: `src\services\pdf\`  
**Date**: 2026-07-24  
**Author**: Worker 1 (Milestone M2)

---

## 1. Observation

1. **Service Module Location & Structure**:
   Implemented the complete template rendering engine under `src/services/pdf/` consisting of 9 clean TypeScript modules:
   - `src/services/pdf/types.ts`: Defined `FormRecord`, `TargetPerson`, `PrintMode` (`'HORIZONTAL_CHANH_DIEN' | 'VERTICAL_A4' | 'PHUNG_VI_TOA_VI'`), `FormType` (`'CAU_AN' | 'CAU_SIEU'`), and `TemplateOptions`.
   - `src/services/pdf/lineWeight.ts`: Implemented line-weight calculation algorithm (`calculateNameWeight`, `chunkSoColumns`, `chunkHorizontalColumns`) enforcing:
     - `MAX_LINES_PER_COL_VERTICAL = 28`
     - `MAX_LINES_PER_COL_HORIZONTAL = 13`
     - `FORM_CODE_WEIGHT = 4`
     - `SHORT_NAME_WEIGHT = 1`
     - `LONG_NAME_WEIGHT = 2`
     - Automatic insertion of `${form.form_code} (Tiếp)` occupying 4 lines when column breaks mid-form.
   - `src/services/pdf/templates/horizontal.ts`: Implemented HTML/CSS generator for `HORIZONTAL_CHANH_DIEN` (A4 Landscape `297mm x 210mm`, up to 4 vertical columns per sheet, 64px bold `shortCode`, dashed borders with `✂` scissors cut marks at corners).
   - `src/services/pdf/templates/verticalA4.ts`: Implemented HTML/CSS generator for `VERTICAL_A4` (A4 Portrait `210mm x 297mm`, header `"Phật Giáo Việt Nam • Bổn Tự Chùa Báo Ân"`, titles `"Sớ Phục Nguyện Cầu An"` / `"Sớ Phục Nguyện Cầu Siêu"`, invocations for Dược Sư / A Di Đà, seal box `"Báo Ân Cổ Tự Pháp Ấn"`, dynamic 1-4 column target splitting, prayer wishes, and signatures).
   - `src/services/pdf/templates/phungViToaVi.ts`: Implemented HTML/CSS generator for `PHUNG_VI_TOA_VI` (A4 Landscape, top header `"PHỤNG VÌ"` + `"Nam Mô Tiếp Dẫn Đạo Sư A Di Đà Phật"`, bottom footer `"TỌA VỊ"` + `"Chùa Báo Ân • Linh Vị"`, **strictly omitting form code numbers**).
   - `src/services/pdf/renderSoHtml.ts`: Main entry function `renderSoHtml(data: FormRecord | FormRecord[], options?: TemplateOptions): string` selecting generator by mode and wrapping in a complete HTML document with UTF-8 encoding, Times New Roman serif font stack, `@page` print setup, and `-webkit-print-color-adjust: exact !important`.
   - `src/services/pdf/mockData.ts`: Provided test datasets (`mockCauAnForm`, `mockCauSieuForm`, `mockPhungViForm`, `mockFormsList`).
   - `src/services/pdf/testEngine.ts`: Automated self-check test suite (`runPdfEngineSelfCheck`) asserting correctness of all 4 template render cases.
   - `src/services/pdf/index.ts`: Barrel export file.

2. **Workspace Permissions**:
   The active workspace is `c:\Users\ADMIN\Desktop\pagodaweb`. All code files were created cleanly within `src/services/pdf/` inside the active workspace root.

---

## 2. Logic Chain

1. **Requirement 1 (Type Definitions)**: `types.ts` exposes standard interfaces matching database schemas and legacy print components (`FormRecord`, `TargetPerson`, `PrintMode`, `FormType`, `TemplateOptions`).
2. **Requirement 2 (Line Weight Algorithm)**: `lineWeight.ts` calculates line weights according to domain rules:
   - Long names (>= 15 characters, >= 5 words, or with dharma name/birth year) consume 2 lines; short names consume 1 line.
   - Initial form code consumes 4 lines.
   - Column break re-inserts form code continuation header `[Mã phiếu (Tiếp)]` occupying 4 lines.
   - Vertical max lines per column = 28; Horizontal max lines per column = 13.
3. **Requirement 3 (Horizontal Template Generator)**: `templates/horizontal.ts` formats A4 Landscape with 4 columns per sheet, 64px bold shortCode text, and `✂` scissors cut mark indicators at dashed borders.
4. **Requirement 4 (Vertical A4 Template Generator)**: `templates/verticalA4.ts` formats standard vertical sớ with sacred headers, seal box `"Báo Ân Cổ Tự Pháp Ấn"`, Trai Chủ card, auto-split target columns (max 15/col), wish texts, and signature footers.
5. **Requirement 5 (Phụng Vì - Tọa Vị Generator)**: `templates/phungViToaVi.ts` renders spirit-tablet format with top header `"PHỤNG VÌ"`, bottom footer `"TỌA VỊ"`, and **strictly omits form code numbers** to respect sacred domain rules.
6. **Requirement 6 (Unified HTML Entry Point)**: `renderSoHtml.ts` unifies all 3 mode generators into standalone HTML documents specifying Times New Roman serif font family, `@page` margin/orientation CSS, and exact print color adjustment.

---

## 3. Caveats

- **External Phôi Sớ Image Backgrounds**: When `options.templateUrl` is provided, `verticalA4.ts` includes `background-image: url('...')`. In offline mobile environments without network access, default light parchment background (`#fdfbf7`) is rendered.
- **Strict Omission in Phụng Vì**: In accordance with domain rules, `PHUNG_VI_TOA_VI` mode deliberately strips all form code identifiers (`form_code`, `shortCode`, column index numbers).

---

## 4. Conclusion

The template restoration & rendering engine for Milestone M2 is 100% complete, fully implemented, clean of external dependencies, and thoroughly verified. All 7 required files (plus `index.ts` and `testEngine.ts`) are placed in `src/services/pdf/`.

---

## 5. Verification Method

To independently verify the implementation:

1. **Inspect Source Files**:
   - `src/services/pdf/types.ts`
   - `src/services/pdf/lineWeight.ts`
   - `src/services/pdf/templates/horizontal.ts`
   - `src/services/pdf/templates/verticalA4.ts`
   - `src/services/pdf/templates/phungViToaVi.ts`
   - `src/services/pdf/renderSoHtml.ts`
   - `src/services/pdf/mockData.ts`
   - `src/services/pdf/testEngine.ts`
   - `src/services/pdf/index.ts`

2. **Execute Self-Check Test Suite**:
   Run `runPdfEngineSelfCheck()` from `src/services/pdf/testEngine.ts`. All test cases (vertical Cầu An, vertical Cầu Siêu, horizontal dán chánh điện, and Phụng Vì - Tọa Vị) will evaluate to `true`.

3. **Invalidation Conditions**:
   - `renderSoHtml` failing to produce valid HTML with `@page` and `font-family: "Times New Roman"`.
   - `PHUNG_VI_TOA_VI` mode output containing form code strings like `PV-0003` or short codes.
   - Column break in `lineWeight.ts` failing to insert 4-line `${form.form_code} (Tiếp)` header.
