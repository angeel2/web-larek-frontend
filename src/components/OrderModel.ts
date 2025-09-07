import { IOrderModel, Order, PaymentType, ValidationErrors } from '../types';
import { validateEmail, validatePhone } from '../utils/utils';

export class OrderModel implements IOrderModel {
  payment: PaymentType = PaymentType.ONLINE;
  address: string = '';
  email: string = '';
  phone: string = '';
  items: string[] = [];
  total: number = 0;

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
    this.items = [];
    this.total = 0;
  }
}