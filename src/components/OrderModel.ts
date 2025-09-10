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
    this.validate();
  }

  private validate(): void {
    const errors: ValidationErrors = {};

    if (!this.payment) {
      errors.payment = 'Выберите способ оплаты';
    }
    
    if (!this.address.trim()) {
      errors.address = 'Введите адрес доставки';
    }

    if (this.email && this.email.trim()) {
      if (!validateEmail(this.email)) {
        errors.email = 'Введите корректный email';
      }
    }

    if (this.phone && this.phone.trim()) {
      if (!validatePhone(this.phone)) {
        errors.phone = 'Введите корректный телефон';
      }
    }

    this.errors = errors;
    this.events.emit('form:validate', errors);
  }

  validateStep1(): ValidationErrors {
    const errors: ValidationErrors = {};
    if (!this.payment) errors.payment = 'Выберите способ оплаты';
    if (!this.address.trim()) errors.address = 'Введите адрес доставки';
    return errors;
  }

  validateStep2(): ValidationErrors {
    const errors: ValidationErrors = {};
    
    if (!this.email.trim()) {
      errors.email = 'Введите email';
    } else if (!validateEmail(this.email)) {
      errors.email = 'Введите корректный email';
    }
    
    if (!this.phone.trim()) {
      errors.phone = 'Введите телефон';
    } else if (!validatePhone(this.phone)) {
      errors.phone = 'Введите корректный телефон';
    }
    
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