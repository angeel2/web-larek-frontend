import { ISuccessView } from '../types';
import { ensureElement, ensureButtonElement } from '../utils/utils';

export class SuccessWindowView implements ISuccessView {
  private element: HTMLElement;
  private descriptionElement: HTMLElement;
  private closeButton: HTMLButtonElement;
  private continueHandler?: () => void;

  constructor(template: HTMLElement) {
    this.element = template;
    this.descriptionElement = ensureElement('.order-success__description', this.element);
    this.closeButton = ensureButtonElement('.order-success__close', this.element);

    this.closeButton.addEventListener('click', () => {
      this.continueHandler?.();
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
    this.continueHandler = handler;
  }
} 