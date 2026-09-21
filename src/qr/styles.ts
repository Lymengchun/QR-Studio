/**
 * QR styling configuration, presets, and scanability evaluation
 */

export type DotType = 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'extra-rounded';
export type CornerSquareType = 'square' | 'dot' | 'extra-rounded';
export type CornerDotType = 'square' | 'dot';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QRStyleConfig {
  mode: 'classic' | 'styled';
  // Colors
  foregroundColor: string;
  backgroundColor: string;
  useGradient: boolean;
  gradientColor2: string;
  gradientAngle: number;
  
  // Shapes
  dotStyle: DotType;
  cornerSquareStyle: CornerSquareType;
  cornerDotStyle: CornerDotType;
  
  // Layout & Error Correction
  margin: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  
  // Logo
  logoImage?: string;
  logoSize: number; // 0.15 to 0.35
  logoMargin: number;
  hideBackgroundDots: boolean;
}

export const DEFAULT_STYLE_CONFIG: QRStyleConfig = {
  mode: 'classic',
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  useGradient: false,
  gradientColor2: '#2563eb',
  gradientAngle: 45,
  
  dotStyle: 'square',
  cornerSquareStyle: 'square',
  cornerDotStyle: 'square',
  
  margin: 12,
  errorCorrectionLevel: 'M',
  
  logoImage: undefined,
  logoSize: 0.25,
  logoMargin: 6,
  hideBackgroundDots: true
};

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  config: Partial<QRStyleConfig>;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Black QR + white background',
    config: {
      mode: 'classic',
      foregroundColor: '#000000',
      backgroundColor: '#ffffff',
      useGradient: false,
      dotStyle: 'square',
      cornerSquareStyle: 'square',
      cornerDotStyle: 'square'
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean modules with subtle softening',
    config: {
      mode: 'styled',
      foregroundColor: '#18181b',
      backgroundColor: '#ffffff',
      useGradient: false,
      dotStyle: 'rounded',
      cornerSquareStyle: 'extra-rounded',
      cornerDotStyle: 'dot'
    }
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Rounded dots with vibrant indigo accent',
    config: {
      mode: 'styled',
      foregroundColor: '#2563eb',
      backgroundColor: '#ffffff',
      useGradient: false,
      dotStyle: 'extra-rounded',
      cornerSquareStyle: 'extra-rounded',
      cornerDotStyle: 'dot'
    }
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Deep professional navy styling',
    config: {
      mode: 'styled',
      foregroundColor: '#0f172a',
      backgroundColor: '#ffffff',
      useGradient: false,
      dotStyle: 'classy',
      cornerSquareStyle: 'square',
      cornerDotStyle: 'square'
    }
  },
  {
    id: 'soft',
    name: 'Soft Emerald',
    description: 'Calm teal & extra rounded corners',
    config: {
      mode: 'styled',
      foregroundColor: '#0f766e',
      backgroundColor: '#f0fdfa',
      useGradient: false,
      dotStyle: 'rounded',
      cornerSquareStyle: 'extra-rounded',
      cornerDotStyle: 'dot'
    }
  },
  {
    id: 'colorful',
    name: 'Colorful',
    description: 'Vibrant purple-to-amber gradient',
    config: {
      mode: 'styled',
      foregroundColor: '#7c3aed',
      backgroundColor: '#ffffff',
      useGradient: true,
      gradientColor2: '#f97316',
      gradientAngle: 45,
      dotStyle: 'dots',
      cornerSquareStyle: 'extra-rounded',
      cornerDotStyle: 'dot'
    }
  },
  {
    id: 'dark',
    name: 'Dark Slate',
    description: 'Charcoal high-contrast modules',
    config: {
      mode: 'styled',
      foregroundColor: '#09090b',
      backgroundColor: '#f4f4f5',
      useGradient: false,
      dotStyle: 'square',
      cornerSquareStyle: 'extra-rounded',
      cornerDotStyle: 'square'
    }
  }
];

// Helper: Hex to sRGB Luminance
function hexToLuminance(hex: string): number {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const toLinear = (val: number) =>
    val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function calculateContrastRatio(fgHex: string, bgHex: string): number {
  try {
    const l1 = hexToLuminance(fgHex);
    const l2 = hexToLuminance(bgHex);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return (brightest + 0.05) / (darkest + 0.05);
  } catch {
    return 21; // fallback
  }
}

export interface ScanabilityCheck {
  status: 'good' | 'warning' | 'error';
  message: string;
  contrastRatio: number;
}

export function evaluateScanability(config: QRStyleConfig, contentLength: number): ScanabilityCheck {
  const contrast1 = calculateContrastRatio(config.foregroundColor, config.backgroundColor);
  const contrast2 = config.useGradient
    ? calculateContrastRatio(config.gradientColor2, config.backgroundColor)
    : contrast1;

  const minContrast = Math.min(contrast1, contrast2);

  // Check if background is darker than foreground (inverted QR)
  const fgLum = hexToLuminance(config.foregroundColor);
  const bgLum = hexToLuminance(config.backgroundColor);
  const isInverted = bgLum < fgLum;

  if (isInverted) {
    return {
      status: 'warning',
      message: 'Inverted colors (light QR on dark background) may fail on older phone cameras.',
      contrastRatio: minContrast
    };
  }

  if (minContrast < 3.0) {
    return {
      status: 'error',
      message: 'Critical: Contrast ratio is too low. Increase color difference for reliable scanning.',
      contrastRatio: minContrast
    };
  }

  if (minContrast < 4.5) {
    return {
      status: 'warning',
      message: 'Low contrast may prevent scanning in dim lighting conditions.',
      contrastRatio: minContrast
    };
  }

  if (config.logoImage && config.logoSize > 0.32) {
    return {
      status: 'warning',
      message: 'Your logo is large and may cover too much data. Consider reducing size.',
      contrastRatio: minContrast
    };
  }

  if (contentLength > 600) {
    return {
      status: 'warning',
      message: 'Content is long. QR code density is very high; download at 1024px or higher.',
      contrastRatio: minContrast
    };
  }

  return {
    status: 'good',
    message: 'Excellent scanability. Crisp contrast and clear quiet zone.',
    contrastRatio: minContrast
  };
}
