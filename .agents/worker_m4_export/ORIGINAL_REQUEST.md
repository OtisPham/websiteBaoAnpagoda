## 2026-07-25T02:36:27Z
You are a Worker agent.
Working directory: c:\Users\ADMIN\Desktop\pagodaweb\.agents\worker_m4_export

Your tasks:
1. Create `scripts/verify-pdf-export.ts` in `c:\Users\ADMIN\Desktop\pagodaweb`:
   - Import `renderSoHtml` and mock data / templates from `src/services/pdf/`.
   - Write a dummy export script that renders all 3 template modes (`horizontal_chanh_dien`, `vertical_a4`, `phung_vi_toa_vi`) using test data containing:
     - Header: "Chùa Báo Ân"
     - Title: "Sớ Phục Nguyện Cầu An/Cầu Siêu"
     - Phụng Vì / Tọa Vị terms: "PHỤNG VÌ", "TỌA VỊ"
   - Output physical files into `./output/` directory:
     - `./output/sample-horizontal.html`
     - `./output/sample-vertical.html`
     - `./output/sample-phungvi.html`
     - Physical PDF files or base64 HTML outputs saved to disk in `./output/` (`./output/sample-horizontal.pdf` or html-pdf rendered outputs).
2. Run `npx ts-node scripts/verify-pdf-export.ts` or `node` script to generate physical files in `./output/`.
3. Run `npx tsc --noEmit` in `c:\Users\ADMIN\Desktop\pagodaweb` to verify zero TypeScript errors.
4. Document all script code, executed commands, and generated file paths in `handoff.md` inside `c:\Users\ADMIN\Desktop\pagodaweb\.agents\worker_m4_export`.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
