/**
 * History Panel Component (Modal/Slide-over)
 */

import {
  HistoryItem,
  loadHistory,
  deleteHistoryItem,
  clearHistory,
  formatTimeAgo,
  loadSettings,
  saveSettings,
  AppSettings
} from '../utils/storage';
import { QR_TYPES } from './QRTypeSelector';
import { showToast } from '../utils/clipboard';

export interface HistoryCallbacks {
  onRegenerate: (item: HistoryItem) => void;
  onClose: () => void;
}

export class HistoryPanel {
  private overlay: HTMLElement;
  private callbacks: HistoryCallbacks;
  private settings: AppSettings;

  constructor(callbacks: HistoryCallbacks) {
    this.callbacks = callbacks;
    this.settings = loadSettings();
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.render();
  }

  public getElement(): HTMLElement {
    return this.overlay;
  }

  public open(): void {
    this.settings = loadSettings();
    this.render();
    this.overlay.classList.add('active');
  }

  public close(): void {
    this.overlay.classList.remove('active');
    this.callbacks.onClose();
  }

  private getTypeIcon(type: string): string {
    const found = QR_TYPES.find(t => t.type === type);
    return found ? found.icon : '📄';
  }

  private render(): void {
    const history = loadHistory();

    this.overlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <h3>Recent QR Codes</h3>
            <span class="hint">Stored locally on your device (Max 20)</span>
          </div>
          <button type="button" class="modal-close" id="btn-close-modal" aria-label="Close modal">✕</button>
        </div>

        <div class="modal-body">
          <!-- Security Setting -->
          <div style="margin-bottom: 16px; padding: 10px 14px; background: var(--bg-surface-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <label class="checkbox-label" style="font-size: 0.8125rem;">
              <input type="checkbox" id="check-omit-sensitive" ${this.settings.omitSensitive ? 'checked' : ''} />
              Do not save sensitive QR content (e.g. Wi-Fi passwords)
            </label>
          </div>

          ${history.length === 0 ? `
            <div style="text-align: center; padding: 36px 0; color: var(--text-muted);">
              <div style="font-size: 2rem; margin-bottom: 8px;">📭</div>
              <p style="font-weight: 500;">No recent QR codes</p>
              <p class="hint">QR codes you generate will appear here for easy reuse.</p>
            </div>
          ` : `
            <div id="history-list">
              ${history.map(item => `
                <div class="history-item" data-id="${item.id}">
                  <div class="history-item-left">
                    <span class="history-item-icon">${this.getTypeIcon(item.type)}</span>
                    <div class="history-item-details">
                      <div class="history-item-title">${escapeHtml(item.title)}</div>
                      <div class="history-item-snippet">${escapeHtml(item.snippet)} • ${formatTimeAgo(item.createdAt)}</div>
                    </div>
                  </div>
                  <div class="history-item-actions">
                    <button type="button" class="btn btn-primary btn-sm btn-regen" data-id="${item.id}" title="Load this QR code into generator">
                      Load
                    </button>
                    <button type="button" class="btn btn-outline btn-sm btn-del" data-id="${item.id}" title="Remove from history" style="color: var(--error);">
                      ✕
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <div class="modal-footer" style="justify-content: space-between;">
          ${history.length > 0 ? `
            <button type="button" id="btn-clear-all" class="btn btn-danger btn-sm">
              Clear All History
            </button>
          ` : '<div></div>'}
          <button type="button" id="btn-done" class="btn btn-secondary btn-sm">
            Done
          </button>
        </div>
      </div>
    `;

    this.attachEventListeners(history);
  }

  private attachEventListeners(history: HistoryItem[]): void {
    // Close events
    this.overlay.querySelector('#btn-close-modal')?.addEventListener('click', () => this.close());
    this.overlay.querySelector('#btn-done')?.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Sensitive setting toggle
    const checkSensitive = this.overlay.querySelector<HTMLInputElement>('#check-omit-sensitive');
    checkSensitive?.addEventListener('change', () => {
      this.settings.omitSensitive = checkSensitive.checked;
      saveSettings(this.settings);
      showToast(this.settings.omitSensitive ? 'Sensitive data protection enabled' : 'Sensitive data protection disabled', 'success');
    });

    // Regenerate
    const regenBtns = this.overlay.querySelectorAll<HTMLButtonElement>('.btn-regen');
    regenBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const item = history.find(h => h.id === id);
        if (item) {
          this.callbacks.onRegenerate(item);
          this.close();
          showToast(`Loaded ${item.title}`, 'success');
        }
      });
    });

    // Delete single
    const delBtns = this.overlay.querySelectorAll<HTMLButtonElement>('.btn-del');
    delBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (id) {
          deleteHistoryItem(id);
          this.render();
          showToast('Item deleted', 'success');
        }
      });
    });

    // Clear all
    const clearBtn = this.overlay.querySelector('#btn-clear-all');
    clearBtn?.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all history?')) {
        clearHistory();
        this.render();
        showToast('History cleared', 'success');
      }
    });
  }
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
