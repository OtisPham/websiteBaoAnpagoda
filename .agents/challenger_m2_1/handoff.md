# Handoff Report — Milestone M2: PDF Template Engine Verification

## 1. Observation

### Codebase Inspection & Paths
- **Template Engine Core Files**:
  - Main Renderer: `c:\Users\ADMIN\Desktop\pagodaweb\src\services\pdf\renderSoHtml.ts`
  - Types Definition: `c:\Users\ADMIN\Desktop\pagodaweb\src\services\pdf\types.ts`
  - Line-Weight Layout Engine: `c:\Users\ADMIN\Desktop\pagodaweb\src\services\pdf\lineWeight.ts`
  - Vertical A4 Generator: `c:\Users\ADMIN\Desktop\pagodaweb\src\services\pdf\templates\verticalA4.ts`
  - Horizontal Generator: `c:\Users\ADMIN\Desktop\pagodaweb\src\services\pdf\templates\horizontal.ts`
  - Phụng Vì - Tọa Vị Generator: `c:\Users\ADMIN\Desktop\pagodaweb\src\services\pdf\templates\phungViToaVi.ts`
  - Pre-existing Engine Self-Check: `c:\Users\ADMIN\Desktop\pagodaweb\src\services\pdf\testEngine.ts`
  - Challenger Test Suite: `c:\Users\ADMIN\Desktop\pagodaweb\src\services\pdf\runChallengerTest.ts`

### Code Architecture & Verbatim Snippets
1. **Line-Weight Column Chunking (`lineWeight.ts`)**:
   - `MAX_LINES_PER_COL_VERTICAL = 28` (lines 3)
   - `FORM_CODE_WEIGHT = 4`, `SHORT_NAME_WEIGHT = 1`, `LONG_NAME_WEIGHT = 2` (lines 7-9)
   - In `chunkSoColumns` (lines 95-105):
     ```ts
     if (currentColumn.totalLines + weight > maxLinesPerCol) {
       startNewColumn();
       addLineToColumn({
         type: 'FORM_CODE_CONTINUED',
         text: `${form.form_code} (Tiếp)`,
         linesUsed: FORM_CODE_WEIGHT,
         formCode: form.form_code,
       });
     }
     ```
   - In `chunkHorizontalColumns` (lines 144-145):
     ```ts
     const shortCode = form.form_code ? form.form_code.slice(-3) : '';
     const actualTargets = (form.targets || []).filter((t) => t.relation !== 'TRAI_CHU');
     ```

2. **Vertical A4 Template Rendering (`templates/verticalA4.ts`)**:
   - Grid layout generation (line 49):
     ```ts
     const gridColsCss = `display: grid; grid-template-columns: repeat(${soColumns.length}, minmax(0, 1fr)); gap: 16px 12px;`;
     ```
   - Continuation header handling (lines 55-60):
     ```ts
     if (line.type === 'FORM_CODE' || line.type === 'FORM_CODE_CONTINUED') {
       return `
         <div style="font-weight: bold; color: #78350f; font-size: 12px; padding: 4px 0; border-bottom: 1px dashed rgba(120, 53, 15, 0.4); margin-bottom: 4px;">
           ${escapeHtml(line.text)}
         </div>`;
     }
     ```

3. **Horizontal Chánh Điện Template (`templates/horizontal.ts`)**:
   - Short code header rendering (lines 57-59):
     ```ts
     <div style="font-size: 64px; font-weight: bold; line-height: 1; margin-bottom: 24px; color: #000000; text-align: center; letter-spacing: -0.05em;">
       ${escapeHtml(col.shortCode)}
     </div>
     ```

4. **Phụng Vì - Tọa Vị Template (`templates/phungViToaVi.ts`)**:
   - Form Code Omission (lines 57-81):
     - Top section contains `PHỤNG VÌ` header and `Nam Mô Tiếp Dẫn Đạo Sư A Di Đà Phật`.
     - Bottom section contains `TỌA VỊ` header and `Chùa Báo Ân • Linh Vị`.
     - Zero references to `col.shortCode` or `col.formCode`.

---

## 2. Logic Chain

1. **Edge Case 1: Vertical A4 Mode (Single, Multiple, 30+ Targets)**
   - *Observation*: `chunkSoColumns` limits column height to 28 line units (`MAX_LINES_PER_COL_VERTICAL = 28`). Initial form code consumes 4 units, long names consume 2 units, short names consume 1 unit.
   - *Reasoning*: For 35 targets (each consuming 2 line units for long names + dharma names), Column 1 fills up after 12 targets (4 + 24 = 28 lines). `startNewColumn()` triggers and inserts a `FORM_CODE_CONTINUED` line (`CA-9035 (Tiếp)`), consuming 4 units in Column 2. Column 2 fills up after 12 targets, triggering Column 3 for targets 25..35.
   - *Result*: The rendered HTML dynamically allocates 3 CSS grid columns (`grid-template-columns: repeat(3, minmax(0, 1fr))`). Target #35 (`Nguyễn Thị Hạnh Phúc Thọ 35`) is successfully rendered in column 3. Continuation headers `CA-9035 (Tiếp)` correctly appear at the top of columns 2 and 3.

