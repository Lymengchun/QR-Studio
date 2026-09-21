/**
 * QR Form Component with reactive inputs and validation
 */

import {
  QRType,
  formatWiFi,
  formatVCard,
  formatEmail,
  formatPhone,
  formatSMS,
  formatLocation,
  formatWhatsApp,
  formatCalendar,
  formatCrypto
} from '../qr/formats';
import {
  isValidUrl,
  isValidEmail,
  isValidPhone,
  isValidWiFi,
  isValidCoordinates
} from '../qr/validators';
import { showToast } from '../utils/clipboard';

export interface FormChangePayload {
  type: QRType;
  payload: string;
  title: string;
  snippet: string;
  formData: Record<string, any>;
  isValid: boolean;
}

export class QRForm {
  private container: HTMLElement;
  private currentType: QRType = 'url';
  private onChange: (data: FormChangePayload) => void;
  private formDataMap: Map<QRType, Record<string, any>> = new Map();

  constructor(initialType: QRType = 'url', onChange: (data: FormChangePayload) => void) {
    this.currentType = initialType;
    this.onChange = onChange;
    this.container = document.createElement('div');
    this.container.className = 'card form-card';
    this.initDefaultData();
    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  private initDefaultData(): void {
    this.formDataMap.set('url', { url: 'https://example.com' });
    this.formDataMap.set('text', { text: 'Hello, welcome to QR Studio!' });
    this.formDataMap.set('wifi', { ssid: 'MyHomeWiFi', password: '', security: 'WPA', hidden: false });
    this.formDataMap.set('vcard', {
      firstName: 'Alex',
      lastName: 'Morgan',
      organization: 'Acme Studio',
      phone: '+1 555-0199',
      email: 'alex@example.com',
      website: 'https://example.com',
      address: 'San Francisco, CA'
    });
    this.formDataMap.set('email', { email: 'hello@example.com', subject: 'Inquiry', body: 'Hi there!' });
    this.formDataMap.set('phone', { phone: '+1 555-0199' });
    this.formDataMap.set('sms', { phone: '+1 555-0199', message: 'Hello from QR Studio' });
    this.formDataMap.set('location', { latitude: '37.7749', longitude: '-122.4194', label: 'San Francisco' });
    this.formDataMap.set('whatsapp', { phone: '+15550199', message: 'Hi! Let\'s connect.' });
    this.formDataMap.set('calendar', {
      title: 'Coffee Meeting',
      location: 'Downtown Cafe',
      startDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 90000000).toISOString().slice(0, 16),
      description: 'Quick catchup chat'
    });
    this.formDataMap.set('crypto', {
      coin: 'bitcoin',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      amount: '0.005',
      label: 'Tip jar'
    });
  }

  public setType(type: QRType, preservedFormData?: Record<string, any>): void {
    this.currentType = type;
    if (preservedFormData) {
      this.formDataMap.set(type, { ...preservedFormData });
    }
    this.render();
    this.emitChange();
  }

  public setFormData(type: QRType, data: Record<string, any>): void {
    this.formDataMap.set(type, { ...data });
    if (this.currentType === type) {
      this.render();
      this.emitChange();
    }
  }

  private getFormData(): Record<string, any> {
    return this.formDataMap.get(this.currentType) || {};
  }

  private updateField(field: string, value: any): void {
    const current = this.getFormData();
    current[field] = value;
    this.formDataMap.set(this.currentType, current);
    this.emitChange();
  }

