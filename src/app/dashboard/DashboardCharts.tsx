'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ChartDataPoint {
  time: string
  CauAn: number
  CauSieu: number
}

interface Props {
  chartData: ChartDataPoint[]
}

export default function DashboardCharts({ chartData }: Props) {
  if (chartData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-stone-400 text-sm italic">
        Chưa có dữ liệu phân bổ ca cúng cho ngày hôm nay.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" className="dark:stroke-stone-800" />
        <XAxis 
          dataKey="time" 
          stroke="#78716c" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
        />
        <YAxis 
          stroke="#78716c" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            borderColor: '#e7e5e4',
            borderRadius: '8px',
            fontSize: '12px'
          }}
          itemStyle={{ color: '#1c1917' }}
        />
        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
        <Bar dataKey="CauAn" name="Sớ Cầu An" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="CauSieu" name="Sớ Cầu Siêu" fill="#f43f5e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
