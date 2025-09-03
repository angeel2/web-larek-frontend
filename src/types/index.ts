// ==================== 1. БАЗОВЫЕ ТИПЫ ====================

export interface Identifiable {
  id: string;
}

// ==================== 2. ТИПЫ ДАННЫХ ====================

export interface ApiProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: {
    rate: number;
    count: number;
  };
}

export interface Product extends Identifiable {
  title: string;
  description: string;
  price: number | null;
  image: string;
  category: string;
}

export enum PaymentType {
  ONLINE = 'online',
  CASH = 'cash'
}

export interface Order {
  payment: PaymentType;
  address: string;
  email: string;
  phone: string;
  items: string[];
  total: number;
}

// ==================== 3. ИНТЕРФЕЙСЫ МОДЕЛЕЙ (MODEL) ====================

export interface ICartModel {
  add(item: Product): void;
  remove(itemId: string): void;
  clear(): void;
  getItems(): string[];
  getTotal(): number;
  hasItem(itemId: string): boolean;
  getItemCount(): number;
  getProducts(): Product[];
  getProduct(itemId: string): Product | undefined;
}

export interface IOrderModel {
  payment: PaymentType;
  address: string;
  email: string;
  phone: string;
  items: string[];
  total: number;
  customerFullInfo: Order;
  validateStep1(): ValidationErrors;
  validateStep2(): ValidationErrors;
  reset(): void;
}

// ==================== 4. ИНТЕРФЕЙСЫ ПРЕДСТАВЛЕНИЙ (VIEW) ====================

export interface IView {
  render(data?: unknown): HTMLElement;
}

export interface IItemView extends IView {
  data: Product;
  getCartItemView(template: HTMLTemplateElement): HTMLElement;
  getModalItemView(template: HTMLTemplateElement): HTMLElement;
  setAddToCartHandler(handler: (product: Product) => void): void;
  setRemoveFromCartHandler(handler: (productId: string) => void): void;
  setIsInCartHandler(handler: (productId: string) => boolean): void;
  updateButtonState(isInCart: boolean): void;
}

export interface ICartView extends IView {
  addItem(item: HTMLElement, itemId: string, total: number): void;
  removeItem(itemId: string): void;
  clear(): void;
  setCheckoutHandler(handler: () => void): void;
  setRemoveItemHandler(handler: (productId: string) => void): void;
  updateTotal(total: number): void;
}

export interface IFormView extends IView {
  setSubmitHandler(handler: (data: Partial<Order>) => void): void;
  showValidationErrors(errors: ValidationErrors): void;
  clearValidationErrors(): void;
}

export interface IOrderFormView extends IFormView {
  setNextStepHandler(handler: () => void): void;
}

export interface IContactsFormView extends IFormView {
  setBackHandler(handler: () => void): void;
}

export interface ISuccessWindowView extends IView {
  render(total: number): HTMLElement;
  setContinueShoppingHandler(handler: () => void): void;
}

export interface IModalView {
  openModal(element: HTMLElement): void;
  closeModal(): void;
  setCloseHandler(handler: () => void): void;
}

// ==================== 5. ИНТЕРФЕЙС EVENT EMITTER ====================

export interface IEventEmitter {
  emit<T extends object>(event: string, data?: T): void;
  on<T extends object>(event: string, callback: (data: T) => void): void;
  off(event: string, callback: Function): void;
}

// ==================== 6. ИНТЕРФЕЙС API ====================

export interface IDataApi {
  getItems(): Promise<{ items: ApiProduct[] }>;
  getItem(id: string): Promise<ApiProduct>;
  sendOrder(data: Order): Promise<{ id: string }>;
}

// ==================== 7. ДАННЫЕ СОБЫТИЙ ====================

export interface IEventData {
  element?: HTMLElement;
  data?: Product | string;
}

// ==================== 8. ПЕРЕЧИСЛЕНИЕ СОБЫТИЙ ====================

export enum Events {
  MODAL_OPEN = 'modal:open',
  MODAL_CLOSE = 'modal:close',
  CART_CHANGED = 'cart:changed',
}

// ==================== 9. ОШИБКИ ВАЛИДАЦИИ ====================

export interface ValidationErrors {
  payment?: string;
  address?: string;
  email?: string;
  phone?: string;
}