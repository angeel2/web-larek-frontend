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
  getAllProducts(): Product[]; 
}

export interface IOrderModel {
  payment: PaymentType;
  address: string;
  email: string;
  phone: string;
  validateStep1(): ValidationErrors;
  validateStep2(): ValidationErrors;
  reset(): void;
  getOrderData(): Omit<Order, 'items' | 'total'>;
  setData(field: keyof Order, value: any): void;
}

export interface IView {
  render(data?: unknown): HTMLElement;
}

export interface IItemView extends IView {
  setModalHandler(handler: (product: Product) => void): void;
}

export interface ICartView extends IView {
  updateCounter(count: number): void;
  showErrors(errors: any): void; 
}

export interface IOrderFormView extends IView {
  setSubmitHandler(handler: (data: Partial<Order>) => void): void;
  setNextHandler(handler: () => void): void;
  showErrors(errors: ValidationErrors): void;
  validate(errors: ValidationErrors): void; 
}

export interface IContactsFormView extends IView {
  setSubmitHandler(handler: (data: Partial<Order>) => void): void;
  setBackHandler(handler: () => void): void;
  showErrors(errors: ValidationErrors): void;
  validate(errors: ValidationErrors): void; 
}

export interface ISuccessView extends IView {
  setContinueHandler(handler: () => void): void;
}

export interface IProductModalView extends IView {
  updateCartState(isInCart: boolean): void;
  getCurrentProductId(): string | null;
  getCurrentProduct(): Product | null;
}

export interface CartData {
  items: Product[];
  total: number;
}

export interface IModalView {
  open(content: HTMLElement): void;
  close(): void;
  isOpen(): boolean;
  getContent(): HTMLElement; 
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
  isInCart?: boolean; 
}

export interface CartActionData {
  product?: Product;
  productId?: string;
  action: 'add' | 'remove';
}

export interface OrderChangeData {
  field: keyof Order;
  value: any;
}