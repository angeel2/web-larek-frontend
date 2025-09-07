import { IItemView, Product } from '../types';
import { ensureElement, ensureImageElement } from '../utils/utils';

interface ItemViewData {
  product: Product;
  isInCart: boolean;
}

export class ItemView implements IItemView {
  private element: HTMLElement;
  private image: HTMLImageElement;
  private title: HTMLElement;
  private category: HTMLElement;
  private price: HTMLElement;
  private product: Product;
  private modalHandler?: (product: Product) => void;

  constructor(template: HTMLElement, product: Product) {
    this.element = template.cloneNode(true) as HTMLElement;
    this.product = product;
    
    this.image = ensureImageElement('.card__image', this.element);
    this.title = ensureElement('.card__title', this.element);
    this.category = ensureElement('.card__category', this.element);
    this.price = ensureElement('.card__price', this.element);
  }

  render(data?: unknown): HTMLElement {
    const viewData = data as ItemViewData;

    this.image.src = this.product.image;
    this.image.alt = this.product.title;
    this.title.textContent = this.product.title;
    this.category.textContent = this.product.category;
    this.price.textContent = this.product.price !== null ? 
      `${this.product.price} синапсов` : 'Бесценно';

    const categoryClass = this.getCategoryClass(this.product.category);
    this.category.className = `card__category ${categoryClass}`;

    return this.element;
  }

  setModalHandler(handler: (product: Product) => void): void {
    this.modalHandler = handler;
    this.element.addEventListener('click', () => {
      this.modalHandler?.(this.product);
    });
  }

  private getCategoryClass(category: string): string {
    const categoryMap: Record<string, string> = {
      'софт-скил': 'card__category_soft',
      'хард-скил': 'card__category_hard',
      'другое': 'card__category_other',
      'дополнительное': 'card__category_additional',
      'кнопка': 'card__category_button'
    };
    return categoryMap[category] || 'card__category_other';
  }
}