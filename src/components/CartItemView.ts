import { Product } from '../types';
import { ensureElement, cloneTemplate } from '../utils/utils';
import { EventEmitter } from './base/events';

export class CartItemView {
    private element: HTMLElement;
    private deleteBtn: HTMLElement;

    constructor(template: HTMLTemplateElement, private product: Product, private index: number, private events: EventEmitter) {
        this.element = cloneTemplate(template);
        this.deleteBtn = ensureElement('.basket__item-delete', this.element);
        
        this.render();
        this.initHandlers();
    }

    private initHandlers(): void {
        this.deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.events.emit('cart:action', { 
                productId: this.product.id, 
                action: 'remove' 
            });
        });
    }

    private render(): void {
        const indexEl = ensureElement('.basket__item-index', this.element);
        const titleEl = ensureElement('.card__title', this.element);
        const priceEl = ensureElement('.card__price', this.element);

        indexEl.textContent = (this.index + 1).toString();
        titleEl.textContent = this.product.title;
        priceEl.textContent = this.product.price !== null ? 
            `${this.product.price} синапсов` : 'Бесценно';
        this.element.setAttribute('data-id', this.product.id);
    }

    getElement(): HTMLElement {
        return this.element;
    }
}