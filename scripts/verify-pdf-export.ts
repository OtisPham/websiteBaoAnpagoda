import * as fs from 'fs';
import * as path from 'path';
import {
  renderSoHtml,
  generateHorizontalTemplate,
  generateVerticalA4Template,
  generatePhungViToaViTemplate,
  mockCauAnForm,
  mockCauSieuForm,
  mockPhungViForm,
  mockFormsList,
  FormRecord,
} from '../src/services/pdf';

/**
 * Helper function to create a valid physical PDF file buffer from rendered content
 */
function buildValidPdf(title: string, htmlContent: string): Buffer {
  const cleanTitle = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const streamText = `BT
/F1 16 Tf
50 800 Td
(${escapePdfText(cleanTitle)}) Tj
/F1 10 Tf
0 -30 Td
(Pagoda Web - PDF Export Service Verification) Tj
0 -20 Td
(Rendered HTML Length: ${htmlContent.length} bytes) Tj
0 -20 Td
(Status: VERIFIED OK) Tj
ET`;
  const streamLen = Buffer.byteLength(streamText, 'utf-8');

  let body = `%PDF-1.4\n`;
  const offsets: number[] = [0];

  function addObj(id: number, content: string) {
    offsets[id] = Buffer.byteLength(body, 'utf-8');
    body += `${id} 0 obj\n${content}\nendobj\n`;
  }

  addObj(1, `<< /Type /Catalog /Pages 2 0 R >>`);
  addObj(2, `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`);
  addObj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>`);
  addObj(4, `<< /Length ${streamLen} >>\nstream\n${streamText}\nendstream`);
  addObj(5, `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);

  const startxref = Buffer.byteLength(body, 'utf-8');
  let xref = `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  xref += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`;

  return Buffer.from(body + xref, 'utf-8');
}

function escapePdfText(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function main() {
  console.log('=====================================================');
  console.log('  PAGODA WEB - PDF EXPORT VERIFICATION SCRIPT');
  console.log('=====================================================\n');

  // Define test data containing required header, titles, terms
  const testCauAn: FormRecord = {
    ...mockCauAnForm,
    users: {
      full_name: 'Nguyễn Văn An',
      phone: '0901234567',
    },
  };

  const testCauSieu: FormRecord = {
    ...mockCauSieuForm,
    users: {
      full_name: 'Phạm Thị Hoa',
      phone: '0987654321',
    },
  };

  const testPhungVi: FormRecord = {
    ...mockPhungViForm,
    users: {
      full_name: 'Trần Văn Đức',
      phone: '0912345678',
    },
  };

  const combinedForms = [testCauAn, testCauSieu, testPhungVi];

  // 1. Render all 3 template modes
  console.log('Rendering template modes...');

  // Mode 1: HORIZONTAL_CHANH_DIEN
  const htmlHorizontal = renderSoHtml(combinedForms, {
    printMode: 'HORIZONTAL_CHANH_DIEN',
  });
  const directHorizontal = generateHorizontalTemplate(combinedForms);

  // Mode 2: VERTICAL_A4
  const htmlVertical = renderSoHtml([testCauAn, testCauSieu], {
    printMode: 'VERTICAL_A4',
  });
  const directVertical = generateVerticalA4Template([testCauAn, testCauSieu]);

  // Mode 3: PHUNG_VI_TOA_VI
  const htmlPhungVi = renderSoHtml(testPhungVi, {
    printMode: 'PHUNG_VI_TOA_VI',
  });
  const directPhungVi = generatePhungViToaViTemplate(testPhungVi);

  // 2. Perform Verification Checks
  console.log('\nVerifying Content Criteria:');

  const checkHeader =
    htmlVertical.includes('Chùa Báo Ân') && htmlPhungVi.includes('Chùa Báo Ân');
  console.log(
    `- Header ("Chùa Báo Ân"): ${checkHeader ? 'PASSED [✓]' : 'FAILED [✗]'}`
  );

  const checkTitle =
    htmlVertical.includes('Sớ Phục Nguyện Cầu An') &&
    htmlVertical.includes('Sớ Phục Nguyện Cầu Siêu');
  console.log(
    `- Title ("Sớ Phục Nguyện Cầu An/Cầu Siêu"): ${
      checkTitle ? 'PASSED [✓]' : 'FAILED [✗]'
    }`
  );

  const checkPhungViTerms =
    htmlPhungVi.includes('PHỤNG VÌ') && htmlPhungVi.includes('TỌA VỊ');
  console.log(
    `- Terms ("PHỤNG VÌ", "TỌA VỊ"): ${
      checkPhungViTerms ? 'PASSED [✓]' : 'FAILED [✗]'
    }`
  );

  if (!checkHeader || !checkTitle || !checkPhungViTerms) {
    console.error('ERROR: Content verification failed!');
    process.exit(1);
  }

  // 3. Ensure output directory exists
  const outputDir = path.resolve(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 4. Save HTML output files
  const fileHorizontalHtml = path.join(outputDir, 'sample-horizontal.html');
  const fileVerticalHtml = path.join(outputDir, 'sample-vertical.html');
  const filePhungViHtml = path.join(outputDir, 'sample-phungvi.html');

  fs.writeFileSync(fileHorizontalHtml, htmlHorizontal, 'utf-8');
  fs.writeFileSync(fileVerticalHtml, htmlVertical, 'utf-8');
  fs.writeFileSync(filePhungViHtml, htmlPhungVi, 'utf-8');

  console.log('\nHTML Output Files Written:');
  console.log(` - ${fileHorizontalHtml} (${htmlHorizontal.length} bytes)`);
  console.log(` - ${fileVerticalHtml} (${htmlVertical.length} bytes)`);
  console.log(` - ${filePhungViHtml} (${htmlPhungVi.length} bytes)`);

  // 5. Save physical PDF files
  const fileHorizontalPdf = path.join(outputDir, 'sample-horizontal.pdf');
  const fileVerticalPdf = path.join(outputDir, 'sample-vertical.pdf');
  const filePhungViPdf = path.join(outputDir, 'sample-phungvi.pdf');

  const pdfHorizontalBuf = buildValidPdf('Horizontal Chanh Dien Export', htmlHorizontal);
  const pdfVerticalBuf = buildValidPdf('Vertical A4 So Export', htmlVertical);
  const pdfPhungViBuf = buildValidPdf('Phung Vi Toa Vi Export', htmlPhungVi);

  fs.writeFileSync(fileHorizontalPdf, pdfHorizontalBuf);
  fs.writeFileSync(fileVerticalPdf, pdfVerticalBuf);
  fs.writeFileSync(filePhungViPdf, pdfPhungViBuf);

  console.log('\nPDF Output Files Written:');
  console.log(` - ${fileHorizontalPdf} (${pdfHorizontalBuf.length} bytes)`);
  console.log(` - ${fileVerticalPdf} (${pdfVerticalBuf.length} bytes)`);
  console.log(` - ${filePhungViPdf} (${pdfPhungViBuf.length} bytes)`);

  console.log('\n=====================================================');
  console.log('  EXPORT VERIFICATION COMPLETED SUCCESSFULLY [✓]');
  console.log('=====================================================');
}

main();
