/**
 * Input validators for QR code forms
 */

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export const isValidUrl = (url: string): ValidationResult => {
  if (!url || !url.trim()) {
    return { isValid: false, errorMessage: 'Please enter a website URL.' };
  }
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`);
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      return { isValid: false, errorMessage: 'Please enter a valid domain (e.g. example.com).' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, errorMessage: 'Please enter a valid URL.' };
  }
};

export const isValidEmail = (email: string): ValidationResult => {
  if (!email || !email.trim()) {
    return { isValid: false, errorMessage: 'Please enter an email address.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, errorMessage: 'Please enter a valid email address.' };
  }
  return { isValid: true };
};

export const isValidPhone = (phone: string): ValidationResult => {
  if (!phone || !phone.trim()) {
    return { isValid: false, errorMessage: 'Please enter a phone number.' };
  }
  // Strip spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const phoneRegex = /^\+?[0-9]{3,16}$/;
  if (!phoneRegex.test(cleaned)) {
    return { isValid: false, errorMessage: 'Please enter a valid phone number with digits (and optional +).' };
  }
  return { isValid: true };
};

export const isValidWiFi = (ssid: string): ValidationResult => {
  if (!ssid || !ssid.trim()) {
    return { isValid: false, errorMessage: 'Please enter the network name (SSID).' };
  }
  return { isValid: true };
};

export const isValidCoordinates = (lat: string, lng: string): ValidationResult => {
  if (!lat || !lat.trim() || !lng || !lng.trim()) {
    return { isValid: false, errorMessage: 'Latitude and Longitude are required.' };
  }
  const numLat = parseFloat(lat);
  const numLng = parseFloat(lng);
  if (isNaN(numLat) || numLat < -90 || numLat > 90) {
    return { isValid: false, errorMessage: 'Latitude must be between -90 and 90.' };
  }
  if (isNaN(numLng) || numLng < -180 || numLng > 180) {
    return { isValid: false, errorMessage: 'Longitude must be between -180 and 180.' };
  }
  return { isValid: true };
};
