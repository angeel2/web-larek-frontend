import { ICartView } from '../types';
import { ensureElement, ensureButtonElement, ensureTemplateElement } from '../utils/utils';
import { CartItemView } from './CartItemView';
import { EventEmitter } from './base/events';

export class CartView implements ICartView {
    private element: HTMLElement;
    private list: HTMLElement;
    private totalElement: HTMLElement;
    private checkoutButton: HTMLButtonElement;
    private itemTemplate: HTMLTemplateElement;

    constructor(
        template: HTMLElement, 
        private events: EventEmitter, 
        private getCartItems: () => any[],
        private getCartTotal: () => number
    ) {
        this.element = template;
        this.list = ensureElement('.basket__list', this.element);
        this.totalElement = ensureElement('.basket__price', this.element);
        this.checkoutButton = ensureButtonElement('.basket__button', this.element);
        this.itemTemplate = ensureTemplateElement('#card-basket');
        
        this.initEvents();
        this.initCheckout();
    }

    private initEvents(): void {
        this.events.on('cart:list-updated', () => {
            this.update();
        });
    }

    private initCheckout(): void {
        this.checkoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (this.getCartItems().length === 0) {
                console.log('Корзина пуста');
                return;
            }
            
            this.events.emit('order:open');
        });
    }

    render(): HTMLElement {
        this.update();
        return this.element;
    }

    update(): void {
        this.list.innerHTML = '';
        const items = this.getCartItems();
        const total = this.getCartTotal();

        if (items && items.length > 0) {
            items.forEach((product: any, index: number) => {
                const itemElement = this.createBasketItem(product, index);
                this.list.appendChild(itemElement);
            });

            this.totalElement.textContent = `${total} синапсов`;
            this.checkoutButton.disabled = false;
        } else {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'basket__empty';
            emptyMessage.textContent = 'Корзина пуста';
            this.list.appendChild(emptyMessage);
            this.totalElement.textContent = '0 синапсов';
            this.checkoutButton.disabled = true;
        }
    }

    private createBasketItem(product: any, index: number): HTMLElement {
        const itemView = new CartItemView(this.itemTemplate, product, index, this.events);
        return itemView.getElement();
    }

    updateCounter(count: number): void {
    }

    showErrors(errors: any): void {}
}