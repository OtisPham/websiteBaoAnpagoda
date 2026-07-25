## 2026-07-24T16:36:54Z
You are Reviewer 2 for Milestone M2 (Template Restoration & Engine).
Your designated working directory is c:\Users\ADMIN\Desktop\pagodaweb\.agents\reviewer_m2_2. Please write your review report and handoff.md there.

Your mission:
1. Review the template implementation in `c:\Users\ADMIN\Desktop\pagoda-app\src\services\pdf\` against the original Next.js legacy specifications (`PrintStation.tsx` and legacy templates in `pagodaweb`).
2. Verify that all 3 modes strictly follow requirements:
   - Horizontal: A4 Landscape, 4 vertical columns per page, 64px bold shortCode, dashed borders with ✂.
   - Vertical A4: A4 Portrait, header "Phật Giáo Việt Nam • Bổn Tự Chùa Báo Ân", titles "Sớ Phục Nguyện Cầu An" / "Sớ Phục Nguyện Cầu Siêu", seal "Báo Ân Cổ Tự Pháp Ấn".
   - Phụng Vì - Tọa Vị: A4 Landscape, top header "PHỤNG VÌ", bottom footer "TỌA VỊ", strictly omitting form codes.
3. Test line-weight column overflow calculations and Vietnamese diacritic text formatting.
4. Record your findings in `c:\Users\ADMIN\Desktop\pagodaweb\.agents\reviewer_m2_2\handoff.md` and send a message back with your verdict (PASS/FAIL + rationale).
