import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table, 
  TableRow, 
  TableCell, 
  BorderStyle, 
  WidthType, 
  AlignmentType,
  PageOrientation,
  convertMillimetersToTwip,
  VerticalAlign,
  Header,
  ImageRun
} from 'docx';
import { saveAs } from 'file-saver';

// Loại bỏ những imports nội bộ nếu không tương thích browser,
// chúng ta nhận data thuần từ PrintStation

export const generateSoDocxFromUI = async (
  selectedForms: any[], 
  printMode: 'READING' | 'POSTER' | 'PHUNG_VI',
  selectedTemplateUrl?: string
) => {
  let backgroundImageBuffer: ArrayBuffer | null = null;
  
  if (selectedTemplateUrl) {
    try {
      // Tải ảnh nền dưới dạng ArrayBuffer từ trình duyệt
      const res = await fetch(selectedTemplateUrl);
      backgroundImageBuffer = await res.arrayBuffer();
    } catch (e) {
      console.warn("Không thể tải ảnh nền", e);
    }
  }

  const sections: any[] = [];
  const A4_WIDTH_PX = 794;
  const A4_HEIGHT_PX = 1123;

  // Kích thước chuẩn Letter ngang (của mẫu dán chánh điện / phụng vì) theo mẫu gốc
  const LETTER_LANDSCAPE_WIDTH_PX = 1056; // 279.4mm
  const LETTER_LANDSCAPE_HEIGHT_PX = 816; // 215.9mm

  if (printMode === 'READING') {
    // Chế độ A4 DỌC
    for (const form of selectedForms) {
      const traiChuTarget = form.targets.find((t: any) => t.relation === 'TRAI_CHU');
      const traiChuName = traiChuTarget ? traiChuTarget.full_name : form.users?.full_name;
      const traiChuDharma = traiChuTarget?.dharma_name;
      const actualTargets = form.targets.filter((t: any) => t.relation !== 'TRAI_CHU');

      const isCauAn = form.form_type === 'CAU_AN';

      // Xây dựng Header để chèn ảnh nền (phủ toàn bộ trang A4)
      let headers = {};
      if (backgroundImageBuffer) {
        headers = {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: backgroundImageBuffer,
                    transformation: {
                      width: A4_WIDTH_PX,
                      height: A4_HEIGHT_PX,
                    },
                    type: 'png',
                    floating: {
                      horizontalPosition: { offset: 0 },
                      verticalPosition: { offset: 0 },
                      behindDocument: true, // Chìm dưới chữ
                    }
                  })
                ]
              })
            ]
          })
        };
      }

      // Chia cột cho danh sách mục tiêu
      const MAX_LINES_PER_COL = 17;
      const cols: any[][] = [];
      let currentCol: any[] = [];
      let currentLines = 0;

      actualTargets.forEach((t: any) => {
        const name = t.full_name.trim();
        // Bỏ logic tính wordCount >= 4 thì 2 dòng, vì trên Word 1 dòng đủ dài để chứa tên
        const linesNeeded = 1;
        if (currentLines + linesNeeded > MAX_LINES_PER_COL && currentCol.length > 0) {
          cols.push(currentCol);
          currentCol = [];
          currentLines = 0;
        }
        currentCol.push(t);
        currentLines += linesNeeded;
      });
      if (currentCol.length > 0) cols.push(currentCol);

      // Tạo bảng chia cột hiển thị rõ viền như yêu cầu
      let targetTable: any = new Paragraph({ 
        children: [new TextRun({ text: "(Gia chủ cúng dường chung cho gia quyến)", italics: true })], 
        alignment: AlignmentType.CENTER 
      });
      
      if (cols.length > 0) {
        // Tạo các ô (TableCell) tương ứng với số cột
        const tableCells = cols.map(colItems => {
          let globalNum = 1; // Để đơn giản, đánh số thứ tự trong mỗi cột
          const cellParagraphs = colItems.map((t: any) => {
            let text = `${globalNum++}. ${t.full_name}`;
            if (t.dharma_name) text += ` (PD: ${t.dharma_name})`;
            if (!isCauAn && t.birth_year) text += ` SN: ${t.birth_year}`;
            
            return new Paragraph({
              children: [new TextRun({ text, size: 24 })],
              spacing: { after: 100 }
            });
          });

          return new TableCell({
            children: cellParagraphs,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          });
        });

        targetTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "aaaaaa" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "aaaaaa" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "aaaaaa" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "aaaaaa" },
            insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "aaaaaa" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "aaaaaa" },
          },
          rows: [new TableRow({ children: tableCells })]
        }) as any;
      }

      sections.push({
        properties: {
          page: {
            size: { orientation: PageOrientation.PORTRAIT },
            margin: {
              top: convertMillimetersToTwip(20), bottom: convertMillimetersToTwip(20),
              left: convertMillimetersToTwip(25), right: convertMillimetersToTwip(25),
            },
            // Thêm khung viền bao quanh toàn bộ trang Sớ
            borders: {
              pageBorders: {
                top: { style: BorderStyle.THICK, size: 12, color: "8B4513" },
                bottom: { style: BorderStyle.THICK, size: 12, color: "8B4513" },
                left: { style: BorderStyle.THICK, size: 12, color: "8B4513" },
                right: { style: BorderStyle.THICK, size: 12, color: "8B4513" },
              }
            }
          },
        },
        headers,
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "Giáo Hội Phật Giáo Việt Nam", size: 22, bold: true, color: "555555" })
            ],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Chùa Báo Ân", size: 22, bold: true, color: "555555" })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: isCauAn ? "SỚ CẦU AN" : "SỚ CẦU SIÊU", size: 52, bold: true, color: "4A0404" })
            ],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            children: [
              new TextRun({ 
                text: isCauAn ? "Nam Mô Tiêu Tai Diên Thọ Dược Sư Lưu Ly Quang Vương Phật" : "Nam Mô Tiếp Dẫn Đạo Sư A Di Đà Phật", 
                size: 24, italics: true, color: "8B4513" 
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Mã: ${form.form_code}`, bold: true }),
              new TextRun({ text: `\tNgày: ${form.scheduled_date || 'Hôm nay'} \tGiờ: ${form.is_delegated ? 'Chùa xếp' : form.selected_time_slot}` })
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Trai Chủ: `, size: 28, bold: true, color: "4A0404" }),
              new TextRun({ text: `${traiChuName} ${traiChuDharma ? `(PD: ${traiChuDharma})` : ''}`, size: 28, bold: true })
            ],
            spacing: { after: 100 }
          }),
          ...(form.note ? [new Paragraph({ children: [new TextRun({ text: `Lời khấn: "${form.note}"`, italics: true, size: 24 })], spacing: { after: 300 } })] : []),
          new Paragraph({
            children: [
              new TextRun({ text: isCauAn ? "Danh Sách Hương Linh & Phật Tử Cầu An Tiêu Tai" : "Danh Sách Chư Hương Linh Phục Nguyện Siêu Độ", size: 24, bold: true })
            ],
            spacing: { before: 200, after: 200 }
          }),
          targetTable,
          new Paragraph({
            children: [
              new TextRun({
                text: isCauAn 
                  ? 'Đệ tử chúng đẳng thành tâm khấu bái, nguyện cầu Tam Bảo chứng minh, gia quyến khang ninh khương thái cát tường, sở cầu như ý, sở nguyện tòng tâm.'
                  : 'Đệ tử chúng đẳng thành tâm khấu bái, nguyện cầu Tiếp Dẫn Đạo Sư A Di Đà Phật phóng quang tiếp độ chư hương linh trút bỏ trần duyên, siêu sinh tịnh độ.',
                italics: true,
                size: 24
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 600 }
          })
        ],
      });
    }
  } else {
    // Chế độ POSTER hoặc PHUNG_VI (A4 NGANG, 4 cột, nét đứt)
    const allColumns: { shortCode: string; names: string[] }[] = [];
    const MAX_LINES_PER_COL = 24;

    selectedForms.forEach((form) => {
      const shortCode = form.form_code.slice(-3);
      const actualTargets = form.targets.filter((t: any) => t.relation !== 'TRAI_CHU');
      let currentCol: string[] = [];
      let currentLines = 0;

      actualTargets.forEach((t: any) => {
        const name = t.full_name.trim();
        const linesNeeded = 1;
        if (currentLines + linesNeeded > MAX_LINES_PER_COL && currentCol.length > 0) {
          allColumns.push({ shortCode, names: currentCol });
          currentCol = [];
          currentLines = 0;
        }
        currentCol.push(name);
        currentLines += linesNeeded;
      });
      if (currentCol.length > 0) allColumns.push({ shortCode, names: currentCol });
    });

    const MAX_COLS_PER_PAGE = 4;
    const pages: { shortCode: string; names: string[] }[][] = [];
    for (let i = 0; i < allColumns.length; i += MAX_COLS_PER_PAGE) {
      pages.push(allColumns.slice(i, i + MAX_COLS_PER_PAGE));
    }

    pages.forEach(pageCols => {
      // Bổ sung cột rỗng nếu trang không đủ 4 cột
      while(pageCols.length < 4) {
        pageCols.push({ shortCode: "", names: [] });
      }

      const tableCells = pageCols.map(col => {
        const cellChildren: any[] = [];
        
        if (printMode === 'PHUNG_VI') {
          if (col.shortCode !== "") {
            cellChildren.push(new Paragraph({ children: [new TextRun({ text: "Nam Mô Tiếp Dẫn Đạo Sư A Di Đà Phật", italics: true, size: 20 })], alignment: AlignmentType.CENTER }));
            cellChildren.push(new Paragraph({ children: [new TextRun({ text: "PHỤNG VÌ", bold: true, size: 36 })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }));
            col.names.forEach(name => {
              cellChildren.push(new Paragraph({ children: [new TextRun({ text: name, bold: true, size: 28 })], alignment: AlignmentType.CENTER, spacing: { after: 100 } }));
            });
            cellChildren.push(new Paragraph({ children: [new TextRun({ text: "TỌA VỊ", bold: true, size: 32 })], alignment: AlignmentType.CENTER, spacing: { before: 800 } }));
            cellChildren.push(new Paragraph({ children: [new TextRun({ text: "Chùa Báo Ân • Linh Vị", italics: true, size: 20 })], alignment: AlignmentType.CENTER }));
          }
        } else {
          // POSTER
          if (col.shortCode !== "") {
            cellChildren.push(new Paragraph({ children: [new TextRun({ text: col.shortCode, bold: true, size: 80 })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }));
            col.names.forEach(name => {
              cellChildren.push(new Paragraph({ children: [new TextRun({ text: name, bold: true, size: 28 })], alignment: AlignmentType.CENTER, spacing: { after: 100 } }));
            });
          }
        }

        if (cellChildren.length === 0) {
          cellChildren.push(new Paragraph({ text: "" }));
        }

        return new TableCell({
          children: cellChildren,
          margins: { top: 200, bottom: 200, left: 200, right: 200 },
          verticalAlign: VerticalAlign.TOP,
        });
      });

      let headers = {};
      if (backgroundImageBuffer) {
        headers = {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: backgroundImageBuffer,
                    transformation: {
                      width: LETTER_LANDSCAPE_WIDTH_PX,
                      height: LETTER_LANDSCAPE_HEIGHT_PX,
                    },
                    type: 'png',
                    floating: {
                      horizontalPosition: { offset: 0 },
                      verticalPosition: { offset: 0 },
                      behindDocument: true,
                    }
                  })
                ]
              })
            ]
          })
        };
      }

      sections.push({
        properties: {
          page: {
            size: {
              width: 15840, // 279.4mm (Letter)
              height: 12240, // 215.9mm (Letter)
              orientation: PageOrientation.LANDSCAPE,
            },
            margin: {
              top: 567, // 10mm
              right: 391, // 6.9mm
              bottom: 425, // 7.5mm
              left: 142, // 2.5mm
            },
          },
        },
        headers,
        children: [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.DASHED, size: 2, color: "000000" },
              bottom: { style: BorderStyle.DASHED, size: 2, color: "000000" },
              left: { style: BorderStyle.DASHED, size: 2, color: "000000" },
              right: { style: BorderStyle.DASHED, size: 2, color: "000000" },
              insideVertical: { style: BorderStyle.DASHED, size: 2, color: "000000" },
              insideHorizontal: { style: BorderStyle.DASHED, size: 2, color: "000000" },
            },
            rows: [new TableRow({ children: tableCells })]
          })
        ]
      });
    });
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Times New Roman" },
        }
      }
    },
    sections
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Danh_Sach_So_${new Date().getTime()}.docx`);
};
