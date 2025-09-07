import { Api } from './base/api';
import { IApi, ApiProduct, Order } from '../types';

export class DataApi extends Api implements IApi {
  constructor(baseUrl: string) {
    super(baseUrl, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getItems(): Promise<{ items: ApiProduct[] }> {
    return this.get<{ items: ApiProduct[] }>('/product');
  }

  async getItem(id: string): Promise<ApiProduct> {
    return this.get<ApiProduct>(`/product/${id}`);
  }

  async sendOrder(data: Order): Promise<{ id: string }> {
    return this.post<{ id: string }>('/order', data);
  }
}