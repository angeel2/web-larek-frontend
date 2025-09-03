import { IModalView } from '../types';
import { ensureElement, ensureButtonElement } from '../utils/utils';

export class ModalView implements IModalView {
    private modal: HTMLElement;
    private content: HTMLElement;
    private closeButton: HTMLButtonElement;
    private pageWrapper: HTMLElement;
    private escHandler: (event: KeyboardEvent) => void;

    constructor() {
        this.modal = ensureElement('#modal-container');
        this.content = ensureElement('.modal__content', this.modal);
        this.closeButton = ensureButtonElement('.modal__close', this.modal);
        this.pageWrapper = ensureElement('.page__wrapper');
        
        this.escHandler = this.handleEscape.bind(this);
        this.init();
    }

    openModal(element: HTMLElement): void {
        document.addEventListener('keyup', this.escHandler);
        this.modal.classList.add('modal_active');
        this.pageWrapper.classList.add('page__wrapper_locked');
        
        this.content.innerHTML = '';
        this.content.appendChild(element);
    }

    closeModal(): void {
        this.modal.classList.remove('modal_active');
        this.pageWrapper.classList.remove('page__wrapper_locked');
        this.content.innerHTML = '';
        document.removeEventListener('keyup', this.escHandler);
    }

    setCloseHandler(handler: () => void): void {
        this.closeButton.addEventListener('click', handler);
    }

    private handleEscape(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.closeModal();
        }
    }

    private init(): void {
        this.modal.addEventListener('mousedown', (event) => {
            if (event.target === event.currentTarget) {
                this.closeModal();
            }
        });

        this.closeButton.addEventListener('click', () => {
            this.closeModal();
        });

        this.content.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}