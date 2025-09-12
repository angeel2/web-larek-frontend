import { IOrderModel, PaymentType, ValidationErrors, Order } from '../types';
import { validateEmail, validatePhone } from '../utils/utils';
import { EventEmitter } from './base/events';

export class OrderModel implements IOrderModel {
  payment: PaymentType = PaymentType.ONLINE;
  address: string = '';
  email: string = '';
  phone: string = '';
  private errors: ValidationErrors = {};

  constructor(private events: EventEmitter) {}

  setData(field: keyof Order, value: any): void {
    (this as any)[field] = value;
    this.validateField(field, value);
    this.events.emit('form:validate', this.getCurrentErrors());
  }

  private validateField(field: keyof Order, value: any): void {
    switch (field) {
      case 'payment':
        this.errors.payment = !value ? 'Выберите способ оплаты' : undefined;
        break;
      case 'address':
        this.errors.address = !value?.trim() ? 'Введите адрес доставки' : undefined;
        break;
      case 'email':
        this.validateEmail(value);
        break;
      case 'phone':
        this.validatePhone(value);
        break;
    }
  }

  private validateEmail(email: string): void {
    if (!email?.trim()) {
      this.errors.email = 'Введите email';
    } else if (!validateEmail(email)) {
      this.errors.email = 'Введите корректный email';
    } else {
      this.errors.email = undefined;
    }
  }

  private validatePhone(phone: string): void {
    if (!phone?.trim()) {
      this.errors.phone = 'Введите телефон';
    } else if (!validatePhone(phone)) {
      this.errors.phone = 'Введите корректный телефон';
    } else {
      this.errors.phone = undefined;
    }
  }

  validateStep1(): ValidationErrors {
    const errors: ValidationErrors = {};
    if (!this.payment) errors.payment = 'Выберите способ оплаты';
    if (!this.address.trim()) errors.address = 'Введите адрес доставки';
    return errors;
  }

  validateStep2(): ValidationErrors {
    this.validateEmail(this.email);
    this.validatePhone(this.phone);
    return this.getCurrentErrors();
  }

  private getCurrentErrors(): ValidationErrors {
    const errors: ValidationErrors = {};
    if (this.errors.email) errors.email = this.errors.email;
    if (this.errors.phone) errors.phone = this.errors.phone;
    if (this.errors.payment) errors.payment = this.errors.payment;
    if (this.errors.address) errors.address = this.errors.address;
    return errors;
  }

  reset(): void {
    this.payment = PaymentType.ONLINE;
    this.address = '';
    this.email = '';
    this.phone = '';
    this.errors = {};
    this.events.emit('form:validate', {});
  }

  getOrderData(): Omit<Order, 'items' | 'total'> {
    return {
      payment: this.payment,
      address: this.address,
      email: this.email,
      phone: this.phone
    };
  }
}