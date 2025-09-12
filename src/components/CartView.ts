import { ICartView } from '../types';
import { ensureElement, ensureButtonElement } from '../utils/utils';
import { EventEmitter } from './base/events';

export class CartView implements ICartView {
	private element: HTMLElement;
	private list: HTMLElement;
	private totalElement: HTMLElement;
	private checkoutButton: HTMLButtonElement;

	constructor(template: HTMLElement, private events: EventEmitter) {
		this.element = template;
		this.list = ensureElement('.basket__list', this.element);
		this.totalElement = ensureElement('.basket__price', this.element);
		this.checkoutButton = ensureButtonElement('.basket__button', this.element);

		this.initCheckout();
	}

	private initCheckout(): void {
		this.checkoutButton.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.events.emit('order:open');
		});
	}

	render(): HTMLElement {
		return this.element;
	}

	setListItems(items: HTMLElement[]): void {
		this.list.innerHTML = '';
		if (items.length === 0) {
			this.showEmptyMessage();
		} else {
			items.forEach((item) => this.list.appendChild(item));
		}
	}

	setTotal(total: number): void {
		this.totalElement.textContent = `${total} синапсов`;
	}

	setCheckoutEnabled(isEnabled: boolean): void {
		this.checkoutButton.disabled = !isEnabled;
	}

	update(items: HTMLElement[], total: number): void {
		this.setListItems(items);
		this.setTotal(total);
		this.setCheckoutEnabled(items.length > 0);
	}

	private showEmptyMessage(): void {
		const emptyMessage = document.createElement('p');
		emptyMessage.className = 'basket__empty';
		emptyMessage.textContent = 'Корзина пуста';
		this.list.appendChild(emptyMessage);
	}

	isCartOpen(): boolean {
		return this.element.closest('.modal_active') !== null;
	}
}