  private emitChange(): void {
    const data = this.getFormData();
    let payload = '';
    let title = '';
    let snippet = '';
    let isValid = true;
    let errorMsg = '';

    switch (this.currentType) {
      case 'url': {
        const urlVal = data.url || '';
        const v = isValidUrl(urlVal);
        isValid = v.isValid;
        errorMsg = v.errorMessage || '';
        const fullUrl = urlVal.startsWith('http://') || urlVal.startsWith('https://')
          ? urlVal
          : `https://${urlVal}`;
        payload = isValid ? fullUrl : urlVal;
        title = urlVal || 'Website URL';
        snippet = 'Website link';
        break;
      }
      case 'text': {
        payload = data.text || '';
        isValid = payload.trim().length > 0;
        if (!isValid) errorMsg = 'Please enter some text.';
        title = payload.length > 25 ? `${payload.substring(0, 25)}...` : payload || 'Plain Text';
        snippet = 'Text note';
        break;
      }
      case 'wifi': {
        const v = isValidWiFi(data.ssid || '');
        isValid = v.isValid;
        errorMsg = v.errorMessage || '';
        payload = formatWiFi({
          ssid: data.ssid || '',
          password: data.password || '',
          security: data.security || 'WPA',
          hidden: !!data.hidden
        });
        title = `Wi-Fi: ${data.ssid || 'Network'}`;
        snippet = `${data.security || 'WPA'} Network`;
        break;
      }
      case 'vcard': {
        const fn = [data.firstName, data.lastName].filter(Boolean).join(' ');
        isValid = fn.trim().length > 0 || !!data.phone || !!data.email;
        if (!isValid) errorMsg = 'Please enter at least a name, phone, or email.';
        payload = formatVCard({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          organization: data.organization,
          phone: data.phone,
          email: data.email,
          website: data.website,
          address: data.address
        });
        title = fn || 'Contact Card';
        snippet = data.organization || data.phone || data.email || 'vCard';
        break;
      }
      case 'email': {
        const v = isValidEmail(data.email || '');
        isValid = v.isValid;
        errorMsg = v.errorMessage || '';
        payload = formatEmail({
          email: data.email || '',
          subject: data.subject,
          body: data.body
        });
        title = data.email || 'Email';
        snippet = data.subject ? `Subject: ${data.subject}` : 'Email message';
        break;
      }
      case 'phone': {
        const v = isValidPhone(data.phone || '');
        isValid = v.isValid;
        errorMsg = v.errorMessage || '';
        payload = formatPhone(data.phone || '');
        title = data.phone || 'Phone Number';
        snippet = 'Direct call';
        break;
      }
      case 'sms': {
        const v = isValidPhone(data.phone || '');
        isValid = v.isValid;
        errorMsg = v.errorMessage || '';
        payload = formatSMS({
          phone: data.phone || '',
          message: data.message || ''
        });
        title = data.phone || 'SMS';
        snippet = data.message ? `SMS: "${data.message.substring(0, 20)}..."` : 'Text SMS';
        break;
      }
      case 'location': {
        const v = isValidCoordinates(data.latitude || '', data.longitude || '');
        isValid = v.isValid;
        errorMsg = v.errorMessage || '';
        payload = formatLocation({
          latitude: data.latitude || '0',
          longitude: data.longitude || '0',
          label: data.label
        });
        title = data.label || `Map (${data.latitude}, ${data.longitude})`;
        snippet = 'Google Maps coordinates';
        break;
      }
      case 'whatsapp': {
        const v = isValidPhone(data.phone || '');
        isValid = v.isValid;
        errorMsg = v.errorMessage || '';
        payload = formatWhatsApp({
          phone: data.phone || '',
          message: data.message || ''
        });
        title = `WhatsApp: ${data.phone || ''}`;
        snippet = data.message ? `Message: "${data.message.substring(0, 20)}..."` : 'Chat link';
        break;
      }
      case 'calendar': {
        isValid = !!data.title && data.title.trim().length > 0;
        if (!isValid) errorMsg = 'Please enter an event title.';
        payload = formatCalendar({
          title: data.title || '',
          location: data.location,
          startDate: data.startDate || '',
          endDate: data.endDate,
          description: data.description
        });
        title = `Event: ${data.title || 'Meeting'}`;
        snippet = data.startDate ? new Date(data.startDate).toLocaleDateString() : 'iCalendar event';
        break;
      }
      case 'crypto': {
        isValid = !!data.address && data.address.trim().length > 0;
        if (!isValid) errorMsg = 'Please enter a valid wallet address.';
        payload = formatCrypto({
          coin: data.coin || 'bitcoin',
          address: data.address || '',
          amount: data.amount,
          label: data.label
        });
        title = `${(data.coin || 'Crypto').toUpperCase()} Payment`;
        snippet = `${data.amount ? `${data.amount} ` : ''}${data.address ? `${data.address.substring(0, 10)}...` : ''}`;
        break;
      }
    }

    // Render error message container if present
    const errorEl = this.container.querySelector('#form-error-msg');
    if (errorEl) {
      if (!isValid && errorMsg) {
        errorEl.textContent = errorMsg;
        errorEl.removeAttribute('style');
      } else {
        errorEl.textContent = '';
        errorEl.setAttribute('style', 'display: none;');
      }
    }

    this.onChange({
      type: this.currentType,
      payload,
      title,
      snippet,
      formData: { ...data },
      isValid
    });
  }

