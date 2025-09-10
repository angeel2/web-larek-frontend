import './scss/styles.scss';
import {
  cloneTemplate,
  ensureElement,
  ensureTemplateElement,
} from './utils/utils';
import { EventEmitter } from './components/base/events';
import { API_URL } from './utils/constants';
import { DataApi } from './components/DataApi';
import { CartModel } from './components/CartModel';
import { OrderModel } from './components/OrderModel';
import { ItemView } from './components/ItemView';
import { CartView } from './components/CartView';
import { OrderFormView, ContactsFormView } from './components/FormView';
import { SuccessWindowView } from './components/SuccessWindowView';
import { ModalView } from './components/ModalView';
import { ProductModalView } from './components/ProductModalView';
import { HeaderView } from './components/HeaderView';
import {
  ApiProduct,
  Product,
  Order,
  ValidationErrors,
  PaymentType,
} from './types';

// Инициализация
const events = new EventEmitter();
const api = new DataApi(API_URL);
const cartModel = new CartModel(events);
const orderModel = new OrderModel(events);
const modalView = new ModalView();

// Создание представлений
const headerView = new HeaderView(events);
const cartView = new CartView(
  cloneTemplate(ensureTemplateElement('#basket')), 
  events,
  () => cartModel.getProducts(),
  () => cartModel.getTotal()
);
const orderFormView = new OrderFormView(
  cloneTemplate(ensureTemplateElement('#order')),
  events
);
const contactsFormView = new ContactsFormView(
  cloneTemplate(ensureTemplateElement('#contacts')),
  events
);
const successView = new SuccessWindowView(
  cloneTemplate(ensureTemplateElement('#success')),
  events
);
const productModalView = new ProductModalView(
  cloneTemplate(ensureTemplateElement('#card-preview')),
  events
);

// Обработчики событий
events.on('products:loading', () => {
  ItemView.showLoading();
});

events.on('products:loaded', () => {
  renderProducts();
});

events.on<string>('products:error', (error) => {
  ItemView.showError(error);
});

events.on<{ field: keyof Order; value: any }>('order:change', (data) => {
  orderModel.setData(data.field, data.value);
});

events.on<ValidationErrors>('form:validate', (errors) => {
  if (modalView.isOpen()) {
    const content = modalView.getContent();

    if (content.querySelector('input[name="address"]')) {
      orderFormView.showErrors(errors);
    } else if (content.querySelector('input[name="email"]')) {
      contactsFormView.showErrors(errors);
    }
  }
});

events.on('cart:changed', () => {
  headerView.updateCounter(cartModel.getItemCount());
});

events.on('cart:list-updated', () => {
  if (modalView.isOpen()) {
    const content = modalView.getContent();
    if (content.querySelector('.basket')) {
      cartView.update();
    }
  }
  headerView.updateCounter(cartModel.getItemCount());
});

events.on<{ product?: Product; productId?: string; action: 'add' | 'remove' }>(
  'cart:action',
  (data) => {
    if (data.action === 'add' && data.product) {
      cartModel.add(data.product);
    } else if (data.action === 'remove' && data.productId) {
      cartModel.remove(data.productId);
    } else if (data.action === 'remove' && data.product) {
      cartModel.remove(data.product.id);
    }
  }
);

events.on('cart:open', () => {
  modalView.open(cartView.render());
});

events.on('order:open', () => {
  if (cartModel.getItems().length === 0) {
    return;
  }
  
  orderModel.reset();
  modalView.open(orderFormView.render({
    payment: PaymentType.ONLINE,
    address: ''
  }));
});

events.on('order:next', () => {
  const errors = orderModel.validateStep1();
  if (Object.keys(errors).length === 0) {
    modalView.open(
      contactsFormView.render({
        email: orderModel.email || '',
        phone: orderModel.phone || ''
      })
    );
  } else {
    orderFormView.showErrors(errors);
  }
});

events.on('order:submit', () => {
  submitOrder();
});

events.on<{ total: number }>('order:success', (data) => {
  modalView.open(successView.render(data.total));
});

events.on('order:back', () => {
  modalView.open(
    orderFormView.render({
      payment: orderModel.payment,
      address: orderModel.address,
    })
  );
});

events.on<{ product: Product }>('product:open', (data) => {
  modalView.open(
    productModalView.render({
      product: data.product,
      isInCart: cartModel.hasItem(data.product.id),
    })
  );
});

events.on('modal:close', () => {
  modalView.close();
});

// Функции для работы с DOM
function renderProducts(): void {
  ItemView.clearGallery();

  const itemTemplate = ensureTemplateElement('#card-catalog');
  const products = cartModel.getAllProducts();

  products.forEach((product: Product) => {
    const itemView = new ItemView(cloneTemplate(itemTemplate), product);

    itemView.setModalHandler((product) => {
      events.emit('product:open', { product });
    });

    const itemElement = itemView.render({
      product,
      isInCart: cartModel.hasItem(product.id),
    });
    itemElement.setAttribute('data-id', product.id);

    ItemView.getGalleryElement().appendChild(itemElement);
  });
}

function submitOrder(): void {
  const errors = orderModel.validateStep2();
  if (Object.keys(errors).length > 0) {
    contactsFormView.showErrors(errors);
    return;
  }

  const orderData = orderModel.getOrderData();
  const fullOrder: Order = {
    ...orderData,
    items: cartModel.getItems(),
    total: cartModel.getTotal(),
  };

  api.sendOrder(fullOrder)
    .then(() => {
      cartModel.clear();
      orderModel.reset();
      events.emit('order:success', { total: fullOrder.total });
    })
    .catch((error) => {
      contactsFormView.showErrors({
        email: 'Ошибка при оформлении заказа. Попробуйте еще раз.',
      });
    });
}

function loadProducts(): void {
  cartModel.setLoading(true);

  api.getItems()
    .then((data) => {
      cartModel.setAllProducts(data.items);
    })
    .catch((error) => {
      cartModel.setError('Не удалось загрузить товары. Обновите страницу.');
    });
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  headerView.updateCounter(cartModel.getItemCount());
});