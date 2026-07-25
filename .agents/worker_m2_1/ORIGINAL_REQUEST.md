## 2026-07-24T23:31:32+07:00

You are Worker 1 for Milestone M2 (Template Restoration & Engine).
Your designated working directory is c:\Users\ADMIN\Desktop\pagodaweb\.agents\worker_m2_1. Please maintain your progress.md and write your handoff.md there.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Task details:
1. Target workspace: `c:\Users\ADMIN\Desktop\pagoda-app`.
2. Reference findings from Explorer reports in `c:\Users\ADMIN\Desktop\pagodaweb\.agents\explorer_m1_1/` and `explorer_m1_3/`.
3. Create/Implement the template rendering engine in `c:\Users\ADMIN\Desktop\pagoda-app\src\services\pdf\`:
   - `types.ts`: Define `FormRecord`, `TargetPerson`, `PrintMode` (`'HORIZONTAL_CHANH_DIEN' | 'VERTICAL_A4' | 'PHUNG_VI_TOA_VI'`), `FormType` (`'CAU_AN' | 'CAU_SIEU'`), `TemplateOptions`.
   - `lineWeight.ts`: Implement line-weight calculation and auto column splitting (Max 28 lines per col or 13 lines/col for horizontal, form code weight = 4, long name = 2, short name = 1).
   - `templates/horizontal.ts`: HTML/CSS generator for Horizontal / Ngang dán chánh điện (A4 Landscape, 4 vertical columns per sheet, 64px bold form code, dashed borders with ✂ scissors marks).
   - `templates/verticalA4.ts`: HTML/CSS generator for Vertical A4 / Dọc A4 (A4 Portrait, header "Phật Giáo Việt Nam • Bổn Tự Chùa Báo Ân", titles "Sớ Phục Nguyện Cầu An" / "Sớ Phục Nguyện Cầu Siêu", invocations, target lists, seal "Báo Ân Cổ Tự Pháp Ấn").
   - `templates/phungViToaVi.ts`: HTML/CSS generator for Phụng Vì - Tọa Vị (A4 Landscape, top header "PHỤNG VÌ" + "Nam Mô Tiếp Dẫn Đạo Sư A Di Đà Phật", bottom footer "TỌA VỊ" + "Chùa Báo Ân • Linh Vị", strictly omitting form code numbers).
   - `renderSoHtml.ts`: Main entry function `renderSoHtml(data: FormRecord, options: TemplateOptions): string` that selects the mode generator and returns complete standalone HTML string with CSS styles, font-family ("Times New Roman", serif), `@page` print setup, and `-webkit-print-color-adjust: exact !important`.
   - `mockData.ts`: Provide mock data for Cầu An, Cầu Siêu, and Phụng Vì modes for testing.
4. Verify TypeScript passes clean for the newly added files.
5. Record your work in `c:\Users\ADMIN\Desktop\pagodaweb\.agents\worker_m2_1\handoff.md` and send a message back with your verification results.