  private render(): void {
    const data = this.getFormData();
    let fieldsHtml = '';

    switch (this.currentType) {
      case 'url':
        fieldsHtml = `
          <div class="form-group">
            <label for="input-url">Website URL <span class="hint">e.g. https://yourbrand.com</span></label>
            <input type="url" id="input-url" class="form-control" placeholder="https://example.com" value="${escapeAttr(data.url || '')}" autofocus />
          </div>
        `;
        break;

      case 'text':
        fieldsHtml = `
          <div class="form-group">
            <label for="input-text">Text Content <span class="hint" id="char-counter">${(data.text || '').length} characters</span></label>
            <textarea id="input-text" class="form-control" rows="4" placeholder="Enter any text, notes, or instructions...">${escapeAttr(data.text || '')}</textarea>
          </div>
        `;
        break;

      case 'wifi':
        fieldsHtml = `
          <div class="form-group">
            <label for="input-wifi-ssid">Network Name (SSID) *</label>
            <input type="text" id="input-wifi-ssid" class="form-control" placeholder="e.g. Office_WiFi" value="${escapeAttr(data.ssid || '')}" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="input-wifi-pass">Password</label>
              <div style="position: relative;">
                <input type="password" id="input-wifi-pass" class="form-control" placeholder="Wi-Fi Password" value="${escapeAttr(data.password || '')}" />
                <button type="button" id="btn-toggle-pass" style="position: absolute; right: 10px; top: 10px; font-size: 0.8rem; color: var(--text-muted);">Show</button>
              </div>
            </div>
            <div class="form-group">
              <label for="input-wifi-sec">Security</label>
              <select id="input-wifi-sec" class="form-control">
                <option value="WPA" ${data.security === 'WPA' ? 'selected' : ''}>WPA / WPA2 / WPA3</option>
                <option value="WEP" ${data.security === 'WEP' ? 'selected' : ''}>WEP</option>
                <option value="nopass" ${data.security === 'nopass' ? 'selected' : ''}>None (Open)</option>
              </select>
            </div>
          </div>
          <div class="form-group" style="margin-top: 4px;">
            <label class="checkbox-label">
              <input type="checkbox" id="input-wifi-hidden" ${data.hidden ? 'checked' : ''} />
              Hidden Network (SSID is not broadcasted)
            </label>
          </div>
        `;
        break;

      case 'vcard':
        fieldsHtml = `
          <div class="form-row">
            <div class="form-group">
              <label for="input-vcard-fn">First Name *</label>
              <input type="text" id="input-vcard-fn" class="form-control" placeholder="Alex" value="${escapeAttr(data.firstName || '')}" />
            </div>
            <div class="form-group">
              <label for="input-vcard-ln">Last Name</label>
              <input type="text" id="input-vcard-ln" class="form-control" placeholder="Morgan" value="${escapeAttr(data.lastName || '')}" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="input-vcard-org">Organization / Company</label>
              <input type="text" id="input-vcard-org" class="form-control" placeholder="Acme Inc." value="${escapeAttr(data.organization || '')}" />
            </div>
            <div class="form-group">
              <label for="input-vcard-phone">Phone Number</label>
              <input type="tel" id="input-vcard-phone" class="form-control" placeholder="+1 555-0199" value="${escapeAttr(data.phone || '')}" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="input-vcard-email">Email</label>
              <input type="email" id="input-vcard-email" class="form-control" placeholder="alex@example.com" value="${escapeAttr(data.email || '')}" />
            </div>
            <div class="form-group">
              <label for="input-vcard-web">Website</label>
              <input type="url" id="input-vcard-web" class="form-control" placeholder="https://alex.com" value="${escapeAttr(data.website || '')}" />
            </div>
          </div>
          <div class="form-group">
            <label for="input-vcard-addr">Address</label>
            <input type="text" id="input-vcard-addr" class="form-control" placeholder="Street, City, Country" value="${escapeAttr(data.address || '')}" />
          </div>
        `;
        break;

      case 'email':
        fieldsHtml = `
          <div class="form-group">
            <label for="input-email-addr">Email Address *</label>
            <input type="email" id="input-email-addr" class="form-control" placeholder="recipient@example.com" value="${escapeAttr(data.email || '')}" />
          </div>
          <div class="form-group">
            <label for="input-email-sub">Subject</label>
            <input type="text" id="input-email-sub" class="form-control" placeholder="General Inquiry" value="${escapeAttr(data.subject || '')}" />
          </div>
          <div class="form-group">
            <label for="input-email-body">Message Body</label>
            <textarea id="input-email-body" class="form-control" rows="3" placeholder="Write message here...">${escapeAttr(data.body || '')}</textarea>
          </div>
        `;
        break;

      case 'phone':
        fieldsHtml = `
          <div class="form-group">
            <label for="input-phone-num">Phone Number * <span class="hint">Includes country code e.g. +1 555 0199</span></label>
            <input type="tel" id="input-phone-num" class="form-control" placeholder="+1 555-0199" value="${escapeAttr(data.phone || '')}" />
          </div>
        `;
        break;

      case 'sms':
        fieldsHtml = `
          <div class="form-group">
            <label for="input-sms-num">Phone Number *</label>
            <input type="tel" id="input-sms-num" class="form-control" placeholder="+1 555-0199" value="${escapeAttr(data.phone || '')}" />
          </div>
          <div class="form-group">
            <label for="input-sms-msg">Pre-filled Message</label>
            <textarea id="input-sms-msg" class="form-control" rows="3" placeholder="Hello, I would like to learn more...">${escapeAttr(data.message || '')}</textarea>
          </div>
        `;
        break;

      case 'location':
        fieldsHtml = `
          <div class="form-row">
            <div class="form-group">
              <label for="input-loc-lat">Latitude *</label>
              <input type="text" id="input-loc-lat" class="form-control" placeholder="37.7749" value="${escapeAttr(data.latitude || '')}" />
            </div>
            <div class="form-group">
              <label for="input-loc-lng">Longitude *</label>
              <input type="text" id="input-loc-lng" class="form-control" placeholder="-122.4194" value="${escapeAttr(data.longitude || '')}" />
            </div>
          </div>
          <div class="form-group">
            <label for="input-loc-lbl">Location Label</label>
            <input type="text" id="input-loc-lbl" class="form-control" placeholder="San Francisco Center" value="${escapeAttr(data.label || '')}" />
          </div>
          <div style="display: flex; gap: 10px; margin-top: 4px;">
            <button type="button" id="btn-curr-loc" class="btn btn-secondary btn-sm">📍 Use My GPS Location</button>
            <a id="link-open-map" href="https://www.google.com/maps?q=${data.latitude || '0'},${data.longitude || '0'}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">🗺️ Open Map ↗</a>
          </div>
        `;
        break;

      case 'whatsapp':
        fieldsHtml = `
          <div class="form-group">
            <label for="input-wa-phone">WhatsApp Number * <span class="hint">Digits with country code, e.g. 15550199</span></label>
            <input type="tel" id="input-wa-phone" class="form-control" placeholder="15550199" value="${escapeAttr(data.phone || '')}" />
          </div>
          <div class="form-group">
            <label for="input-wa-msg">Prefilled Message</label>
            <textarea id="input-wa-msg" class="form-control" rows="3" placeholder="Hi! I am contacting you from your website...">${escapeAttr(data.message || '')}</textarea>
          </div>
        `;
        break;

      case 'calendar':
        fieldsHtml = `
          <div class="form-group">
            <label for="input-cal-title">Event Title *</label>
            <input type="text" id="input-cal-title" class="form-control" placeholder="Product Launch" value="${escapeAttr(data.title || '')}" />
          </div>
          <div class="form-group">
            <label for="input-cal-loc">Event Location</label>
            <input type="text" id="input-cal-loc" class="form-control" placeholder="Conference Room A / Zoom Link" value="${escapeAttr(data.location || '')}" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="input-cal-start">Start Date & Time</label>
              <input type="datetime-local" id="input-cal-start" class="form-control" value="${escapeAttr(data.startDate || '')}" />
            </div>
            <div class="form-group">
              <label for="input-cal-end">End Date & Time</label>
              <input type="datetime-local" id="input-cal-end" class="form-control" value="${escapeAttr(data.endDate || '')}" />
            </div>
          </div>
          <div class="form-group">
            <label for="input-cal-desc">Description</label>
            <textarea id="input-cal-desc" class="form-control" rows="2" placeholder="Agenda and meeting details...">${escapeAttr(data.description || '')}</textarea>
          </div>
        `;
        break;

      case 'crypto':
        fieldsHtml = `
          <div class="form-row">
            <div class="form-group">
              <label for="input-crypto-coin">Cryptocurrency</label>
              <select id="input-crypto-coin" class="form-control">
                <option value="bitcoin" ${data.coin === 'bitcoin' ? 'selected' : ''}>Bitcoin (BTC)</option>
                <option value="ethereum" ${data.coin === 'ethereum' ? 'selected' : ''}>Ethereum (ETH)</option>
                <option value="solana" ${data.coin === 'solana' ? 'selected' : ''}>Solana (SOL)</option>
                <option value="usdt" ${data.coin === 'usdt' ? 'selected' : ''}>Tether (USDT)</option>
              </select>
            </div>
            <div class="form-group">
              <label for="input-crypto-amt">Amount (Optional)</label>
              <input type="text" id="input-crypto-amt" class="form-control" placeholder="0.05" value="${escapeAttr(data.amount || '')}" />
            </div>
          </div>
          <div class="form-group">
            <label for="input-crypto-addr">Wallet Address *</label>
            <input type="text" id="input-crypto-addr" class="form-control" placeholder="bc1q..." value="${escapeAttr(data.address || '')}" />
          </div>
          <div class="form-group">
            <label for="input-crypto-lbl">Payment Label (Optional)</label>
            <input type="text" id="input-crypto-lbl" class="form-control" placeholder="Coffee donation" value="${escapeAttr(data.label || '')}" />
          </div>
        `;
        break;
    }

    this.container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 1.15rem; font-weight: 600;">Content</h3>
        <span class="badge badge-subtle">Instant Live Update</span>
      </div>
      <form id="qr-main-form" onsubmit="return false;">
        ${fieldsHtml}
        <div id="form-error-msg" class="form-error" style="display: none;"></div>
        <div style="margin-top: 14px; display: flex; justify-content: flex-end;">
          <button type="submit" id="btn-generate-submit" class="btn btn-primary btn-sm">
            <span>⚡ Refresh QR</span>
          </button>
        </div>
      </form>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const form = this.container.querySelector('#qr-main-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.emitChange();
      showToast('QR Code updated!', 'success');
    });

