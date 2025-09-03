import { IOrderFormView, IContactsFormView, Order, PaymentType, ValidationErrors } from '../types';
import { EventEmitter } from './base/events';
import { ensureElement, ensureButtonElement, ensureInputElement, validateEmail, validatePhone } from '../utils/utils';
import { ERROR_MESSAGES } from '../utils/constants';

export class OrderFormView implements IOrderFormView {
    private element: HTMLElement;
    private events: EventEmitter;
    private onlineButton: HTMLButtonElement;
    private cashButton: HTMLButtonElement;
    private addressInput: HTMLInputElement;
    private nextButton: HTMLButtonElement;
    private errorsContainer: HTMLElement;
    private submitHandler: ((data: Partial<Order>) => void) | null = null;
    private nextStepHandler: (() => void) | null = null;
    private selectedPayment: PaymentType | null = null;

    constructor(template: HTMLElement, events: EventEmitter) {
        this.element = template;
        this.events = events;
        this.onlineButton = ensureButtonElement('button[name="card"]', this.element);
        this.cashButton = ensureButtonElement('button[name="cash"]', this.element);
        this.addressInput = ensureInputElement('input[name="address"]', this.element);
        this.nextButton = ensureButtonElement('.order__button', this.element);
        this.errorsContainer = ensureElement('.form__errors', this.element);
        this.init();
    }

    render(): HTMLElement {
        this.clearValidationErrors();
        this.selectedPayment = null;
        this.onlineButton.classList.remove('button_alt-active');
        this.cashButton.classList.remove('button_alt-active');
        this.addressInput.value = '';
        this.validateForm();
        return this.element;
    }

    setSubmitHandler(handler: (data: Partial<Order>) => void): void {
        this.submitHandler = handler;
    }

    setNextStepHandler(handler: () => void): void {
        this.nextStepHandler = handler;
    }

    showValidationErrors(errors: ValidationErrors): void {
        this.errorsContainer.innerHTML = '';
        
        if (errors.payment) {
            const errorElement = document.createElement('div');
            errorElement.className = 'form__error';
            errorElement.textContent = errors.payment;
            this.errorsContainer.appendChild(errorElement);
        }
        
        if (errors.address) {
            const errorElement = document.createElement('div');
            errorElement.className = 'form__error';
            errorElement.textContent = errors.address;
            this.errorsContainer.appendChild(errorElement);
        }
    }

    clearValidationErrors(): void {
        this.errorsContainer.innerHTML = '';
    }

    private init(): void {
        this.onlineButton.addEventListener('click', () => {
            this.setPaymentMethod(PaymentType.ONLINE);
        });

        this.cashButton.addEventListener('click', () => {
            this.setPaymentMethod(PaymentType.CASH);
        });

        this.addressInput.addEventListener('input', () => {
            this.validateForm();
        });

        this.element.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });
    }

    private setPaymentMethod(method: PaymentType): void {
        this.selectedPayment = method;
        this.onlineButton.classList.toggle('button_alt-active', method === PaymentType.ONLINE);
        this.cashButton.classList.toggle('button_alt-active', method === PaymentType.CASH);
        this.validateForm();
    }

    private validateForm(): void {
        const hasPayment = this.selectedPayment !== null;
        const hasAddress = this.addressInput.value.trim() !== '';
        
        this.nextButton.disabled = !(hasPayment && hasAddress);
        
        const errors: ValidationErrors = {};
        
        if (!hasPayment) {
            errors.payment = ERROR_MESSAGES.SELECT_PAYMENT;
        }
        
        if (!hasAddress) {
            errors.address = ERROR_MESSAGES.ENTER_ADDRESS;
        }
        
        if (Object.keys(errors).length > 0) {
            this.showValidationErrors(errors);
        } else {
            this.clearValidationErrors();
        }
    }

    private submitForm(): void {
        if (this.selectedPayment && this.addressInput.value.trim()) {
            const formData: Partial<Order> = {
                payment: this.selectedPayment,
                address: this.addressInput.value.trim()
            };

            if (this.submitHandler) {
                this.submitHandler(formData);
            }

            if (this.nextStepHandler) {
                this.nextStepHandler();
            }
        }
    }
}

export class ContactsFormView implements IContactsFormView {
    private element: HTMLElement;
    private events: EventEmitter;
    private emailInput: HTMLInputElement;
    private phoneInput: HTMLInputElement;
    private submitButton: HTMLButtonElement;
    private backButton: HTMLButtonElement;
    private errorsContainer: HTMLElement;
    private submitHandler: ((data: Partial<Order>) => void) | null = null;
    private backHandler: (() => void) | null = null;

