import React from 'react'
import ColorPalettePreview from '@/components/ColorPalettePreview'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trải Nghiệm & Chọn Bộ Màu Xanh Thiền Định | Chùa Bảo An',
  description: 'Bảng xem trước trực quan 3 phương án phối màu xanh chuẩn trang web Chùa Bảo An.',
}

export default function BangMauPage() {
  return <ColorPalettePreview />
}
