import { ISuccessWindowView } from '../types';
import { EventEmitter } from './base/events';
import { ensureElement, ensureButtonElement } from '../utils/utils';

export class SuccessWindowView implements ISuccessWindowView {
    private element: HTMLElement;
    private events: EventEmitter;
    private closeButton: HTMLButtonElement;
    private descriptionElement: HTMLElement;
    private continueShoppingHandler: (() => void) | null = null;

    constructor(template: HTMLElement, events: EventEmitter) {
        this.element = template;
        this.events = events;
        this.closeButton = ensureButtonElement('.order-success__close', this.element);
        this.descriptionElement = ensureElement('.order-success__description', this.element);
        this.init();
    }

    render(total: number): HTMLElement {
        this.descriptionElement.textContent = `Списано ${total} синапсов`;
        return this.element;
    }

    setContinueShoppingHandler(handler: () => void): void {
        this.continueShoppingHandler = handler;
    }

    private init(): void {
        this.closeButton.addEventListener('click', () => {
            if (this.continueShoppingHandler) {
                this.continueShoppingHandler();
            }
        });
    }
}