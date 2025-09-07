export interface Identifiable {
  id: string;
}

export interface ApiProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
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

export interface ICartModel {
  add(item: Product): void;
  remove(itemId: string): void;
  clear(): void;
  getItems(): string[];
  getTotal(): number;
  hasItem(itemId: string): boolean;
  getItemCount(): number;
  getProducts(): Product[];
}

export interface IOrderModel {
  payment: PaymentType;
  address: string;
  email: string;
  phone: string;
  items: string[];
  total: number;
  validateStep1(): ValidationErrors;
  validateStep2(): ValidationErrors;
  reset(): void;
}

export interface IView {
  render(data?: unknown): HTMLElement;
}

export interface IItemView extends IView {
  setModalHandler(handler: (product: Product) => void): void;
}

export interface ICartView extends IView {
  setCheckoutHandler(handler: () => void): void;
  setActionHandler(handler: (productId: string, action: 'remove') => void): void;
}

export interface IOrderFormView extends IView {
  setSubmitHandler(handler: (data: Partial<Order>) => void): void;
  setNextHandler(handler: () => void): void;
  showErrors(errors: ValidationErrors): void;
}

export interface IContactsFormView extends IView {
  setSubmitHandler(handler: (data: Partial<Order>) => void): void;
  setBackHandler(handler: () => void): void;
  showErrors(errors: ValidationErrors): void;
}

export interface ISuccessView extends IView {
  setContinueHandler(handler: () => void): void;
}

export interface IProductModalView extends IView {
  setActionHandler(handler: (product: Product, action: 'add' | 'remove') => void): void;
  setCloseHandler(handler: () => void): void;
  updateCartState(isInCart: boolean): void;
  getCurrentProductId(): string | null;
  getCurrentProduct(): Product | null;
}

export interface IModalView {
  open(content: HTMLElement): void;
  close(): void;
  isOpen(): boolean;
}

export interface IApi {
  getItems(): Promise<{ items: ApiProduct[] }>;
  getItem(id: string): Promise<ApiProduct>;
  sendOrder(data: Order): Promise<{ id: string }>;
}

export interface ValidationErrors {
  payment?: string;
  address?: string;
  email?: string;
  phone?: string;
}

export interface ModalData {
  content: HTMLElement;
}

export interface ProductData {
  product: Product;
}