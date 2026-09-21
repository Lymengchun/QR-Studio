/**
 * Templates Modal for quick-starting common QR code use-cases
 */

import { QRType } from '../qr/formats';

export interface TemplateItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  type: QRType;
  description: string;
  formData: Record<string, any>;
}

export const TEMPLATES: TemplateItem[] = [
  {
    id: 'tpl-website',
    name: 'Website / Portfolio',
    category: 'Web',
    icon: '🌐',
    type: 'url',
    description: 'Direct visitors to your homepage, blog, or store.',
    formData: { url: 'https://mywebsite.com' }
  },
  {
    id: 'tpl-instagram',
    name: 'Instagram Profile',
    category: 'Social',
    icon: '📸',
    type: 'url',
    description: 'Grow your followers directly from printed flyers or stickers.',
    formData: { url: 'https://instagram.com/mybrand' }
  },
  {
    id: 'tpl-facebook',
    name: 'Facebook Page',
    category: 'Social',
    icon: '👥',
    type: 'url',
    description: 'Link straight to your community page or business profile.',
    formData: { url: 'https://facebook.com/mybrand' }
  },
  {
    id: 'tpl-wifi',
    name: 'Guest Wi-Fi Access',
    category: 'Utility',
    icon: '📶',
    type: 'wifi',
    description: 'Allow guests to join your Wi-Fi network without typing passwords.',
    formData: { ssid: 'Guest_WiFi_5G', password: 'WelcomeGuest2026', security: 'WPA', hidden: false }
  },
  {
    id: 'tpl-vcard',
    name: 'Digital Business Card',
    category: 'Business',
    icon: '👤',
    type: 'vcard',
    description: 'Complete contact card saved instantly to phone address books.',
    formData: {
      firstName: 'Sarah',
      lastName: 'Chen',
      organization: 'Innovate Studio',
      phone: '+1 555-0144',
      email: 'sarah.chen@innovate.co',
      website: 'https://innovate.co',
      address: '742 Evergreen Terrace'
    }
  },
  {
    id: 'tpl-whatsapp',
    name: 'WhatsApp Support',
    category: 'Chat',
    icon: '🟢',
    type: 'whatsapp',
    description: 'Open a direct chat window with pre-filled message.',
    formData: { phone: '15550199', message: 'Hello! I am interested in your services.' }
  },
  {
    id: 'tpl-email',
    name: 'Customer Feedback Email',
    category: 'Contact',
    icon: '✉️',
    type: 'email',
    description: 'Pre-addressed email with subject ready for one-tap feedback.',
    formData: { email: 'feedback@mybrand.com', subject: 'Product Feedback', body: 'Hi Team,\n\nHere is my feedback:' }
  },
  {
    id: 'tpl-phone',
    name: 'Direct Hotline Call',
    category: 'Contact',
    icon: '📱',
    type: 'phone',
    description: 'Dial your business phone number instantly.',
    formData: { phone: '+1 800-555-0199' }
  },
  {
    id: 'tpl-location',
    name: 'Storefront Google Maps',
    category: 'Location',
    icon: '📍',
    type: 'location',
    description: 'Point visitors to your physical store or event location.',
    formData: { latitude: '37.7879', longitude: '-122.4075', label: 'Downtown Flagship Store' }
  },
  {
    id: 'tpl-crypto',
    name: 'Crypto / Tip Jar',
    category: 'Payment',
    icon: '🪙',
    type: 'crypto',
    description: 'Receive Bitcoin or crypto tips effortlessly.',
    formData: { coin: 'bitcoin', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', amount: '0.002', label: 'Tip Jar' }
  }
];

export class TemplatesModal {
  private overlay: HTMLElement;
  private onSelect: (template: TemplateItem) => void;

  constructor(onSelect: (template: TemplateItem) => void) {
    this.onSelect = onSelect;
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.render();
  }

  public getElement(): HTMLElement {
    return this.overlay;
  }

  public open(): void {
    this.overlay.classList.add('active');
  }

  public close(): void {
    this.overlay.classList.remove('active');
  }

  private render(): void {
    this.overlay.innerHTML = `
      <div class="modal-content" style="max-width: 680px;">
        <div class="modal-header">
          <div>
            <h3>Quick Templates</h3>
            <span class="hint">Choose a pre-filled template to get started immediately</span>
          </div>
          <button type="button" class="modal-close" id="btn-close-templates" aria-label="Close modal">✕</button>
        </div>

        <div class="modal-body">
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
            ${TEMPLATES.map(t => `
              <div class="card tpl-card" data-tpl-id="${t.id}" style="padding: 16px; cursor: pointer; transition: all var(--transition-fast);">
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <div style="font-size: 1.6rem; padding: 6px; background: var(--bg-surface-subtle); border-radius: var(--radius-md);">${t.icon}</div>
                  <div>
                    <div style="font-weight: 600; font-size: 0.9375rem; margin-bottom: 2px;">${t.name}</div>
                    <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.35;">${t.description}</p>
                    <span class="badge badge-subtle" style="margin-top: 8px;">${t.category}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" id="btn-close-tpl-footer" class="btn btn-secondary btn-sm">Close</button>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    this.overlay.querySelector('#btn-close-templates')?.addEventListener('click', () => this.close());
    this.overlay.querySelector('#btn-close-tpl-footer')?.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    const cards = this.overlay.querySelectorAll<HTMLElement>('.tpl-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.tplId;
        const found = TEMPLATES.find(t => t.id === id);
        if (found) {
          this.onSelect(found);
          this.close();
        }
      });
    });
  }
}
