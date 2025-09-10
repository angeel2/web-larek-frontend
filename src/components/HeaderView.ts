import { ensureElement } from '../utils/utils';
import { EventEmitter } from './base/events';

export class HeaderView {
  private basketButton: HTMLElement;
  private basketCounter: HTMLElement;

  constructor(private events: EventEmitter) {
    this.basketButton = ensureElement('.header__basket');
    this.basketCounter = ensureElement('.header__basket-counter');
    
    this.init();
  }

  private init(): void {
    this.basketButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.events.emit('cart:open');
    });
  }

  updateCounter(count: number): void {
    this.basketCounter.textContent = count.toString();
    this.basketCounter.style.display = count > 0 ? 'block' : 'none';
  }
}