import { ICartModel, Product } from '../types';
import { EventEmitter } from './base/events';

export class CartModel implements ICartModel {
    private items: Product[] = [];
    private events: EventEmitter;

    constructor(events: EventEmitter) {
        this.events = events;
        this.loadFromStorage();
    }

    add(item: Product): void {
        if (!this.hasItem(item.id)) {
            this.items.push(item);
            this.saveToStorage();
            this.events.emit('cart:changed');
        }
    }

    remove(itemId: string): void {
        const index = this.items.findIndex(item => item.id === itemId);
        if (index > -1) {
            this.items.splice(index, 1);
            this.saveToStorage();
            this.events.emit('cart:changed');
        }
    }

    clear(): void {
        this.items = [];
        this.saveToStorage();
        this.events.emit('cart:changed');
    }

    getItems(): string[] {
        return this.items.map(item => item.id);
    }

    getProducts(): Product[] {
        return [...this.items];
    }

    getTotal(): number {
        return this.items.reduce((total, product) => {
            return total + (product.price || 0);
        }, 0);
    }

    hasItem(itemId: string): boolean {
        return this.items.some(item => item.id === itemId);
    }

    getItemCount(): number {
        return this.items.length;
    }

    getProduct(itemId: string): Product | undefined {
        return this.items.find(item => item.id === itemId);
    }

    private saveToStorage(): void {
        localStorage.setItem('cart', JSON.stringify({
            items: this.items,
            timestamp: Date.now()
        }));
    }

    private loadFromStorage(): void {
        try {
            const saved = localStorage.getItem('cart');
            if (saved) {
                const data = JSON.parse(saved);
                this.items = data.items || [];
            }
        } catch (error) {
            console.error('Failed to load cart from storage:', error);
        }
    }
}