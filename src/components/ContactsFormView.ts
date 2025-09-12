import { IContactsFormView, ValidationErrors } from '../types';
import { ensureElement, ensureButtonElement, ensureInputElement } from '../utils/utils';
import { EventEmitter } from './base/events';

export class ContactsFormView implements IContactsFormView {
  private element: HTMLElement;
  private emailInput: HTMLInputElement;
  private phoneInput: HTMLInputElement;
  private submitButton: HTMLButtonElement;
  private errorsContainer: HTMLElement;

  constructor(template: HTMLElement, private events: EventEmitter) {
    this.element = template;
    this.emailInput = ensureInputElement('input[name="email"]', this.element);
    this.phoneInput = ensureInputElement('input[name="phone"]', this.element);
    this.submitButton = ensureButtonElement('button[type="submit"]', this.element);
    this.errorsContainer = ensureElement('.form__errors', this.element);

    this.init();
  }

  render(data?: unknown): HTMLElement {
    const orderData = data as { email?: string; phone?: string };
    
    this.emailInput.value = orderData?.email || '';
    this.phoneInput.value = orderData?.phone || '';
    
    this.clearErrors();
    this.updateButton();
    return this.element;
  }

  showErrors(errors: ValidationErrors): void {
    this.clearErrors();
    
    if (errors.email) {
      const error = document.createElement('div');
      error.className = 'form__error';
      error.textContent = errors.email;
      this.errorsContainer.appendChild(error);
    }
    
    if (errors.phone) {
      const error = document.createElement('div');
      error.className = 'form__error';
      error.textContent = errors.phone;
      this.errorsContainer.appendChild(error);
    }

    this.updateButton();
  }

  validate(errors: ValidationErrors): void {
    this.showErrors(errors);
  }

  private init(): void {
    this.emailInput.addEventListener('input', () => {
      this.events.emit('order:change', { field: 'email', value: this.emailInput.value });
    });

    this.phoneInput.addEventListener('input', () => {
      this.events.emit('order:change', { field: 'phone', value: this.phoneInput.value });
    });

    this.element.addEventListener('submit', (e) => {
      e.preventDefault();
      this.events.emit('order:submit');
    });
  }

  private updateButton(): void {
    const email = this.emailInput.value.trim();
    const phone = this.phoneInput.value.trim();
    const hasErrors = this.errorsContainer.children.length > 0;
    
    this.submitButton.disabled = !(email && phone) || hasErrors;
  }

  private clearErrors(): void {
    this.errorsContainer.innerHTML = '';
  }

  isContactsForm(): boolean {
    return !!this.element.querySelector('input[name="email"]');
  }
}