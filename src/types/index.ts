export type EventName = string | RegExp;
export type Subscriber = Function;
export type EmitterEvent = {
    eventName: string,
    data: unknown
};

export interface IEvents {
  on<T extends object>(event: EventName, callback: (data: T) => void): void;
  emit<T extends object>(event: string, data?: T): void;
  trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}

export type ApiListResponse<Type> = {
  total: number,
  items: Type[]
};

export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';


export interface IFormState {
    valid: boolean;
    errors: string[];
}


export interface IModalData {
    content: HTMLElement;
}


export interface ILarekAPI {
  getProductList: () => Promise<IProduct[]>;
  getProductItem: (id: string) => Promise<IProduct>;
  orderProducts: (order: IOrder) => Promise<IOrderResult>
}


export interface IProduct {
  id: string;
  title: string;
  price: number | null;
  description: string;
  category: string;
  image: string;
}


export interface IAppState {
  catalog: IProduct[];
  basket: IProduct[];
  preview: string | null;
  delivery: IDeliveryForm | null;
  contact: IContactForm | null;
  order: IOrder | null;
}


export interface IDeliveryForm {
  payment: string;
  address: string;
}


export interface IContactForm {
  email: string;
  phone: string;
}


export interface IOrder extends IDeliveryForm, IContactForm {
  total: number;
  items: string[];
}


export interface IOrderResult {
  id: string;
  total: number;
}


export type FormErrors = Partial<Record<keyof IOrder, string>>;


export interface ICard extends IProduct{
  index?: string;
  buttonTitle? : string;
}


export interface IBasketView {
  items: HTMLElement[];
  total: number;
}


export interface IPage{
  counter: number;
  catalog: HTMLElement[];
}


export interface ISuccess {
  total: number;
}


export interface IActions {
  onClick: (event: MouseEvent) => void;
}


export interface ISuccessActions {
  onClick: () => void;
}