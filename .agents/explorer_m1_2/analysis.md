# Comprehensive Exploration Report: React Native Project (`pagoda-app`)

**Explorer Agent**: Explorer 2 (Milestone M1 - Exploration & Analysis)  
**Date**: 2026-07-24  
**Target Repositories**: `c:\Users\ADMIN\Desktop\pagoda-app` (React Native Mobile App) and `c:\Users\ADMIN\Desktop\pagodaweb` (Next.js Web Portal)

---

## 1. Executive Summary

This investigation analyzed the mobile client repository located at `c:\Users\ADMIN\Desktop\pagoda-app` and inspected `c:\Users\ADMIN\Desktop\pagodaweb` to evaluate the React Native framework, navigation structure, UI styling system, available printing/PDF capabilities, and exact integration points for the PDF Printing Station component/screen.

**Key Discoveries**:
- **Project Structure**: `pagoda-app` is a modern **Expo SDK 57** React Native application using **Expo Router v57**, React 19.2.3, React Native 0.86.0, and TypeScript 6.0.3 with typed routes. `pagodaweb` is strictly a Next.js web application and contains no React Native code.
- **Styling Architecture**: **NativeWind v4** (`nativewind: ^4.2.6`, `tailwindcss: ^3.4.19`) with a custom Buddhist theme palette (`buddhist-gold`, `buddhist-brown`, `buddhist-bg`, `buddhist-navy`, `buddhist-teal`, `buddhist-dark`).
- **PDF & Printing Capabilities**: **Zero** PDF or printing libraries are currently installed in `pagoda-app/package.json`. Libraries such as `expo-print`, `expo-sharing`, and `expo-file-system` need to be added.
- **Integration Target**: The PDF Printing Station is designated to live at `c:\Users\ADMIN\Desktop\pagoda-app\src\app\(dashboard)\print\index.tsx` (Route: `/(dashboard)/print`), which is currently a placeholder screen (`PrintStationScreen`) integrated into the `(dashboard)` tab navigation.

---

## 2. Framework & Build Setup Analysis

### 2.1 Technology Stack & Version Matrix

| Dependency | Version | Purpose |
| flex | flex | flex |
| `expo` | `~57.0.8` | Core application framework |
| `react-native` | `0.86.0` | Mobile UI framework |
| `react` | `19.2.3` | UI runtime |
| `expo-router` | `~57.0.8` | File-based routing & navigation |
| `typescript` | `~6.0.3` | Type checking (`typedRoutes: true`) |
| `nativewind` | `^4.2.6` | Tailwind CSS compiler for React Native |
| `tailwindcss` | `^3.4.19` | Utility-first CSS styling engine |
| `@supabase/supabase-js` | `^2.110.8` | Supabase database & auth client |
| `@tanstack/react-query` | `^5.101.4` | Server state management & caching |
| `zustand` | `^5.0.14` | Local client state management |
| `lucide-react-native` | `^1.26.0` | SVG icons |
| `@react-native-async-storage/async-storage` | `2.2.0` | Persistent key-value storage for Supabase auth session |

### 2.2 Configuration Files Inspection

1. **`app.json`**:
   - Scheme: `"scheme": "pagodaapp"`
   - Main Entry: `"main": "expo-router/entry"` (configured in `package.json`)
   - Plugins: `expo-router`, `expo-splash-screen`
   - Experiments: `"typedRoutes": true`, `"reactCompiler": true`
2. **`metro.config.js`**:
   - Configured with `withNativeWind(config, { input: "./src/global.css" })`.
3. **`tailwind.config.js`**:
   - Content paths: `./src/**/*.{js,jsx,ts,tsx}`
   - Custom palette:
     ```js
     colors: {
       buddhist: {
         gold: '#D69F4C',
         brown: '#8B4513',
         bg: '#faf8f5',
         navy: '#0D3A4B',
         teal: '#5DA8A8',
         dark: '#081B24'
       }
     }
     ```

---

## 3. Navigation & Screen Architecture

### 3.1 Routing Strategy (`Expo Router`)

Root layout (`src/app/_layout.tsx`) inspects session state from `useAuth()` and enforces role-based redirection:
- **Unauthenticated Users** (`!user`): Redirected to `/(public)/`
- **Administrative Roles** (`user.role === 'ADMIN' || user.role === 'MONK'`): Redirected to `/(dashboard)/`
- **Standard Users** (`user.role === 'USER'`): Redirected to `/(user)/`

### 3.2 Directory & Screen Tree

```
src/app/
├── _layout.tsx              # Root Stack layout with auth redirection logic
├── explore.tsx              # Exploratory screen stub
├── (public)/                # Public Route Group (Stack navigation)
│   ├── _layout.tsx          # Stack navigation for public views
│   ├── index.tsx            # Public homepage for Pagoda App
│   └── auth/
│       └── index.tsx        # Login / Authentication screen
├── (user)/                  # User Route Group (Bottom Tabs navigation)
│   ├── _layout.tsx          # Tabs layout ("Sớ của tôi", "Gửi Sớ")
│   ├── index.tsx            # List of user-submitted forms
│   └── create.tsx           # Form creation screen (Cau An / Cau Sieu submission)
└── (dashboard)/             # Admin & Monk Route Group (Sidebar / Tabs navigation)
    ├── _layout.tsx          # Dashboard layout (Responsive Sidebar + Mobile Tabs)
    ├── index.tsx            # Dashboard Overview ("Tổng quan")
    ├── forms/
    │   └── index.tsx        # Form Review & Approval ("Duyệt Sớ")
    └── print/
        └── index.tsx        # PDF Printing Station ("Trạm In Ấn") [TARGET INTEGRATION LOCATION]
```

