import { IOrderFormView, IContactsFormView, Order, PaymentType, ValidationErrors } from '../types';
import { ensureElement, ensureButtonElement, ensureInputElement, validateEmail, validatePhone } from '../utils/utils';

export class OrderFormView implements IOrderFormView {
  private element: HTMLElement;
  private onlineButton: HTMLButtonElement;
  private cashButton: HTMLButtonElement;
  private addressInput: HTMLInputElement;
  private nextButton: HTMLButtonElement;
  private errorsContainer: HTMLElement;
  private submitHandler?: (data: Partial<Order>) => void;
  private nextHandler?: () => void;
  private selectedPayment: PaymentType | null = null;

  constructor(template: HTMLElement) {
    this.element = template;
    this.onlineButton = ensureButtonElement('button[name="card"]', this.element);
    this.cashButton = ensureButtonElement('button[name="cash"]', this.element);
    this.addressInput = ensureInputElement('input[name="address"]', this.element);
    this.nextButton = ensureButtonElement('.order__button', this.element);
    this.errorsContainer = ensureElement('.form__errors', this.element);

    this.init();
  }

  render(data?: unknown): HTMLElement {
    const orderData = data as Partial<Order>;
    if (orderData?.payment) {
      this.setPayment(orderData.payment);
    }
    if (orderData?.address) {
      this.addressInput.value = orderData.address;
    }
    this.updateButton();
    this.clearErrors();
    return this.element;
  }

  setSubmitHandler(handler: (data: Partial<Order>) => void): void {
    this.submitHandler = handler;
  }

  setNextHandler(handler: () => void): void {
    this.nextHandler = handler;
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
  }

  private clearErrors(): void {
    this.errorsContainer.innerHTML = '';
  }

  private init(): void {
    this.onlineButton.addEventListener('click', () => this.setPayment(PaymentType.ONLINE));
    this.cashButton.addEventListener('click', () => this.setPayment(PaymentType.CASH));
    this.addressInput.addEventListener('input', () => this.updateButton());
    
    this.element.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submit();
    });
  }

  private setPayment(payment: PaymentType): void {
    this.selectedPayment = payment;
    this.onlineButton.classList.toggle('button_alt-active', payment === PaymentType.ONLINE);
    this.cashButton.classList.toggle('button_alt-active', payment === PaymentType.CASH);
    this.updateButton();
  }

  private updateButton(): void {
    const hasPayment = this.selectedPayment !== null;
    const hasAddress = this.addressInput.value.trim() !== '';
    this.nextButton.disabled = !(hasPayment && hasAddress);
  }

  private submit(): void {
    if (this.selectedPayment && this.addressInput.value.trim()) {
      this.submitHandler?.({ 
        payment: this.selectedPayment, 
        address: this.addressInput.value.trim() 
      });
      this.nextHandler?.();
    }
  }
}

export class ContactsFormView implements IContactsFormView {
  private element: HTMLElement;
  private emailInput: HTMLInputElement;
  private phoneInput: HTMLInputElement;
  private submitButton: HTMLButtonElement;
  private errorsContainer: HTMLElement;
  private submitHandler?: (data: Partial<Order>) => void;
  private backHandler?: () => void;

  constructor(template: HTMLElement) {
    this.element = template;
    this.emailInput = ensureInputElement('input[name="email"]', this.element);
    this.phoneInput = ensureInputElement('input[name="phone"]', this.element);
    this.submitButton = ensureButtonElement('button[type="submit"]', this.element);
    this.errorsContainer = ensureElement('.form__errors', this.element);

    this.emailInput.addEventListener('input', () => this.updateButton());
    this.phoneInput.addEventListener('input', () => this.updateButton());
    
    this.element.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submit();
    });
  }

  render(data?: unknown): HTMLElement {
    const orderData = data as Partial<Order>;
    if (orderData?.email) this.emailInput.value = orderData.email;
    if (orderData?.phone) this.phoneInput.value = orderData.phone;
    this.updateButton();
    this.clearErrors();
    return this.element;
  }

  setSubmitHandler(handler: (data: Partial<Order>) => void): void {
    this.submitHandler = handler;
  }

  setBackHandler(handler: () => void): void {
    this.backHandler = handler;
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
  }

  private clearErrors(): void {
    this.errorsContainer.innerHTML = '';
  }

  private updateButton(): void {
    const email = this.emailInput.value.trim();
    const phone = this.phoneInput.value.trim();
    const isValidEmail = validateEmail(email);
    const isValidPhone = validatePhone(phone);
    this.submitButton.disabled = !(email && phone && isValidEmail && isValidPhone);
  }

  private submit(): void {
    const email = this.emailInput.value.trim();
    const phone = this.phoneInput.value.trim();
    
    if (email && phone) {
      this.submitHandler?.({ email, phone });
    }
  }
}