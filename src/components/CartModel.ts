import { ICartModel, Product } from '../types';
import { EventEmitter } from './base/events';

export class CartModel implements ICartModel {
  private items: Product[] = [];

  constructor(private events: EventEmitter) {
    
  }

  add(item: Product): void {
    if (!this.hasItem(item.id)) {
      this.items.push(item);
      this.events.emit('cart:changed');
    }
  }

  remove(itemId: string): void {
    const index = this.items.findIndex(item => item.id === itemId);
    if (index > -1) {
      this.items.splice(index, 1);
      this.events.emit('cart:changed');
    }
  }

  clear(): void {
    this.items = [];
    this.events.emit('cart:changed');
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
}