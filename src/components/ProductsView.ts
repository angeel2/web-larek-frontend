import { ensureElement } from '../utils/utils';
import { EventEmitter } from './base/events';

export class ProductsView {
    private gallery: HTMLElement;

    constructor(private events: EventEmitter) {
        this.gallery = ensureElement('.gallery');
    }

    setProductItems(items: HTMLElement[]): void {
        this.clearGallery();
        items.forEach(item => this.gallery.appendChild(item));
    }

    showLoading(): void {
        this.clearGallery();
        this.gallery.innerHTML = '<p class="loading">Загрузка товаров...</p>';
    }

    showError(message: string): void {
        this.clearGallery();
        this.gallery.innerHTML = `<p class="error">${message}</p>`;
    }

    clearGallery(): void {
        this.gallery.innerHTML = '';
    }
}