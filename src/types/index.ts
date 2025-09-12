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
	CASH = 'cash',
}

export interface Order {
	payment: PaymentType;
	address: string;
	email: string;
	phone: string;
	items: string[];
	total: number;
}

export interface IProductModel {
	setLoading(state: boolean): void;
	isLoading(): boolean;
	setProducts(apiProducts: ApiProduct[]): void;
	getAllProducts(): Product[];
	getProductById(id: string): Product | undefined;
	setError(message: string): void;
	getError(): string | null;
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
	setListItems(items: HTMLElement[]): void;
	setTotal(total: number): void;
	setCheckoutEnabled(isEnabled: boolean): void;
	update(items: HTMLElement[], total: number): void;
	isCartOpen(): boolean;
}

export interface IOrderFormView extends IView {
	showErrors(errors: ValidationErrors): void;
	validate(errors: ValidationErrors): void;
	isOrderForm(): boolean;
}

export interface IContactsFormView extends IView {
	showErrors(errors: ValidationErrors): void;
	validate(errors: ValidationErrors): void;
	isContactsForm(): boolean;
}

export interface ISuccessView extends IView {
	setContinueHandler(handler: () => void): void;
}

export interface IProductModalView extends IView {
	updateCartState(isInCart: boolean): void;
}

export interface IModalView {
	open(content: HTMLElement): void;
	close(): void;
	isOpen(): boolean;
	getContent(): HTMLElement;
}

export interface IProductsView {
	setProductItems(items: HTMLElement[]): void;
	showLoading(): void;
	showError(message: string): void;
	clearGallery(): void;
}

export interface IApi {
	getItems(): Promise<{ items: ApiProduct[] }>;
	sendOrder(data: Order): Promise<{ id: string }>;
}

export interface ValidationErrors {
	payment?: string;
	address?: string;
	email?: string;
	phone?: string;
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
