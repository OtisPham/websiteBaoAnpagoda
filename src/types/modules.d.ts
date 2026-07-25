// Ambient type declarations for external modules and co-located mobile code

declare module 'expo-print' {
  export interface PrintOptions {
    html?: string;
    uri?: string;
    width?: number;
    height?: number;
    orientation?: 'portrait' | 'landscape';
    printerUrl?: string;
    base64?: boolean;
  }
  export interface FilePrintOptions {
    html?: string;
    width?: number;
    height?: number;
    base64?: boolean;
  }
  export interface FilePrintResult {
    uri: string;
    numberOfPages: number;
    base64?: string;
  }
  export function printAsync(options: PrintOptions): Promise<void>;
  export function printToFileAsync(options: FilePrintOptions): Promise<FilePrintResult>;
  export function selectPrinterAsync(): Promise<{ name: string; url: string }>;
}

declare module 'expo-sharing' {
  export interface SharingOptions {
    mimeType?: string;
    dialogTitle?: string;
    UTI?: string;
  }
  export function shareAsync(url: string, options?: SharingOptions): Promise<void>;
  export function isAvailableAsync(): Promise<boolean>;
}

declare module 'react-native-webview' {
  import React from 'react';
  export interface WebViewProps {
    source?: { html?: string; uri?: string; headers?: Record<string, string>; body?: string; method?: string };
    onMessage?: (event: any) => void;
    style?: any;
    originWhitelist?: string[];
    javaScriptEnabled?: boolean;
    domStorageEnabled?: boolean;
    scalesPageToFit?: boolean;
    scrollEnabled?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    showsVerticalScrollIndicator?: boolean;
    injectJavaScript?: (script: string) => void;
    injectedJavaScript?: string;
    [key: string]: any;
  }
  export class WebView extends React.Component<WebViewProps> {}
  export default WebView;
}

declare module 'lucide-react-native' {
  import React from 'react';
  export interface IconProps {
    color?: string;
    size?: number | string;
    strokeWidth?: number | string;
    style?: any;
    className?: string;
    [key: string]: any;
  }
  export const Printer: React.FC<IconProps>;
  export const Share2: React.FC<IconProps>;
  export const FileDown: React.FC<IconProps>;
  export const Edit3: React.FC<IconProps>;
  export const Plus: React.FC<IconProps>;
  export const Trash2: React.FC<IconProps>;
  export const Eye: React.FC<IconProps>;
  export const Settings2: React.FC<IconProps>;
  export const CheckCircle2: React.FC<IconProps>;
  export const RefreshCw: React.FC<IconProps>;
  export const FileText: React.FC<IconProps>;
  export const Calendar: React.FC<IconProps>;
  export const Clock: React.FC<IconProps>;
  export const ChevronRight: React.FC<IconProps>;
  export const X: React.FC<IconProps>;
  export const User: React.FC<IconProps>;
  export const Lock: React.FC<IconProps>;
  export const LogOut: React.FC<IconProps>;
  export const Home: React.FC<IconProps>;
  export const Shield: React.FC<IconProps>;
  export const Search: React.FC<IconProps>;
  export const Filter: React.FC<IconProps>;
  export const Check: React.FC<IconProps>;
  export const AlertCircle: React.FC<IconProps>;
  export const Heart: React.FC<IconProps>;
  export const Info: React.FC<IconProps>;
}

declare module 'react-native' {
  import React from 'react';
  export const View: React.ComponentType<any>;
  export const Text: React.ComponentType<any>;
  export const TouchableOpacity: React.ComponentType<any>;
  export const TextInput: React.ComponentType<any>;
  export const ScrollView: React.ComponentType<any>;
  export const SafeAreaView: React.ComponentType<any>;
  export const Platform: {
    OS: 'ios' | 'android' | 'web' | 'macos' | 'windows';
    select: (obj: any) => any;
  };
  export const Alert: {
    alert: (title: string, message?: string, buttons?: any[], options?: any) => void;
  };
  export const ActivityIndicator: React.ComponentType<any>;
  export const StyleSheet: {
    create: (styles: any) => any;
  };
  export const Image: React.ComponentType<any>;
  export const Pressable: React.ComponentType<any>;
  export const Modal: React.ComponentType<any>;
  export const FlatList: React.ComponentType<any>;
  export const SectionList: React.ComponentType<any>;
  export const Dimensions: {
    get: (dim: 'window' | 'screen') => { width: number; height: number; scale: number; fontScale: number };
  };
  export const Linking: any;
}

declare module 'docxtemplater' {
  export default class Docxtemplater {
    constructor(zip?: any, options?: any);
    loadZip(zip: any): void;
    render(data?: any): void;
    getZip(): any;
    setData(data: any): void;
  }
}

declare module 'pizzip' {
  export default class PizZip {
    constructor(content?: any, options?: any);
    file(name: string): { asText(): string } | null;
    file(name: string, data: any, options?: any): this;
    generate(options?: any): any;
  }
}
