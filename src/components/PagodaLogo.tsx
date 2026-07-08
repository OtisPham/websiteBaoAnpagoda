import React from 'react'

interface PagodaLogoProps {
  className?: string
  size?: number
}

export default function PagodaLogo({ className = 'h-10 w-10', size }: PagodaLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-transform duration-300 drop-shadow-sm`}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        {/* Vàng kim sang trọng */}
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        <linearGradient id="petalGradient" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="45%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="55%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#92400E" />
        </radialGradient>
      </defs>

      {/* Hào quang tròn bên ngoài */}
      <circle
        cx="50"
        cy="50"
        r="46"
        stroke="url(#goldGradient)"
        strokeWidth="2.5"
        fill="none"
        opacity="0.9"
      />
      <circle
        cx="50"
        cy="50"
        r="41"
        stroke="url(#goldGradient)"
        strokeWidth="1"
        strokeDasharray="3 3"
        fill="none"
        opacity="0.6"
      />

      {/* Đài Hoa Sen Bát Nhã (Lotus Base & Blooming Petals) */}
      <g transform="translate(0, 4)">
        {/* Cánh sen trung tâm cao nhất */}
        <path
          d="M50 18 C42 34 38 46 50 62 C62 46 58 34 50 18 Z"
          fill="url(#petalGradient)"
          stroke="#92400E"
          strokeWidth="0.8"
        />
        {/* Cánh sen lớp trái 1 */}
        <path
          d="M50 62 C38 52 28 42 26 30 C36 34 44 46 50 62 Z"
          fill="url(#petalGradient)"
          opacity="0.92"
        />
        {/* Cánh sen lớp phải 1 */}
        <path
          d="M50 62 C62 52 72 42 74 30 C64 34 56 46 50 62 Z"
          fill="url(#petalGradient)"
          opacity="0.92"
        />
        {/* Cánh sen tỏa hai bên trái 2 */}
        <path
          d="M50 64 C34 58 20 50 16 40 C28 48 40 56 50 64 Z"
          fill="url(#goldGradient)"
          opacity="0.85"
        />
        {/* Cánh sen tỏa hai bên phải 2 */}
        <path
          d="M50 64 C66 58 80 50 84 40 C72 48 60 56 50 64 Z"
          fill="url(#goldGradient)"
          opacity="0.85"
        />

        {/* Đế sen đỡ phía dưới */}
        <path
          d="M24 64 C36 71 64 71 76 64 C68 76 32 76 24 64 Z"
          fill="url(#goldGradient)"
        />
      </g>

      {/* Pháp Luân (Dharma Wheel) ở trung tâm */}
      <circle
        cx="50"
        cy="52"
        r="11"
        fill="url(#centerGlow)"
        stroke="#92400E"
        strokeWidth="1.5"
      />
      {/* 8 căm Pháp Luân */}
      <g stroke="#92400E" strokeWidth="1.2" opacity="0.85">
        <line x1="50" y1="41" x2="50" y2="63" />
        <line x1="39" y1="52" x2="61" y2="52" />
        <line x1="42.2" y1="44.2" x2="57.8" y2="59.8" />
        <line x1="57.8" y1="44.2" x2="42.2" y2="59.8" />
      </g>
      {/* Tâm Pháp Luân sáng rực */}
      <circle cx="50" cy="52" r="3.5" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
    </svg>
  )
}
