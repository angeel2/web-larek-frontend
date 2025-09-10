import { IProductModalView, Product } from '../types';
import { ensureElement, ensureImageElement, ensureButtonElement, cloneTemplate } from '../utils/utils';
import { EventEmitter } from './base/events';

interface ProductModalData {
    product: Product;
    isInCart: boolean;
}

export class ProductModalView implements IProductModalView {
    private element: HTMLElement;
    private image: HTMLImageElement;
    private title: HTMLElement;
    private category: HTMLElement;
    private description: HTMLElement;
    private price: HTMLElement;
    private button: HTMLButtonElement;
    private currentProduct: Product | null = null;
    private currentIsInCart: boolean = false;

    constructor(template: HTMLElement, private events: EventEmitter) {
        this.element = template.cloneNode(true) as HTMLElement;

        this.image = ensureImageElement('.card__image', this.element);
        this.title = ensureElement('.card__title', this.element);
        this.category = ensureElement('.card__category', this.element);
        this.description = ensureElement('.card__text', this.element);
        this.price = ensureElement('.card__price', this.element);
        this.button = ensureButtonElement('.card__button', this.element);

        this.initHandlers();
    }

    private initHandlers(): void {
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleButtonClick();
        });
    }

    render(data?: unknown): HTMLElement {
        const modalData = data as ProductModalData;
        if (!modalData?.product) return this.element;

        this.currentProduct = modalData.product;
        this.currentIsInCart = modalData.isInCart;

        this.image.src = this.currentProduct.image;
        this.image.alt = this.currentProduct.title;
        this.title.textContent = this.currentProduct.title;
        this.category.textContent = this.currentProduct.category;
        this.description.textContent = this.currentProduct.description;

        const categoryClass = this.getCategoryClass(this.currentProduct.category);
        this.category.className = `card__category ${categoryClass}`;

        if (this.currentProduct.price === null) {
            this.price.textContent = 'Бесценно';
            this.button.textContent = 'Не продается';
            this.button.disabled = true;
            this.button.classList.add('button_alt');
        } else {
            this.price.textContent = `${this.currentProduct.price} синапсов`;
            this.button.textContent = this.currentIsInCart ? 'Убрать из корзины' : 'Купить';
            this.button.disabled = false;
            this.button.classList.toggle('button_alt', this.currentIsInCart);
        }

        return this.element;
    }

    private handleButtonClick(): void {
        if (!this.currentProduct || this.currentProduct.price === null) return;

        const action = this.currentIsInCart ? 'remove' : 'add';
        this.events.emit('cart:action', { 
            product: this.currentProduct, 
            action: action 
        });
        this.events.emit('modal:close');
    }

    updateCartState(isInCart: boolean): void {
        if (this.currentProduct && this.currentProduct.price !== null) {
            this.currentIsInCart = isInCart;
            this.button.textContent = isInCart ? 'Убрать из корзины' : 'Купить';
            this.button.classList.toggle('button_alt', isInCart);
        }
    }

    getCurrentProductId(): string | null {
        return this.currentProduct?.id || null;
    }

    getCurrentProduct(): Product | null {
        return this.currentProduct;
    }

    private getCategoryClass(category: string): string {
        const categoryMap: Record<string, string> = {
            'софт-скил': 'card__category_soft',
            'хард-скил': 'card__category_hard',
            'другое': 'card__category_other',
            'дополнительное': 'card__category_additional',
            'кнопка': 'card__category_button',
        };
        return categoryMap[category] || 'card__category_other';
    }
}