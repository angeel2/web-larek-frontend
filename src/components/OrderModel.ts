import { IOrderModel, Order, PaymentType, ValidationErrors } from '../types';
import { validateEmail, validatePhone } from '../utils/utils';
import { ERROR_MESSAGES } from '../utils/constants';

export class OrderModel implements IOrderModel {
    payment: PaymentType = PaymentType.ONLINE;
    address: string = '';
    email: string = '';
    phone: string = '';
    items: string[] = [];
    total: number = 0;

    get customerFullInfo(): Order {
        return {
            payment: this.payment,
            address: this.address,
            email: this.email,
            phone: this.phone,
            items: this.items,
            total: this.total
        };
    }

    validateStep1(): ValidationErrors {
        const errors: ValidationErrors = {};
        if (!this.payment) errors.payment = ERROR_MESSAGES.SELECT_PAYMENT;
        if (!this.address.trim()) errors.address = ERROR_MESSAGES.ENTER_ADDRESS;
        return errors;
    }

    validateStep2(): ValidationErrors {
        const errors: ValidationErrors = {};
        
        if (!this.email.trim()) errors.email = ERROR_MESSAGES.REQUIRED_FIELD;
        else if (!validateEmail(this.email)) errors.email = ERROR_MESSAGES.INVALID_EMAIL;
        
        if (!this.phone.trim()) errors.phone = ERROR_MESSAGES.REQUIRED_FIELD;
        else if (!validatePhone(this.phone)) errors.phone = ERROR_MESSAGES.INVALID_PHONE;
        
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