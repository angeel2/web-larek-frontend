import { IOrderFormView, IContactsFormView, PaymentType, ValidationErrors } from '../types';
import { ensureElement, ensureButtonElement, ensureInputElement } from '../utils/utils';
import { EventEmitter } from './base/events';

export class OrderFormView implements IOrderFormView {
  private element: HTMLElement;
  private onlineButton: HTMLButtonElement;
  private cashButton: HTMLButtonElement;
  private addressInput: HTMLInputElement;
  private nextButton: HTMLButtonElement;
  private errorsContainer: HTMLElement;
  private currentPayment: PaymentType | null = null;

  constructor(template: HTMLElement, private events: EventEmitter) {
    this.element = template;
    this.onlineButton = ensureButtonElement('button[name="card"]', this.element);
    this.cashButton = ensureButtonElement('button[name="cash"]', this.element);
    this.addressInput = ensureInputElement('input[name="address"]', this.element);
    this.nextButton = ensureButtonElement('.order__button', this.element);
    this.errorsContainer = ensureElement('.form__errors', this.element);

    this.init();
  }

  render(data?: unknown): HTMLElement {
    const orderData = data as { payment?: PaymentType; address?: string };
    
    this.setPayment(orderData?.payment || PaymentType.ONLINE, false);
    this.addressInput.value = orderData?.address || '';
    
    this.updateButton();
    this.clearErrors();
    return this.element;
  }

  showErrors(errors: ValidationErrors): void {
    this.clearErrors();
    
    if (errors.payment) {
      const error = document.createElement('div');
      error.className = 'form__error';
      error.textContent = errors.payment;
      this.errorsContainer.appendChild(error);
    }
    
    if (errors.address) {
      const error = document.createElement('div');
      error.className = 'form__error';
      error.textContent = errors.address;
      this.errorsContainer.appendChild(error);
    }

    this.updateButton();
  }

  validate(errors: ValidationErrors): void {
    this.showErrors(errors);
  }

  private init(): void {
    this.onlineButton.addEventListener('click', () => {
      this.setPayment(PaymentType.ONLINE, true);
    });

    this.cashButton.addEventListener('click', () => {
      this.setPayment(PaymentType.CASH, true);
    });

    this.addressInput.addEventListener('input', () => {
      this.events.emit('order:change', { field: 'address', value: this.addressInput.value });
      this.updateButton();
    });

    this.nextButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.events.emit('order:next');
    });

    this.element.addEventListener('submit', (e) => {
      e.preventDefault();
      this.events.emit('order:next');
    });
  }

  private setPayment(payment: PaymentType, emitEvent: boolean): void {
    this.currentPayment = payment;
    this.onlineButton.classList.toggle('button_alt-active', payment === PaymentType.ONLINE);
    this.cashButton.classList.toggle('button_alt-active', payment === PaymentType.CASH);
    
    if (emitEvent) {
      this.events.emit('order:change', { field: 'payment', value: payment });
    }
    
    this.updateButton();
  }

  private updateButton(): void {
    const hasPayment = this.currentPayment !== null;
    const hasAddress = this.addressInput.value.trim() !== '';
    this.nextButton.disabled = !(hasPayment && hasAddress);
  }

  private clearErrors(): void {
    this.errorsContainer.innerHTML = '';
  }

  setNextHandler(handler: () => void): void {}
  setSubmitHandler(handler: (data: any) => void): void {}
}

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
    
    this.updateButton();
    this.clearErrors();
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
      this.updateButton();
    });

    this.phoneInput.addEventListener('input', () => {
      this.events.emit('order:change', { field: 'phone', value: this.phoneInput.value });
      this.updateButton();
    });

    this.submitButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.events.emit('order:submit');
    });

    this.element.addEventListener('submit', (e) => {
      e.preventDefault();
      this.events.emit('order:submit');
    });
  }

  private updateButton(): void {
    const email = this.emailInput.value.trim();
    const phone = this.phoneInput.value.trim();
    const isEnabled = email !== '' && phone !== '';
    
    this.submitButton.disabled = !isEnabled;
  }

  private clearErrors(): void {
    this.errorsContainer.innerHTML = '';
  }

  setBackHandler(handler: () => void): void {}
  setSubmitHandler(handler: (data: any) => void): void {}
}