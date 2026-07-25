import { renderSoHtml } from './renderSoHtml';
import { FormRecord, TargetPerson } from './types';
import { chunkSoColumns, chunkHorizontalColumns } from './lineWeight';

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  details: string;
}

const testResults: TestResult[] = [];

function recordResult(category: string, name: string, passed: boolean, details: string) {
  testResults.push({ category, name, passed, details });
  const statusStr = passed ? '[PASS]' : '[FAIL]';
  console.log(`${statusStr} [${category}] ${name}: ${details}`);
}

// Simple HTML validator to check tag balance and unclosed elements
function checkHtmlValidity(html: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check basic outer structure
  if (!html.startsWith('<!DOCTYPE html>')) {
    errors.push('Missing <!DOCTYPE html> preamble');
  }
  if (!html.includes('<html') || !html.includes('</html>')) {
    errors.push('Missing or unclosed <html> tag');
  }
  if (!html.includes('<head>') || !html.includes('</head>')) {
    errors.push('Missing or unclosed <head> tag');
  }
  if (!html.includes('<body>') || !html.includes('</body>')) {
    errors.push('Missing or unclosed <body> tag');
  }

  // Tag stack check for key tags: div, p, span, h2, h3, style, head, body, html
  const stack: string[] = [];
  // Regex to match HTML start/end tags (ignoring self-closing like <meta />, <br />, <hr />)
  const tagRegex = /<\/?([a-zA-Z0-9]+)(?:\s+[^>]*?)?(?:\/)?>/g;
  const selfClosing = new Set(['meta', 'link', 'img', 'br', 'hr', 'input']);

  let match;
  while ((match = tagRegex.exec(html)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();

    if (selfClosing.has(tagName) || fullTag.endsWith('/>')) {
      continue;
    }

    if (fullTag.startsWith('</')) {
      // Closing tag
      if (stack.length === 0) {
        errors.push(`Unexpected closing tag </${tagName}> without matching opening tag`);
      } else {
        const top = stack.pop();
        if (top !== tagName) {
          errors.push(`Mismatched closing tag </${tagName}>, expected </${top}>`);
        }
      }
    } else if (!fullTag.startsWith('<?') && !fullTag.startsWith('<!')) {
      // Opening tag
      stack.push(tagName);
    }
  }

  if (stack.length > 0) {
    errors.push(`Unclosed tags remaining in stack: ${stack.join(', ')}`);
  }

  // Check inline CSS syntax errors (e.g. NaN or undefined in style attributes)
  const styleAttrRegex = /style="([^"]*)"/g;
  let styleMatch;
  while ((styleMatch = styleAttrRegex.exec(html)) !== null) {
    const styleContent = styleMatch[1];
    if (styleContent.includes('undefined') || styleContent.includes('NaN')) {
      errors.push(`Invalid inline CSS value detected in style="${styleContent}"`);
    }
  }

  return { isValid: errors.length === 0, errors };
}

