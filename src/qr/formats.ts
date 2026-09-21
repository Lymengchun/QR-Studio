/**
 * QR Code payload formatters
 */

export type QRType =
  | 'url'
  | 'text'
  | 'wifi'
  | 'vcard'
  | 'email'
  | 'phone'
  | 'sms'
  | 'location'
  | 'whatsapp'
  | 'calendar'
  | 'crypto';

export interface WiFiData {
  ssid: string;
  password?: string;
  security: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

export interface VCardData {
  firstName: string;
  lastName?: string;
  organization?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
}

export interface EmailData {
  email: string;
  subject?: string;
  body?: string;
}

export interface SMSData {
  phone: string;
  message?: string;
}

export interface LocationData {
  latitude: string;
  longitude: string;
  label?: string;
}

export interface WhatsAppData {
  phone: string;
  message?: string;
}

export interface CalendarData {
  title: string;
  location?: string;
  startDate: string; // ISO or date string
  endDate?: string;
  description?: string;
}

export interface CryptoData {
  coin: 'bitcoin' | 'ethereum' | 'solana' | 'usdt';
  address: string;
  amount?: string;
  label?: string;
}

const escapeWiFi = (str: string): string => {
  return str.replace(/([\\;,:"])/g, '\\$1');
};

export const formatWiFi = (data: WiFiData): string => {
  const ssid = escapeWiFi(data.ssid);
  const password = data.password ? escapeWiFi(data.password) : '';
  const type = data.security || 'WPA';
  const hidden = data.hidden ? 'true' : 'false';
  return `WIFI:T:${type};S:${ssid};P:${password};H:${hidden};;`;
};

export const formatVCard = (data: VCardData): string => {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
  const fn = [data.firstName, data.lastName].filter(Boolean).join(' ');
  lines.push(`N:${data.lastName || ''};${data.firstName || ''};;;`);
  lines.push(`FN:${fn || 'Contact'}`);
  if (data.organization) lines.push(`ORG:${data.organization}`);
  if (data.phone) lines.push(`TEL;TYPE=CELL:${data.phone}`);
  if (data.email) lines.push(`EMAIL:${data.email}`);
  if (data.website) lines.push(`URL:${data.website.startsWith('http') ? data.website : `https://${data.website}`}`);
  if (data.address) lines.push(`ADR:;;${data.address};;;;`);
  lines.push('END:VCARD');
  return lines.join('\n');
};

export const formatEmail = (data: EmailData): string => {
  const params = new URLSearchParams();
  if (data.subject) params.append('subject', data.subject);
  if (data.body) params.append('body', data.body);
  const query = params.toString();
  return `mailto:${data.email}${query ? `?${query}` : ''}`;
};

export const formatPhone = (phone: string): string => {
  const clean = phone.replace(/[\s\-()]/g, '');
  return `tel:${clean}`;
};

export const formatSMS = (data: SMSData): string => {
  const cleanPhone = data.phone.replace(/[\s\-()]/g, '');
  return `SMSTO:${cleanPhone}:${data.message || ''}`;
};

export const formatLocation = (data: LocationData): string => {
  const lat = data.latitude.trim();
  const lng = data.longitude.trim();
  // Standard Google Maps link works seamlessly on all iOS and Android camera scanners
  return `https://www.google.com/maps?q=${lat},${lng}`;
};

export const formatWhatsApp = (data: WhatsAppData): string => {
  const cleanPhone = data.phone.replace(/[^0-9]/g, '');
  const msg = data.message ? `?text=${encodeURIComponent(data.message)}` : '';
  return `https://wa.me/${cleanPhone}${msg}`;
};

const formatICalDate = (dateTimeStr: string): string => {
  try {
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  } catch {
    return '';
  }
};

export const formatCalendar = (data: CalendarData): string => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//QR Studio//EN',
    'BEGIN:VEVENT',
    `SUMMARY:${data.title || 'Event'}`
  ];
  if (data.location) lines.push(`LOCATION:${data.location}`);
  if (data.description) lines.push(`DESCRIPTION:${data.description}`);
  if (data.startDate) {
    const start = formatICalDate(data.startDate);
    if (start) lines.push(`DTSTART:${start}`);
  }
  if (data.endDate) {
    const end = formatICalDate(data.endDate);
    if (end) lines.push(`DTEND:${end}`);
  }
  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');
  return lines.join('\n');
};

export const formatCrypto = (data: CryptoData): string => {
  const { coin, address, amount, label } = data;
  if (coin === 'bitcoin') {
    const params = new URLSearchParams();
    if (amount) params.append('amount', amount);
    if (label) params.append('label', label);
    const query = params.toString();
    return `bitcoin:${address}${query ? `?${query}` : ''}`;
  }
  if (coin === 'ethereum') {
    const params = new URLSearchParams();
    if (amount) params.append('value', amount);
    const query = params.toString();
    return `ethereum:${address}${query ? `?${query}` : ''}`;
  }
  return address;
};