    const bindInput = (id: string, field: string, isCheckbox: boolean = false) => {
      const el = this.container.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`#${id}`);
      if (!el) return;
      const handler = () => {
        const val = isCheckbox ? (el as HTMLInputElement).checked : el.value;
        this.updateField(field, val);
        if (id === 'input-text') {
          const counter = this.container.querySelector('#char-counter');
          if (counter) counter.textContent = `${el.value.length} characters`;
        }
      };
      el.addEventListener('input', handler);
      el.addEventListener('change', handler);
    };

    switch (this.currentType) {
      case 'url':
        bindInput('input-url', 'url');
        break;
      case 'text':
        bindInput('input-text', 'text');
        break;
      case 'wifi':
        bindInput('input-wifi-ssid', 'ssid');
        bindInput('input-wifi-pass', 'password');
        bindInput('input-wifi-sec', 'security');
        bindInput('input-wifi-hidden', 'hidden', true);
        const togglePass = this.container.querySelector<HTMLButtonElement>('#btn-toggle-pass');
        togglePass?.addEventListener('click', () => {
          const passInput = this.container.querySelector<HTMLInputElement>('#input-wifi-pass');
          if (passInput) {
            const isPass = passInput.type === 'password';
            passInput.type = isPass ? 'text' : 'password';
            togglePass.textContent = isPass ? 'Hide' : 'Show';
          }
        });
        break;
      case 'vcard':
        bindInput('input-vcard-fn', 'firstName');
        bindInput('input-vcard-ln', 'lastName');
        bindInput('input-vcard-org', 'organization');
        bindInput('input-vcard-phone', 'phone');
        bindInput('input-vcard-email', 'email');
        bindInput('input-vcard-web', 'website');
        bindInput('input-vcard-addr', 'address');
        break;
      case 'email':
        bindInput('input-email-addr', 'email');
        bindInput('input-email-sub', 'subject');
        bindInput('input-email-body', 'body');
        break;
      case 'phone':
        bindInput('input-phone-num', 'phone');
        break;
      case 'sms':
        bindInput('input-sms-num', 'phone');
        bindInput('input-sms-msg', 'message');
        break;
      case 'location':
        bindInput('input-loc-lat', 'latitude');
        bindInput('input-loc-lng', 'longitude');
        bindInput('input-loc-lbl', 'label');
        const gpsBtn = this.container.querySelector('#btn-curr-loc');
        gpsBtn?.addEventListener('click', () => {
          if ('geolocation' in navigator) {
            gpsBtn.textContent = '⌛ Locating...';
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const lat = pos.coords.latitude.toFixed(5);
                const lng = pos.coords.longitude.toFixed(5);
                this.updateField('latitude', lat);
                this.updateField('longitude', lng);
                const latInput = this.container.querySelector<HTMLInputElement>('#input-loc-lat');
                const lngInput = this.container.querySelector<HTMLInputElement>('#input-loc-lng');
                if (latInput) latInput.value = lat;
                if (lngInput) lngInput.value = lng;
                const mapLink = this.container.querySelector<HTMLAnchorElement>('#link-open-map');
                if (mapLink) mapLink.href = `https://www.google.com/maps?q=${lat},${lng}`;
                gpsBtn.textContent = '📍 GPS Updated!';
                setTimeout(() => { gpsBtn.textContent = '📍 Use My GPS Location'; }, 2000);
              },
              () => {
                showToast('Unable to retrieve location permission', 'warning');
                gpsBtn.textContent = '📍 Use My GPS Location';
              }
            );
          } else {
            showToast('Geolocation not supported by this browser', 'error');
          }
        });
        break;
      case 'whatsapp':
        bindInput('input-wa-phone', 'phone');
        bindInput('input-wa-msg', 'message');
        break;
      case 'calendar':
        bindInput('input-cal-title', 'title');
        bindInput('input-cal-loc', 'location');
        bindInput('input-cal-start', 'startDate');
        bindInput('input-cal-end', 'endDate');
        bindInput('input-cal-desc', 'description');
        break;
      case 'crypto':
        bindInput('input-crypto-coin', 'coin');
        bindInput('input-crypto-addr', 'address');
        bindInput('input-crypto-amt', 'amount');
        bindInput('input-crypto-lbl', 'label');
        break;
    }
  }
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