2. **Edge Case 2: Horizontal Mode (Empty Form Codes, Long Family Names, Vietnamese Diacritics)**
   - *Observation*: In `chunkHorizontalColumns`, `shortCode = form.form_code ? form.form_code.slice(-3) : ''`. In `generateHorizontalTemplate`, `escapeHtml(col.shortCode)` is used.
   - *Reasoning*: When `form_code` is empty string (`""`), `shortCode` evaluates to `""`. `escapeHtml("")` returns `""`. The 64px header `<div>` renders safely as empty without runtime exceptions.
   - *Reasoning*: Long family names (e.g. 50 characters, 9 words) trigger `LONG_NAME_WEIGHT` = 2 in `chunkHorizontalColumns`, correctly reserving 2 line units out of 13 line units max per column. In HTML, uppercase transformation (`text-transform: uppercase`) applies cleanly.
   - *Reasoning*: Vietnamese diacritics (`Đ, ơ, â, ự, ễ, ỉ, ỏ, ế, ố, ỵ, ứ...`) pass through `escapeHtml` untouched because `escapeHtml` only targets XML special characters (`&, <, >, ", '`). The HTML head specifies `<meta charset="UTF-8" />`, preserving full UTF-8 character integrity.

3. **Edge Case 3: Phụng Vì - Tọa Vị Mode (Omission of Form Codes)**
   - *Observation*: In `generatePhungViToaViTemplate`, `col.names` are rendered into spirit-tablet cards. Neither `col.shortCode` nor `col.formCode` is referenced anywhere in the string template.
   - *Reasoning*: Even when forms with codes like `PV-9999` are provided, the template engine completely omits form codes and short codes, rendering strictly:
     - Header: `PHỤNG VÌ` + `Nam Mô Tiếp Dẫn Đạo Sư A Di Đà Phật`
     - Center: Target names in uppercase Times New Roman
     - Footer: `TỌA VỊ` + `Chùa Báo Ân • Linh Vị`
   - *Result*: Strict omission requirement passed.

4. **HTML Structural & Inline CSS Validity**
   - *Observation*: `renderSoHtml` wraps generated body HTML in a standard HTML5 shell (`<!DOCTYPE html><html lang="vi"><head>...</head><body>...</body></html>`).
   - *Reasoning*: Static parse validation of all tags (`div`, `p`, `span`, `h2`, `h3`, `style`, `head`, `body`, `html`) confirms 100% tag matching balance with no unclosed or misplaced tags.
   - *Reasoning*: Inline CSS rules use valid property syntax (`style="display: grid; grid-template-columns: repeat(N, minmax(0, 1fr)); ..."`). No `undefined` or `NaN` values occur in dynamic style strings.

---

## 3. Caveats

- **Print Spooler PDF Render Engine Dependencies**: CSS `@page` rules (`size: A4 portrait`, `size: A4 landscape`) rely on standard chromium/headless-chrome HTML-to-PDF print engines (e.g., Puppeteer, Playwright, or browser print dialog). On non-Chromium print drivers, custom CSS margins may require page margin tuning.
- **Extreme Target Counts (>100 targets in single Vertical A4 form)**: For extremely large target lists (>100 targets in a single form), all columns are currently rendered inside a single A4 portrait page grid container (`repeat(N, minmax(0, 1fr))`). While 30-40 targets fit gracefully in 3-4 columns, 100+ targets in a single form could cause narrow columns. (In typical temple usage, forms rarely exceed 30 targets).

---

## 4. Conclusion

**Verdict: VERIFIED AND APPROVED (PASS)**

The PDF template rendering engine in `src/services/pdf/` is empirically robust, well-structured, and fully satisfies all M2 functional requirements:
1. **Vertical A4 Mode**: Line-weight column splitting gracefully handles single, multiple, and 30+ targets, correctly adding `(Tiếp)` continuation headers.
2. **Horizontal Mode**: Accurately handles empty form codes, long family names, and special Vietnamese diacritical marks.
3. **Phụng Vì - Tọa Vị Mode**: Strictly omits all form codes while rendering `PHỤNG VÌ` and `TỌA VỊ` titles.
4. **HTML Validity**: Valid HTML5 document structure, clean tag closing, and valid inline CSS.

---

## 5. Verification Method

To independently verify the PDF template rendering engine and test runner:

1. **Inspect Test Runner File**:
   - File path: `c:\Users\ADMIN\Desktop\pagodaweb\src\services\pdf\runChallengerTest.ts`
2. **Execute Test Runner via Node/TSX**:
   - Command: `npx tsx src/services/pdf/runChallengerTest.ts`
   - Working Directory: `c:\Users\ADMIN\Desktop\pagodaweb`
3. **Expected Output**:
   ```
   === STARTING EMPIRICAL CHALLENGER TESTS (MILESTONE M2) ===

   [PASS] [EdgeCase1_VerticalA4] Single Target Rendering: Target found. HTML valid: true
   [PASS] [EdgeCase1_VerticalA4] Multiple Targets (10 targets): 10 targets rendered. HTML valid: true
   [PASS] [EdgeCase1_VerticalA4] 30+ Targets Line-Weight Splitting & Continuation Header: Columns generated: 3. Has '(Tiếp)': true. Has last target (#35): true. HTML valid: true
   [PASS] [EdgeCase2_Horizontal] Empty Form Code Handling: Empty form_code handled without crash. Output contains name. HTML valid: true
   [PASS] [EdgeCase2_Horizontal] Long Family Names & Vietnamese Diacritics: ShortCode 888 found: true. Long name found: true. Diacritics preserved: true. HTML valid: true
   [PASS] [EdgeCase3_PhungViToaVi] Strict Form Code Omission & Header/Footer Titles: PHỤNG VÌ: true, TỌA VỊ: true, Linh Vị: true, FormCode Omitted: true, ShortCode Omitted: true. HTML valid: true

   === EMPIRICAL TEST SUMMARY: 6/6 TESTS PASSED ===
   ```
4. **Invalidation Conditions**:
   - Failure of any tag balancing check (unclosed HTML tag).
   - Form code appearing in `PHUNG_VI_TOA_VI` mode.
   - Crash or `NaN` / `undefined` string in CSS properties during rendering of empty or large forms.
