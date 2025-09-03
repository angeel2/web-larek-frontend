import { ICartView } from '../types';
import { EventEmitter } from './base/events';
import { ensureElement, ensureButtonElement } from '../utils/utils';

export class CartView implements ICartView {
    private element: HTMLElement;
    private list: HTMLElement;
    private totalElement: HTMLElement;
    private checkoutButton: HTMLButtonElement;
    private events: EventEmitter;
    private checkoutHandler: (() => void) | null = null;
    private removeItemHandler: ((productId: string) => void) | null = null;

    constructor(template: HTMLElement, events: EventEmitter) {
        this.element = template;
        this.events = events;
        this.list = ensureElement('.basket__list', this.element);
        this.totalElement = ensureElement('.basket__price', this.element);
        this.checkoutButton = ensureButtonElement('.basket__button', this.element);
        this.init();
    }

    render(): HTMLElement {
        return this.element;
    }

    addItem(item: HTMLElement, itemId: string): void {
        const emptyMessage = this.list.querySelector('.basket__empty');
        if (emptyMessage) {
            emptyMessage.remove();
        }
        
        this.list.appendChild(item);
        this.updateTotal();
        this.updateCheckoutButton();
    }

    removeItem(itemId: string): void {
        const item = this.list.querySelector(`[data-id="${itemId}"]`);
        if (item) {
            item.remove();
            this.updateTotal();
            this.updateCheckoutButton();
            if (this.list.children.length === 0) {
                this.showEmptyMessage();
            }
        }
    }

    clear(): void {
        this.list.innerHTML = '';
        this.updateTotal();
        this.updateCheckoutButton();
    }

    setCheckoutHandler(handler: () => void): void {
        this.checkoutHandler = handler;
    }

    setRemoveItemHandler(handler: (productId: string) => void): void {
        this.removeItemHandler = handler;
    }

    updateTotal(total?: number): void {
        if (total !== undefined) {
            this.totalElement.textContent = `${total} синапсов`;
        }
    }

    private showEmptyMessage(): void {
        if (!this.list.querySelector('.basket__empty')) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'basket__empty';
            emptyMessage.textContent = 'Корзина пуста';
            this.list.appendChild(emptyMessage);
        }
    }

    private init(): void {
        this.checkoutButton.addEventListener('click', () => {
            if (this.checkoutHandler && !this.checkoutButton.disabled) {
                this.checkoutHandler();
            }
        });

        this.list.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            if (target.classList.contains('basket__item-delete')) {
                const itemElement = target.closest('.basket__item');
                if (itemElement) {
                    const itemId = itemElement.getAttribute('data-id');
                    if (itemId && this.removeItemHandler) {
                        this.removeItemHandler(itemId);
                    }
                }
            }
        });
    }

    private updateCheckoutButton(): void {
        const hasItems = this.list.children.length > 0 && 
                        !this.list.querySelector('.basket__empty');
        this.checkoutButton.disabled = !hasItems;
    }
}