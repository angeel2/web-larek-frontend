import { IDataApi, ApiProduct, Order } from '../types';
import { Api } from './base/api';

export class DataApi extends Api implements IDataApi {
    constructor(baseUrl: string) {
        super(baseUrl, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async getItems(): Promise<{ items: ApiProduct[] }> {
        try {
            return await this.get<{ items: ApiProduct[] }>('/product');
        } catch (error) {
            console.error('Failed to get items:', error);
            throw new Error('Не удалось загрузить товары');
        }
    }

    async getItem(id: string): Promise<ApiProduct> {
        try {
            return await this.get<ApiProduct>(`/product/${id}`);
        } catch (error) {
            console.error('Failed to get item:', error);
            throw new Error('Не удалось загрузить товар');
        }
    }

    async sendOrder(data: Order): Promise<{ id: string }> {
        try {
            const orderData = {
                payment: data.payment,
                address: data.address.trim(),
                email: data.email.trim(),
                phone: data.phone.replace(/\D/g, ''),
                items: data.items,
                total: data.total
            };

            return await this.post<{ id: string }>('/order', orderData);
        } catch (error) {
            console.error('Failed to send order:', error);
            throw new Error('Не удалось оформить заказ');
        }
    }
}