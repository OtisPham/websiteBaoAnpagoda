import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'

/**
 * Render dữ liệu vào một file phôi Word (.docx) sử dụng docxtemplater.
 * @param templateBuffer Buffer của file phôi Word gốc.
 * @param data Đối tượng chứa dữ liệu để fill vào phôi (ví dụ: { form_code, owner_name, targets: [...] })
 * @returns Buffer của file Word đã được render.
 */
export async function renderDocxTemplate(templateBuffer: Buffer, data: Record<string, any>): Promise<Buffer> {
  // Tạo đối tượng zip từ buffer của file word
  const zip = new PizZip(templateBuffer)
  
  // Khởi tạo docxtemplater với zip file
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  })

  // Thực hiện render dữ liệu vào template
  doc.render(data)

  // Xuất file Word đã render ra buffer
  const outputBuffer = doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  })

  return outputBuffer
}
