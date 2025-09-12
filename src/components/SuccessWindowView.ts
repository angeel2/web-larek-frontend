import { ISuccessView } from '../types';
import { ensureElement, ensureButtonElement } from '../utils/utils';
import { EventEmitter } from './base/events';

export class SuccessWindowView implements ISuccessView {
  private element: HTMLElement;
  private descriptionElement: HTMLElement;
  private closeButton: HTMLButtonElement;

  constructor(template: HTMLElement, private events: EventEmitter) {
    this.element = template;
    this.descriptionElement = ensureElement('.order-success__description', this.element);
    this.closeButton = ensureButtonElement('.order-success__close', this.element);

    this.closeButton.addEventListener('click', () => {
      this.events.emit('modal:close');
    });

    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) {
        this.events.emit('modal:close');
      }
    });
  }

  render(data?: unknown): HTMLElement {
    const total = data as number;
    if (total !== undefined) {
      this.descriptionElement.textContent = `Списано ${total} синапсов`;
    }
    return this.element;
  }

  setContinueHandler(handler: () => void): void {
    this.closeButton.addEventListener('click', handler);
    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) {
        handler();
      }
    });
  }
}