### 3.3 Dashboard Layout Mechanics (`src/app/(dashboard)/_layout.tsx`)

The dashboard layout supports dual desktop/mobile UX:
- **Desktop Web (`md:` breakpoint)**: Renders a left sidebar with branded header ("Chùa Báo Ân - Cổng Quản Trị"), user profile block, and logout button.
- **Mobile Devices**: Renders native bottom tabs with `lucide-react-native` icons.
- **Registered Tab Menu Items**:
  1. `index`: "Tổng quan" (`LayoutDashboard` icon)
  2. `forms/index`: "Duyệt Sớ" (`FileText` icon)
  3. `print/index`: "Trạm In Ấn" (`Printer` icon)

---

## 4. UI Framework & Design System Setup

### 4.1 Styling Paradigms
- **NativeWind v4**: Utility-first styling directly via `className` props on React Native components.
- **Custom Utility Classes**: Custom colors like `bg-buddhist-bg`, `text-buddhist-brown`, `bg-buddhist-gold`, `text-buddhist-navy`.

### 4.2 Reusable Shared Components (`src/components/shared/`)

1. **`AppText.tsx`**:
   - Wraps standard React Native `Text`.
   - Defaults to `text-stone-800 dark:text-stone-200`.
2. **`AppButton.tsx`**:
   - Touchability wrapper supporting variants: `primary` (`bg-buddhist-gold`), `outline` (`border-2 border-buddhist-gold`), and `text`.
   - Includes loading state spinner (`ActivityIndicator`).
3. **`AppInput.tsx`**:
   - Styled text input component.

---

## 5. Printing, PDF & File System Library Evaluation

### 5.1 Current Library Audit
Inspection of `c:\Users\ADMIN\Desktop\pagoda-app\package.json` reveals:
- `expo-print`: **Not installed**
- `expo-sharing`: **Not installed**
- `expo-file-system`: **Not installed**
- `react-native-pdf`: **Not installed**
- `react-native-html-to-pdf`: **Not installed**

### 5.2 Required Dependencies for PDF Printing Station
To enable full-featured PDF rendering, print preview, and document printing on Expo / React Native, the following packages will need to be added:
1. **`expo-print`**: Provides `Print.printAsync({ html })` for native direct printing / print modal and `Print.printToFileAsync({ html })` to compile HTML/CSS into a physical PDF file.
2. **`expo-sharing`**: Provides `Sharing.shareAsync(uri)` to open native share sheets, print dialogs, or save generated PDF files to device storage.
3. **`expo-file-system`**: Provides local file system access to cache, store, and manage generated `.pdf` documents.

---

## 6. PDF Printing Station Integration Point Analysis

### 6.1 Exact Integration File & Route

- **Target File**: `c:\Users\ADMIN\Desktop\pagoda-app\src\app\(dashboard)\print\index.tsx`
- **Route Path**: `/(dashboard)/print`
- **Existing Content**:
  ```tsx
  import React from 'react'
  import { View } from 'react-native'
  import { AppText } from '../../../components/shared/AppText'

  export default function PrintStationScreen() {
    return (
      <View className="flex-1 bg-buddhist-bg justify-center items-center p-4">
        <AppText className="text-2xl font-bold text-buddhist-brown mb-4">Trạm In Ấn</AppText>
        <AppText className="text-stone-600 text-center text-lg">
          Tính năng in sớ đa chế độ (Ngang, Dọc, Phụng Vì - Tọa Vị) đang được xây dựng...
        </AppText>
      </View>
    )
  }
  ```

### 6.2 Data Integration & Supabase Models
To populate the PDF Printing Station, the component can query Supabase via backend services (`src/backend/api/admin/forms.ts`):
- **Forms Query**: `supabase.from('forms').select('*, users(*), target_persons(*)')` where `status = 'Approved'` or `status = 'Submitted'`.
- **Form Fields Available**: `form_type` (`CAU_AN` | `CAU_SIEU`), `form_code`, `status`, `scheduled_date`, `note`, `users.full_name`, `users.phone`, `target_persons` (`full_name`, `dharma_name`, `birth_year`, `death_year`, `relation`).

---

## 7. Comparison with `pagodaweb`

- **`pagodaweb`**: Next.js 15 web application located at `c:\Users\ADMIN\Desktop\pagodaweb`. Contains server action routes (`/src/app/dashboard/print`), web-based print preview components, and PRD specifications (`pagodasystem.md`). Contains **no** React Native code.
- **`pagoda-app`**: Expo React Native mobile client located at `c:\Users\ADMIN\Desktop\pagoda-app`. Contains all mobile React Native code, Expo Router navigation, and NativeWind v4 components.

---

## 8. Recommendations for Implementer

1. **Package Installation**: Install `expo-print`, `expo-sharing`, and `expo-file-system` in `pagoda-app`.
2. **Component Integration**: Replace the placeholder `PrintStationScreen` in `c:\Users\ADMIN\Desktop\pagoda-app\src\app\(dashboard)\print\index.tsx` with the complete PDF Printing Station UI.
3. **Print Engine Strategy**: Utilize `expo-print` with `printToFileAsync` / `printAsync` using dynamic HTML string templates (including vertical CSS styling `writing-mode: vertical-rl` and layout algorithms for Horizontal Chánh Điện, Vertical A4, Column-optimized Cầu Siêu, and Phụng Vì - Tọa Vị modes).
