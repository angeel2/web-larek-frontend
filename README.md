# Проектная работа "Веб-ларек"

# Описание проекта
WebLarek - это современное одностраничное приложение интернет-магазина, построенное на TypeScript с использованием архитектурного паттерна MVC/MVVM. Проект реализует полный цикл покупки: от просмотра каталога товаров до оформления заказа с валидацией и обработкой платежей.

# Стек: HTML, SCSS, TS, Webpack

# Архитектура проекта
Используемые паттерны
MVC/MVVM - Основной архитектурный паттерн
Observer - Event-driven communication через EventEmitter
Dependency Injection - Внедрение зависимостей
Factory Method - Создание компонентов через утилиты

# Структура проекта:
components-- Компоненты приложения
base-- Базовые абстрактные классы
├── api.ts-- HTTP клиент для API запросов
└── events.ts-- Система событий (Event Emitter)
CartModel.ts-- Модель данных корзины
CartView.ts-- Представление корзины
DataApi.ts-- Сервис для работы с API магазина
FormView.ts-- Формы оформления заказа
ItemView.ts-- Карточка товара
ModalView.ts-- Управление модальными окнами
OrderModel.ts-- Модель данных заказа
SuccessWindowView.ts-- Окно успешного оформления
types-- Типы TypeScript
└── index.ts-- Основные типы данных
utils-- Вспомогательные функции
├── constants.ts-- Константы приложения
└── utils.ts-- Утилиты и хелперы
scss-- Стили проекта
└── styles.scss-- Главный файл стилей
pages-- HTML страницы
└── index.html-- Главная страница
index.ts-- Точка входа приложения

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

npm install
npm run start

## Сборка
npm run build

# Модели данных
Интерфейсы данных  /types/index.ts

// Базовый интерфейс с идентификатором
export interface Identifiable {
  id: string;
}

// Данные товара от API
export interface ApiProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: { rate: number; count: number };
}

// Товар в приложении
export interface Product extends Identifiable {
  title: string;
  description: string;
  price: number | null;
  image: string;
  category: string;
}

// Данные заказа
export interface Order {
  payment: PaymentType;
  address: string;
  email: string;
  phone: string;
  items: string[];
  total: number;
}

// Тип оплаты
export enum PaymentType {
  ONLINE = 'online',
  CASH = 'cash'
}

# Компоненты системы
1. Базовые компоненты (src/components/base/)
Api - Базовый HTTP клиент

export class Api {
  // Базовые методы для API запросов
  get<T>(uri: string): Promise<T>
  post<T>(uri: string, data: object, method?: ApiPostMethods): Promise<T>
}

EventEmitter - Система событий
export class EventEmitter implements IEvents {
  // Методы для управления событиями
  on<T extends object>(event: EventName, callback: (data: T) => void): void
  emit<T extends object>(event: string, data?: T): void
  off(event: EventName, callback: Subscriber): void
}

2. Модели данных
CartModel - Управление корзиной покупок

export class CartModel implements ICartModel {
  // Основные методы
  add(item: Product): void
  remove(itemId: string): void
  getItems(): string[]
  getTotal(): number
  hasItem(itemId: string): boolean
}

OrderModel - Данные заказа и валидация

export class OrderModel implements IOrderModel {
  // Данные заказа
  payment: PaymentType
  address: string
  email: string
  phone: string
  
  // Методы валидации
  validateStep1(): ValidationErrors
  validateStep2(): ValidationErrors
}

3. Представления (Views)
ItemView - Отображение товара

export class ItemView implements IItemView {
  // Отображение товара в каталоге и модальном окне
  getCartItemView(template: HTMLTemplateElement): HTMLElement
  getModalItemView(template: HTMLTemplateElement): HTMLElement
  updateButtonState(isInCart: boolean): void
}

CartView - Отображение корзины

export class CartView implements ICartView {
  // Управление отображением корзины
  addItem(item: HTMLElement, itemId: string): void
  removeItem(itemId: string): void
  updateTotal(total?: number): void
}

ModalView - Управление модальными окнами 

export class ModalView implements IModalView {
  // Контроль модальных окон
  openModal(element: HTMLElement): void
  closeModal(): void
  setCloseHandler(handler: () => void): void
}

4. Сервисы
DataApi - Работа с API магазина

export class DataApi extends Api implements IDataApi {
  // Специфичные методы API
  async getItems(): Promise<{ items: ApiProduct[] }>
  async sendOrder(data: Order): Promise<{ id: string }>
}

# Взаимодействие компонентов
Схема работы приложения

1. Инициализация приложения

const events = new EventEmitter();
const cartModel = new CartModel(events);
const api = new DataApi(API_URL);

2. Загрузка товаров

api.getItems() → преобразование ApiProduct → Product → создание ItemView

3. Работа с корзиной

// Добавление товара
ItemView → cartModel.add() → событие 'cart:changed' → обновление счетчика

// Удаление товара
CartView → cartModel.remove() → событие 'cart:changed' → обновление интерфейса

4. Оформление заказа

// Шаг 1: Данные доставки
OrderFormView → orderModel → валидация → переход к шагу 2

// Шаг 2: Контактные данные  
ContactsFormView → валидация → api.sendOrder() → очистка корзины


# Event-Driven Architecture

Компоненты общаются через события:

// Генерация события
this.events.emit('cart:changed');

// Подписка на событие
events.on('cart:changed', () => {
    updateCartCounter();
    updateCartButtons();
});

# Функциональность
Реализованные функции:
1. Просмотр каталога товаров
2. Детальный просмотр товаров
3. Добавление/удаление из корзины
4. Оформление заказа в 2 этапа
5. Валидация форм
6. Сохранение состояния в localStorage
7. Адаптивный дизайн

# Особенности реализации:
1. Real-time updates через EventEmitter
2. Автоматическое закрытие модальных окон
3. Валидация на клиенте и сервере
4. Интуитивный UX с мгновенной обратной связью
