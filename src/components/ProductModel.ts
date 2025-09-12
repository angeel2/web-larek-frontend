import { Product, ApiProduct } from '../types';
import { EventEmitter } from './base/events';
import { CDN_URL } from '../utils/constants';

export class ProductModel {
  private products: Product[] = [];
  private error: string | null = null;
  private loading: boolean = false;

  constructor(private events: EventEmitter) {}

  setLoading(state: boolean): void {
    this.loading = state;
    if (state) {
      this.events.emit('products:loading');
    }
  }

  isLoading(): boolean {
    return this.loading;
  }

  setProducts(apiProducts: ApiProduct[]): void {
    try {
      this.products = apiProducts.map((apiProduct: ApiProduct) => ({
        id: apiProduct.id,
        title: apiProduct.title,
        description: apiProduct.description,
        price: apiProduct.price,
        image: CDN_URL + apiProduct.image,
        category: apiProduct.category,
      }));
      this.error = null;
      this.loading = false;
      this.events.emit('products:loaded');
    } catch (error) {
      this.setError('Ошибка обработки данных товаров');
    }
  }

  getAllProducts(): Product[] {
    return [...this.products];
  }

  getProductById(id: string): Product | undefined {
    return this.products.find(product => product.id === id);
  }

  setError(message: string): void {
    this.error = message;
    this.loading = false;
    this.events.emit('products:error', this.error);
  }

  getError(): string | null {
    return this.error;
  }
}