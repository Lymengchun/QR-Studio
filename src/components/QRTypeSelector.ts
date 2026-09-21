/**
 * QR Type Selector Component
 */

import { QRType } from '../qr/formats';

export interface TypeOption {
  type: QRType;
  label: string;
  icon: string;
}

export const QR_TYPES: TypeOption[] = [
  { type: 'url', label: 'Website', icon: '🌐' },
  { type: 'text', label: 'Text', icon: '📝' },
  { type: 'wifi', label: 'Wi-Fi', icon: '📶' },
  { type: 'vcard', label: 'Contact', icon: '👤' },
  { type: 'email', label: 'Email', icon: '✉️' },
  { type: 'phone', label: 'Phone', icon: '📱' },
  { type: 'sms', label: 'SMS', icon: '💬' },
  { type: 'location', label: 'Location', icon: '📍' },
  { type: 'whatsapp', label: 'WhatsApp', icon: '🟢' },
  { type: 'calendar', label: 'Event', icon: '📅' },
  { type: 'crypto', label: 'Crypto', icon: '🪙' }
];

export class QRTypeSelector {
  private container: HTMLElement;
  private currentType: QRType = 'url';
  private onSelect: (type: QRType) => void;

  constructor(initialType: QRType = 'url', onSelect: (type: QRType) => void) {
    this.currentType = initialType;
    this.onSelect = onSelect;
    this.container = document.createElement('div');
    this.container.className = 'type-grid';
    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public setSelected(type: QRType): void {
    this.currentType = type;
    const buttons = this.container.querySelectorAll<HTMLButtonElement>('.type-btn');
    buttons.forEach(btn => {
      const btnType = btn.dataset.type as QRType;
      if (btnType === type) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  private render(): void {
    this.container.innerHTML = '';
    QR_TYPES.forEach(item => {
      const btn = document.createElement('button');
      btn.className = `type-btn ${item.type === this.currentType ? 'active' : ''}`;
      btn.dataset.type = item.type;
      btn.setAttribute('aria-pressed', item.type === this.currentType ? 'true' : 'false');
      btn.setAttribute('type', 'button');
      btn.innerHTML = `
        <span class="type-btn-icon">${item.icon}</span>
        <span>${item.label}</span>
      `;

      btn.addEventListener('click', () => {
        this.setSelected(item.type);
        this.onSelect(item.type);
      });

      this.container.appendChild(btn);
    });
  }
}
