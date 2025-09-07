import { ICartView } from '../types';
import { ensureElement, ensureButtonElement } from '../utils/utils';

interface CartData {
  items: HTMLElement[];
  total: number;
}

export class CartView implements ICartView {
  private element: HTMLElement;
  private list: HTMLElement;
  private totalElement: HTMLElement;
  private checkoutButton: HTMLButtonElement;
  private actionHandler?: (productId: string, action: 'remove') => void;

  constructor(template: HTMLElement) {
    this.element = template;
    this.list = ensureElement('.basket__list', this.element);
    this.totalElement = ensureElement('.basket__price', this.element);
    this.checkoutButton = ensureButtonElement('.basket__button', this.element);
  }

  render(data?: unknown): HTMLElement {
    const cartData = data as CartData;
    this.list.innerHTML = '';
    
    if (cartData?.items && cartData.items.length > 0) {
      cartData.items.forEach(item => this.list.appendChild(item));
      this.totalElement.textContent = `${cartData.total} синапсов`;
      this.checkoutButton.disabled = false;
    } else {
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'basket__empty';
      emptyMessage.textContent = 'Корзина пуста';
      this.list.appendChild(emptyMessage);
      this.totalElement.textContent = '0 синапсов';
      this.checkoutButton.disabled = true;
    }
    
    return this.element;
  }

  setCheckoutHandler(handler: () => void): void {
    this.checkoutButton.addEventListener('click', handler);
  }

  setActionHandler(handler: (productId: string, action: 'remove') => void): void {
    this.actionHandler = handler;
    
    this.list.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('basket__item-delete')) {
        const item = target.closest('.basket__item');
        const productId = item?.getAttribute('data-id');
        if (productId && this.actionHandler) {
          event.preventDefault();
          event.stopPropagation();
          this.actionHandler(productId, 'remove');
        }
      }
    });
  }
}