export function executeChallengerTests() {
  console.log('=== STARTING EMPIRICAL CHALLENGER TESTS (MILESTONE M2) ===\n');

  // =========================================================================
  // EDGE CASE 1: Vertical A4 Mode (Single, Multiple, 30+ Targets)
  // =========================================================================
  
  // 1.1 Single Target
  const singleTargetForm: FormRecord = {
    id: 'form-v-single',
    form_code: 'CA-0010',
    form_type: 'CAU_AN',
    status: 'COMPLETED',
    is_delegated: false,
    scheduled_date: '2026-07-25',
    selected_time_slot: '08:00',
    users: { full_name: 'Nguyễn Văn A', phone: '0901234567' },
    targets: [
      { id: 't1', full_name: 'Nguyễn Văn Single', dharma_name: 'Tâm An', birth_year: 1985, relation: 'BẢN THÂN', type: 'CAU_AN' }
    ]
  };

  const htmlSingleV = renderSoHtml(singleTargetForm, { printMode: 'VERTICAL_A4' });
  const hasSingleTarget = htmlSingleV.includes('Nguyễn Văn Single') && htmlSingleV.includes('CA-0010');
  const validSingleV = checkHtmlValidity(htmlSingleV);
  recordResult(
    'EdgeCase1_VerticalA4',
    'Single Target Rendering',
    hasSingleTarget && validSingleV.isValid,
    hasSingleTarget ? `Target found. HTML valid: ${validSingleV.isValid}` : `Failed target search or invalid HTML: ${validSingleV.errors.join('; ')}`
  );

  // 1.2 Multiple Targets (10 targets)
  const multiTargets: TargetPerson[] = Array.from({ length: 10 }, (_, i) => ({
    id: `t-multi-${i + 1}`,
    full_name: `Phật Tử Nam ${i + 1}`,
    dharma_name: `Nguyên ${i + 1}`,
    birth_year: 1970 + i,
    relation: i === 0 ? 'TRAI_CHU' : 'CON',
    type: 'CAU_AN'
  }));

  const multiTargetForm: FormRecord = {
    ...singleTargetForm,
    id: 'form-v-multi',
    form_code: 'CA-0020',
    targets: multiTargets
  };

  const htmlMultiV = renderSoHtml(multiTargetForm, { printMode: 'VERTICAL_A4' });
  const hasMultiTargets = htmlMultiV.includes('Phật Tử Nam 10') && htmlMultiV.includes('Trai Chủ / Gia Chủ');
  const validMultiV = checkHtmlValidity(htmlMultiV);
  recordResult(
    'EdgeCase1_VerticalA4',
    'Multiple Targets (10 targets)',
    hasMultiTargets && validMultiV.isValid,
    hasMultiTargets ? `10 targets rendered. HTML valid: ${validMultiV.isValid}` : `Multi target check failed: ${validMultiV.errors.join('; ')}`
  );

  // 1.3 30+ Targets (35 targets) - Line-weight splitting & Continuation Header
  const largeTargets: TargetPerson[] = Array.from({ length: 35 }, (_, i) => ({
    id: `t-large-${i + 1}`,
    full_name: `Nguyễn Thị Hạnh Phúc Thọ ${i + 1}`,
    dharma_name: `Diệu ${i + 1}`,
    birth_year: 1960 + (i % 40),
    relation: 'HƯƠNG LINH',
    type: 'CAU_AN'
  }));

  const largeTargetForm: FormRecord = {
    ...singleTargetForm,
    id: 'form-v-35',
    form_code: 'CA-9035',
    targets: largeTargets
  };

  const htmlLargeV = renderSoHtml(largeTargetForm, { printMode: 'VERTICAL_A4' });
  const hasContinuedHeader = htmlLargeV.includes('CA-9035 (Tiếp)');
  const hasTarget35 = htmlLargeV.includes('Nguyễn Thị Hạnh Phúc Thọ 35');
  const validLargeV = checkHtmlValidity(htmlLargeV);

  // Check column counts
  const columnsCalculated = chunkSoColumns([{ ...largeTargetForm, targets: largeTargets }]);

  recordResult(
    'EdgeCase1_VerticalA4',
    '30+ Targets Line-Weight Splitting & Continuation Header',
    hasContinuedHeader && hasTarget35 && validLargeV.isValid,
    `Columns generated: ${columnsCalculated.length}. Has '(Tiếp)': ${hasContinuedHeader}. Has last target (#35): ${hasTarget35}. HTML valid: ${validLargeV.isValid}`
  );


  // =========================================================================
  // EDGE CASE 2: Horizontal Mode (Empty Form Codes, Long Names, Diacritics)
  // =========================================================================

  // 2.1 Empty Form Codes
  const emptyCodeForm: FormRecord = {
    id: 'form-h-empty',
    form_code: '',
    form_type: 'CAU_SIEU',
    status: 'PENDING',
    is_delegated: true,
    scheduled_date: '2026-07-25',
    targets: [
      { id: 'th1', full_name: 'Lê Văn Bình', dharma_name: 'Tịnh Tâm', type: 'CAU_SIEU' }
    ]
  };

  const htmlEmptyCodeH = renderSoHtml(emptyCodeForm, { printMode: 'HORIZONTAL_CHANH_DIEN' });
  const validEmptyCodeH = checkHtmlValidity(htmlEmptyCodeH);
  const doesNotCrashEmptyCode = htmlEmptyCodeH.includes('horizontal-col') && htmlEmptyCodeH.includes('LÊ VĂN BÌNH');
  recordResult(
    'EdgeCase2_Horizontal',
    'Empty Form Code Handling',
    doesNotCrashEmptyCode && validEmptyCodeH.isValid,
    `Empty form_code handled without crash. Output contains name. HTML valid: ${validEmptyCodeH.isValid}`
  );

  // 2.2 Long Family Names & 2.3 Special Vietnamese Diacritics
  const complexNamesTargets: TargetPerson[] = [
    { id: 'th-long1', full_name: 'Nguyễn Trần Huyền Tôn Nữ Hoàng Thị Ngọc Minh Châu', dharma_name: 'Diệu Hương Thảo', type: 'CAU_AN' },
    { id: 'th-dia1', full_name: 'Đặng Huỳnh Như Ý Ơn Ân Thượng', type: 'CAU_AN' },
    { id: 'th-dia2', full_name: 'Phan Nguyễn Triệu Vũ Thích Nữ Diệu Hạnh', type: 'CAU_AN' },
    { id: 'th-dia3', full_name: 'Hồ THỊ NGHĨA Trần Vũ Hoài Phương', type: 'CAU_AN' }
  ];

  const complexHorizontalForm: FormRecord = {
    id: 'form-h-complex',
    form_code: 'CS-8888',
    form_type: 'CAU_SIEU',
    status: 'COMPLETED',
    is_delegated: false,
    scheduled_date: '2026-07-25',
    targets: complexNamesTargets
  };

  const htmlComplexH = renderSoHtml(complexHorizontalForm, { printMode: 'HORIZONTAL_CHANH_DIEN' });
  const validComplexH = checkHtmlValidity(htmlComplexH);
  
  const hasShortCode = htmlComplexH.includes('888');
  const hasDiacritics1 = htmlComplexH.includes('ĐẶNG HUỲNH NHƯ Ý ƠN ÂN THƯỢNG');
  const hasLongName = htmlComplexH.includes('NGUYỄN TRẦN HUYỀN TÔN NỮ HOÀNG THỊ NGỌC MINH CHÂU');

  recordResult(
    'EdgeCase2_Horizontal',
    'Long Family Names & Vietnamese Diacritics',
    hasShortCode && hasDiacritics1 && hasLongName && validComplexH.isValid,
    `ShortCode 888 found: ${hasShortCode}. Long name found: ${hasLongName}. Diacritics preserved: ${hasDiacritics1}. HTML valid: ${validComplexH.isValid}`
  );


  // =========================================================================
  // EDGE CASE 3: Phụng Vì - Tọa Vị Mode (Omission of Form Codes)
  // =========================================================================

  const phungViForm: FormRecord = {
    id: 'form-pv-001',
    form_code: 'PV-9999',
    form_type: 'CAU_SIEU',
    status: 'COMPLETED',
    is_delegated: false,
    scheduled_date: '2026-07-25',
    targets: [
      { id: 'tpv1', full_name: 'Thích Thanh Từ', dharma_name: 'Thiền Sư', type: 'CAU_SIEU' },
      { id: 'tpv2', full_name: 'Trần Thái Tông', dharma_name: 'Định Tue', type: 'CAU_SIEU' }
    ]
  };

  const htmlPhungVi = renderSoHtml(phungViForm, { printMode: 'PHUNG_VI_TOA_VI' });
  const validPhungVi = checkHtmlValidity(htmlPhungVi);

  const hasPhungViText = htmlPhungVi.includes('PHỤNG VÌ');
  const hasToaViText = htmlPhungVi.includes('TỌA VỊ');
  const hasLinhViText = htmlPhungVi.includes('Chùa Báo Ân • Linh Vị');
  const omittedFormCode = !htmlPhungVi.includes('PV-9999');
  const omittedShortCode = !htmlPhungVi.includes('999');

  const phungViPassed = hasPhungViText && hasToaViText && hasLinhViText && omittedFormCode && omittedShortCode && validPhungVi.isValid;

  recordResult(
    'EdgeCase3_PhungViToaVi',
    'Strict Form Code Omission & Header/Footer Titles',
    phungViPassed,
    `PHỤNG VÌ: ${hasPhungViText}, TỌA VỊ: ${hasToaViText}, Linh Vị: ${hasLinhViText}, FormCode Omitted: ${omittedFormCode}, ShortCode Omitted: ${omittedShortCode}. HTML valid: ${validPhungVi.isValid}`
  );


  // =========================================================================
  // STRUCTURAL & CSS VALIDITY SUMMARY
  // =========================================================================

  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.passed).length;
  const allPassed = totalTests === passedTests;

  console.log(`\n=== EMPIRICAL TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED ===`);

  return {
    success: allPassed,
    total: totalTests,
    passed: passedTests,
    results: testResults
  };
}

if (require.main === module) {
  executeChallengerTests();
}