    constructor(template: HTMLElement, events: EventEmitter) {
        this.element = template;
        this.events = events;
        this.emailInput = ensureInputElement('input[name="email"]', this.element);
        this.phoneInput = ensureInputElement('input[name="phone"]', this.element);
        this.submitButton = ensureButtonElement('button[type="submit"]', this.element);
        this.errorsContainer = ensureElement('.form__errors', this.element);
        
        this.backButton = document.createElement('button');
        this.backButton.type = 'button';
        this.backButton.className = 'button button_alt';
        this.backButton.textContent = 'Назад';
        this.submitButton.before(this.backButton);
        
        this.init();
    }

    render(): HTMLElement {
        this.clearValidationErrors();
        this.emailInput.value = '';
        this.phoneInput.value = '';
        this.validateForm();
        return this.element;
    }

    setSubmitHandler(handler: (data: Partial<Order>) => void): void {
        this.submitHandler = handler;
    }

    setBackHandler(handler: () => void): void {
        this.backHandler = handler;
    }

    showValidationErrors(errors: ValidationErrors): void {
        this.errorsContainer.innerHTML = '';
        
        if (errors.email) {
            const errorElement = document.createElement('div');
            errorElement.className = 'form__error';
            errorElement.textContent = errors.email;
            this.errorsContainer.appendChild(errorElement);
        }
        
        if (errors.phone) {
            const errorElement = document.createElement('div');
            errorElement.className = 'form__error';
            errorElement.textContent = errors.phone;
            this.errorsContainer.appendChild(errorElement);
        }
    }

    clearValidationErrors(): void {
        this.errorsContainer.innerHTML = '';
    }

    private init(): void {
        this.emailInput.addEventListener('input', () => {
            this.validateForm();
        });

        this.phoneInput.addEventListener('input', () => {
            this.validateForm();
        });

        this.element.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });

        this.backButton.addEventListener('click', () => {
            if (this.backHandler) {
                this.backHandler();
            }
        });
    }

    private validateForm(): void {
        const email = this.emailInput.value.trim();
        const phone = this.phoneInput.value.trim();
        
        const isEmailEmpty = email === '';
        const isPhoneEmpty = phone === '';
        const isValidEmail = !isEmailEmpty && validateEmail(email);
        const isValidPhone = !isPhoneEmpty && validatePhone(phone);
        
        this.submitButton.disabled = isEmailEmpty || isPhoneEmpty || !isValidEmail || !isValidPhone;
        
        const errors: ValidationErrors = {};
        
        if (isEmailEmpty) {
            errors.email = ERROR_MESSAGES.REQUIRED_FIELD;
        } else if (!isValidEmail) {
            errors.email = ERROR_MESSAGES.INVALID_EMAIL;
        }
        
        if (isPhoneEmpty) {
            errors.phone = ERROR_MESSAGES.REQUIRED_FIELD;
        } else if (!isValidPhone) {
            errors.phone = ERROR_MESSAGES.INVALID_PHONE;
        }
        
        if (Object.keys(errors).length > 0) {
            this.showValidationErrors(errors);
        } else {
            this.clearValidationErrors();
        }
    }

    private submitForm(): void {
        const email = this.emailInput.value.trim();
        const phone = this.phoneInput.value.trim();
        
        const isEmailEmpty = email === '';
        const isPhoneEmpty = phone === '';
        const isValidEmail = validateEmail(email);
        const isValidPhone = validatePhone(phone);
        
        if (isEmailEmpty || isPhoneEmpty || !isValidEmail || !isValidPhone) {
            const errors: ValidationErrors = {};
            
            if (isEmailEmpty) errors.email = ERROR_MESSAGES.REQUIRED_FIELD;
            else if (!isValidEmail) errors.email = ERROR_MESSAGES.INVALID_EMAIL;
            
            if (isPhoneEmpty) errors.phone = ERROR_MESSAGES.REQUIRED_FIELD;
            else if (!isValidPhone) errors.phone = ERROR_MESSAGES.INVALID_PHONE;
            
            this.showValidationErrors(errors);
            return;
        }

        const formData: Partial<Order> = {
            email: email,
            phone: phone
        };

        if (this.submitHandler) {
            this.submitHandler(formData);
        }
    }
}