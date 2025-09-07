import { IModalView } from '../types';
import { ensureElement, ensureButtonElement } from '../utils/utils';

export class ModalView implements IModalView {
    private modal: HTMLElement;
    private content: HTMLElement;
    private closeButton: HTMLButtonElement;
    private pageWrapper: HTMLElement;

    constructor() {
        this.modal = ensureElement('#modal-container');
        this.content = ensureElement('.modal__content', this.modal);
        this.closeButton = ensureButtonElement('.modal__close', this.modal);
        this.pageWrapper = ensureElement('.page__wrapper');
        
        this.init();
    }

    open(content: HTMLElement): void {
        document.addEventListener('keydown', this.handleEscape);
        this.modal.classList.add('modal_active');
        this.pageWrapper.classList.add('page__wrapper_locked');
        
        this.content.innerHTML = '';
        this.content.appendChild(content);
    }

    close(): void {
        this.modal.classList.remove('modal_active');
        this.pageWrapper.classList.remove('page__wrapper_locked');
        this.content.innerHTML = '';
        document.removeEventListener('keydown', this.handleEscape);
    }

    isOpen(): boolean {
        return this.modal.classList.contains('modal_active');
    }

    private handleEscape = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
            this.close();
        }
    }

    private init(): void {
        this.modal.addEventListener('mousedown', (event) => {
            if (event.target === this.modal) {
                this.close();
            }
        });

        this.closeButton.addEventListener('click', () => {
            this.close();
        });

        this.content.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}