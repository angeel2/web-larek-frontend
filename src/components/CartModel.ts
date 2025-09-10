import { ICartModel, Product, ApiProduct } from '../types';
import { EventEmitter } from './base/events';
import { CDN_URL } from '../utils/constants';

export class CartModel implements ICartModel {
  private items: Product[] = [];
  private allProducts: Product[] = [];
  private error: string | null = null;
  private loading: boolean = false;

  constructor(private events: EventEmitter) {}

  add(item: Product): void {
    if (!this.hasItem(item.id) && item.price !== null) {
      this.items.push(item);
      this.events.emit('cart:changed');
      this.events.emit('cart:list-updated');
    }
  }

  remove(itemId: string): void {
    const index = this.items.findIndex(item => item.id === itemId);
    if (index > -1) {
      this.items.splice(index, 1);
      this.events.emit('cart:changed');
      this.events.emit('cart:list-updated');
    }
  }

  clear(): void {
    this.items = [];
    this.events.emit('cart:changed');
    this.events.emit('cart:list-updated');
  }

  getItems(): string[] {
    return this.items.map(item => item.id);
  }

  getProducts(): Product[] {
    return [...this.items];
  }

  getProduct(itemId: string): Product | undefined {
    return this.items.find(item => item.id === itemId);
  }

  getTotal(): number {
    return this.items.reduce((total, product) => total + (product.price || 0), 0);
  }

  hasItem(itemId: string): boolean {
    return this.items.some(item => item.id === itemId);
  }

  getItemCount(): number {
    return this.items.length;
  }

  setLoading(state: boolean): void {
    this.loading = state;
    if (state) {
      this.events.emit('products:loading');
    }
  }

  isLoading(): boolean {
    return this.loading;
  }

  setAllProducts(apiProducts: ApiProduct[]): void {
    try {
      this.allProducts = apiProducts.map((apiProduct: ApiProduct) => ({
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
    return [...this.allProducts];
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