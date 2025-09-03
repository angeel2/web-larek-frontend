import { IItemView, Product } from '../types';
import { EventEmitter } from './base/events';
import {
    cloneTemplate,
    ensureElement,
    ensureButtonElement,
    ensureImageElement,
    getCategoryClass,
} from '../utils/utils';

export class ItemView implements IItemView {
    data: Product;
    private events: EventEmitter;
    private element: HTMLElement;
    private addToCartHandler: ((product: Product) => void) | null = null;
    private removeFromCartHandler: ((productId: string) => void) | null = null;
    private isInCartHandler: ((productId: string) => boolean) | null = null;

    constructor(template: HTMLElement, events: EventEmitter, data: Product) {
        this.element = template;
        this.events = events;
        this.data = data;
        this.init();
    }

    render(): HTMLElement {
        this.updateContent();
        if (this.isInCartHandler) {
            this.updateButtonState(this.isInCartHandler(this.data.id));
        }
        return this.element;
    }

    getCartItemView(template: HTMLTemplateElement): HTMLElement {
        const element = cloneTemplate(template);

        const indexElement = element.querySelector('.basket__item-index');
        const titleElement = element.querySelector('.card__title');
        const priceElement = element.querySelector('.card__price');
        const deleteBtn = element.querySelector('.basket__item-delete');

        if (titleElement) titleElement.textContent = this.data.title;
        if (priceElement) {
            priceElement.textContent = this.data.price !== null ? `${this.data.price} синапсов` : 'Бесценно';
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.removeFromCartHandler) {
                    this.removeFromCartHandler(this.data.id);
                }
            });
        }

        return element;
    }

    getModalItemView(template: HTMLTemplateElement): HTMLElement {
        const element = cloneTemplate(template);
        const image = ensureImageElement('.card__image', element);
        const title = ensureElement('.card__title', element);
        const category = ensureElement('.card__category', element);
        const description = ensureElement('.card__text', element);
        const price = ensureElement('.card__price', element);
        const button = ensureButtonElement('.card__button', element);

        image.src = this.data.image;
        image.alt = this.data.title;
        title.textContent = this.data.title;
        category.textContent = this.data.category;
        category.className = `card__category ${getCategoryClass(this.data.category)}`;
        description.textContent = this.data.description;
        price.textContent = this.data.price !== null ? `${this.data.price} синапсов` : 'Бесценно';

        if (this.isInCartHandler && this.isInCartHandler(this.data.id)) {
            button.textContent = 'Убрать из корзины';
            button.classList.add('button_alt');
        } else {
            button.textContent = 'В корзину';
            button.classList.remove('button_alt');
        }

        if (this.data.price === null) {
            button.textContent = 'Не продается';
            button.classList.add('button_alt');
            button.disabled = true;
        }

        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.data.price === null) return;

            if (this.isInCartHandler && this.isInCartHandler(this.data.id)) {
                if (this.removeFromCartHandler) {
                    this.removeFromCartHandler(this.data.id);
                    this.events.emit('modal:close');
                }
            } else {
                if (this.addToCartHandler) {
                    this.addToCartHandler(this.data);
                    this.events.emit('modal:close');
                }
            }
        });

        return element;
    }

    setAddToCartHandler(handler: (product: Product) => void): void {
        this.addToCartHandler = handler;
    }

    setRemoveFromCartHandler(handler: (productId: string) => void): void {
        this.removeFromCartHandler = handler;
    }

    setIsInCartHandler(handler: (productId: string) => boolean): void {
        this.isInCartHandler = handler;
    }

    updateButtonState(isInCart: boolean): void {
        const button = this.element.querySelector('.card__button') as HTMLButtonElement;
        if (button) {
            if (this.data.price === null) {
                button.textContent = 'Не продается';
                button.classList.add('button_alt');
                button.disabled = true;
            } else if (isInCart) {
                button.textContent = 'Убрать';
                button.classList.add('button_alt');
                button.disabled = false;
            } else {
                button.textContent = 'В корзину';
                button.classList.remove('button_alt');
                button.disabled = false;
            }
        }
    }

    private init(): void {
        this.updateContent();
        this.element.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.card__button') && !target.closest('.button')) {
                this.openProductModal();
            }
        });

        const button = this.element.querySelector('.card__button') || this.element.querySelector('.button');
        if (button) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (this.data.price === null) return;

                const isInCart = this.isInCartHandler ? this.isInCartHandler(this.data.id) : false;
                
                if (isInCart) {
                    if (this.removeFromCartHandler) {
                        this.removeFromCartHandler(this.data.id);
                    }
                } else {
                    if (this.addToCartHandler) {
                        this.addToCartHandler(this.data);
                    }
                }
            });
        }
    }

    private updateContent(): void {
        const image = ensureImageElement('.card__image', this.element);
        const title = ensureElement('.card__title', this.element);
        const category = ensureElement('.card__category', this.element);
        const price = ensureElement('.card__price', this.element);
        const button = this.element.querySelector('.card__button') as HTMLButtonElement;

        image.src = this.data.image;
        image.alt = this.data.title;
        title.textContent = this.data.title;
        category.textContent = this.data.category;
        category.className = `card__category ${getCategoryClass(this.data.category)}`;
        
        if (this.data.price === null) {
            price.textContent = 'Бесценно';
            if (button) {
                button.textContent = 'Не продается';
                button.classList.add('button_alt');
                button.disabled = true;
            }
        } else {
            price.textContent = `${this.data.price} синапсов`;
            if (button) {
                button.disabled = false;
                if (this.isInCartHandler) {
                    this.updateButtonState(this.isInCartHandler(this.data.id));
                }
            }
        }
    }

    private openProductModal(): void {
        const modalContent = this.getModalItemView(
            ensureElement('#card-preview') as HTMLTemplateElement
        );
        this.events.emit('modal:open', { element: modalContent });
    }
}