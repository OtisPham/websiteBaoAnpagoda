import { NextResponse } from 'next/server'
import { renderDocxTemplate } from '@/utils/so/docxRenderer'
import path from 'path'
import fs from 'fs'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    // Read the template from the public/templates folder
    const templatePath = path.join(process.cwd(), 'public', 'templates', 'CauSieutemplate.docx')
    
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ error: 'Template file not found' }, { status: 404 })
    }
    
    const templateBuffer = fs.readFileSync(templatePath)

    // Render using the data provided
    const outputBuffer = await renderDocxTemplate(templateBuffer, data)

    return new NextResponse(outputBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="So_${data.form_code || 'Export'}.docx"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
