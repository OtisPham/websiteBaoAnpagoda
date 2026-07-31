'use client';

import React, { useState } from 'react';
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
  VerticalAlign
} from 'docx';
import { saveAs } from 'file-saver';
import { FileDown, Loader2 } from 'lucide-react';

export interface DocxExportOptions {
  orientation?: 'portrait' | 'landscape';
  title?: string;
  data?: any[];
  filename?: string;
}

/**
 * Hàm tiện ích để tạo và tải xuống file docx
 */
export const generateAndDownloadDocx = async (options: DocxExportOptions) => {
  const { 
    orientation = 'portrait', 
    title = 'Báo Cáo Mẫu',
    data = [],
    filename = 'Tai-Lieu.docx'
  } = options;

  // Cấu hình lề tiêu chuẩn
  // Top/Bottom: 2cm = 20mm
  // Left/Right: 2.5cm = 25mm
  const margins = {
    top: convertMillimetersToTwip(20),
    bottom: convertMillimetersToTwip(20),
    left: convertMillimetersToTwip(25),
    right: convertMillimetersToTwip(25),
  };

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: orientation === 'landscape' ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
            },
            margin: margins,
          },
        },
        children: [
          // Tiêu đề (Heading)
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400, // Khoảng cách sau tiêu đề
            },
          }),
          
          // Đoạn văn (Paragraph)
          new Paragraph({
            children: [
              new TextRun({
                text: 'Đây là đoạn văn bản mẫu định dạng chuẩn.',
                font: 'Times New Roman',
                size: 24, // 12pt (kích thước tính bằng nửa point, 12 * 2 = 24)
              }),
            ],
            spacing: {
              after: 300,
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Dự án TSX tạo file Word với thiết lập chuẩn A4 (Portrait/Landscape), lề trang tiêu chuẩn (Top/Bottom 2cm, Left/Right 2.5cm) và sử dụng font Times New Roman xuyên suốt. Các bảng biểu được định dạng đẹp mắt, hiện đại và thân thiện.',
                font: 'Times New Roman',
                size: 24,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED, // Căn đều 2 bên
            spacing: {
              after: 400,
            },
          }),

          // Bảng (Table)
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            rows: [
              // Hàng Tiêu Đề
              new TableRow({
                tableHeader: true, // Lặp lại header nếu sang trang mới
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "STT", bold: true, font: "Times New Roman", size: 24 })],
                      alignment: AlignmentType.CENTER
                    })],
                    shading: { fill: "f3f4f6" }, // Màu nền nhẹ (xám nhạt)
                    verticalAlign: VerticalAlign.CENTER,
                    margins: { top: 100, bottom: 100, left: 100, right: 100 }
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Họ và Tên", bold: true, font: "Times New Roman", size: 24 })],
                      alignment: AlignmentType.CENTER
                    })],
                    shading: { fill: "f3f4f6" },
                    verticalAlign: VerticalAlign.CENTER,
                    margins: { top: 100, bottom: 100, left: 100, right: 100 }
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Trạng thái", bold: true, font: "Times New Roman", size: 24 })],
                      alignment: AlignmentType.CENTER
                    })],
                    shading: { fill: "f3f4f6" },
                    verticalAlign: VerticalAlign.CENTER,
                    margins: { top: 100, bottom: 100, left: 100, right: 100 }
                  }),
                ],
              }),
              // Hàng Dữ Liệu 1
              new TableRow({
                children: [
                  new TableCell({ 
                    children: [new Paragraph({ children: [new TextRun({ text: "1", font: "Times New Roman", size: 24 })], alignment: AlignmentType.CENTER })],
                    verticalAlign: VerticalAlign.CENTER,
                    margins: { top: 100, bottom: 100, left: 100, right: 100 }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ children: [new TextRun({ text: "Nguyễn Văn A", font: "Times New Roman", size: 24 })] })],
                    verticalAlign: VerticalAlign.CENTER,
                    margins: { top: 100, bottom: 100, left: 100, right: 100 }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ children: [new TextRun({ text: "Hoàn thành", font: "Times New Roman", size: 24 })] })],
                    verticalAlign: VerticalAlign.CENTER,
                    margins: { top: 100, bottom: 100, left: 100, right: 100 }
                  }),
                ],
              }),
              // Hàng Dữ Liệu 2
              new TableRow({
                children: [
                  new TableCell({ 
                    children: [new Paragraph({ children: [new TextRun({ text: "2", font: "Times New Roman", size: 24 })], alignment: AlignmentType.CENTER })],
                    verticalAlign: VerticalAlign.CENTER,
                    margins: { top: 100, bottom: 100, left: 100, right: 100 }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ children: [new TextRun({ text: "Trần Thị B", font: "Times New Roman", size: 24 })] })],
                    verticalAlign: VerticalAlign.CENTER,
                    margins: { top: 100, bottom: 100, left: 100, right: 100 }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ children: [new TextRun({ text: "Đang xử lý", font: "Times New Roman", size: 24 })] })],
                    verticalAlign: VerticalAlign.CENTER,
                    margins: { top: 100, bottom: 100, left: 100, right: 100 }
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
    // Thiết lập Font chữ mặc định cho toàn bộ tài liệu
    styles: {
      default: {
        heading1: {
          run: {
            size: 32, // 16pt
            bold: true,
            color: "000000",
            font: "Times New Roman",
          },
          paragraph: {
            spacing: {
              before: 240,
              after: 120,
            },
          },
        },
        document: {
          run: {
            size: 24, // 12pt
            font: "Times New Roman",
            color: "000000"
          },
        },
      },
    },
  });

  // Tạo blob và tải về sử dụng file-saver
  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
};

// --- React Component ---
interface DocxExportComponentProps extends DocxExportOptions {
  buttonText?: string;
  className?: string;
}

export default function DocxExport({ 
  buttonText = "Xuất file Word", 
  className = "",
  ...options 
}: DocxExportComponentProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await generateAndDownloadDocx(options);
    } catch (error) {
      console.error("Lỗi khi xuất file docx:", error);
      alert("Có lỗi xảy ra khi xuất file!");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    >
      {isExporting ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <FileDown className="w-5 h-5" />
      )}
      <span>{isExporting ? "Đang xử lý..." : buttonText}</span>
    </button>
  );
}
