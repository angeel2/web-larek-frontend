import { IOrderFormView, PaymentType, ValidationErrors } from '../types';
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
    
    this.clearErrors();
    this.updateButton();
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
  }

  private updateButton(): void {
    const hasPayment = this.currentPayment !== null;
    const hasAddress = this.addressInput.value.trim() !== '';
    const hasErrors = this.errorsContainer.children.length > 0;
    
    this.nextButton.disabled = !(hasPayment && hasAddress) || hasErrors;
  }

  private clearErrors(): void {
    this.errorsContainer.innerHTML = '';
  }

  isOrderForm(): boolean {
    return !!this.element.querySelector('input[name="address"]');
  }
}