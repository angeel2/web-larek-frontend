import './scss/styles.scss';
import { cloneTemplate, ensureElement } from './utils/utils';
import { EventEmitter } from './components/base/events';
import { API_URL, CDN_URL } from './utils/constants';
import { DataApi } from './components/DataApi';
import { CartModel } from './components/CartModel';
import { OrderModel } from './components/OrderModel';
import { ItemView } from './components/ItemView';
import { CartView } from './components/CartView';
import { OrderFormView, ContactsFormView } from './components/FormView';
import { SuccessWindowView } from './components/SuccessWindowView';
import { ModalView } from './components/ModalView';
import { ProductModalView } from './components/ProductModalView';
import { ApiProduct, Product, Order, PaymentType } from './types';


const events = new EventEmitter();
const api = new DataApi(API_URL);
const cartModel = new CartModel(events);
const orderModel = new OrderModel();
const modalView = new ModalView();


const cartView = new CartView(cloneTemplate(ensureElement<HTMLTemplateElement>('#basket')));
const orderFormView = new OrderFormView(cloneTemplate(ensureElement<HTMLTemplateElement>('#order')));
const contactsFormView = new ContactsFormView(cloneTemplate(ensureElement<HTMLTemplateElement>('#contacts')));
const successView = new SuccessWindowView(cloneTemplate(ensureElement<HTMLTemplateElement>('#success')));
const productModalView = new ProductModalView(cloneTemplate(ensureElement<HTMLTemplateElement>('#card-preview')));


cartView.setCheckoutHandler(() => {
  if (cartModel.getItemCount() > 0) {
    events.emit('order:open');
  }
});

cartView.setActionHandler((productId, action) => {
  events.emit('cart:action', { productId, action });
});

orderFormView.setSubmitHandler((data) => {
  if (data.payment) orderModel.payment = data.payment;
  if (data.address) orderModel.address = data.address;
});

orderFormView.setNextHandler(() => events.emit('order:next'));

contactsFormView.setSubmitHandler((data) => {
  if (data.email) orderModel.email = data.email;
  if (data.phone) orderModel.phone = data.phone;
  events.emit('order:submit', { order: data });
});

contactsFormView.setBackHandler(() => events.emit('order:back'));

successView.setContinueHandler(() => {
  modalView.close();
  cartModel.clear();
  orderModel.reset();
  updateCartCounter();
});

productModalView.setActionHandler((product, action) => {
  events.emit('cart:action', { product, action });
});

productModalView.setCloseHandler(() => {
  modalView.close();
});


events.on('cart:changed', () => {
  updateCartCounter();
  
  if (modalView.isOpen()) {
    const currentProductId = productModalView.getCurrentProductId();
    if (currentProductId) {
      const isInCart = cartModel.hasItem(currentProductId);
      productModalView.updateCartState(isInCart);
    }
  }
});

events.on('cart:action', (data: { product?: Product; productId?: string; action: 'add' | 'remove' }) => {
  if (data.action === 'add' && data.product) {
    cartModel.add(data.product);
  } else if (data.action === 'remove' && data.productId) {
    cartModel.remove(data.productId);
  } else if (data.action === 'remove' && data.product) {
    cartModel.remove(data.product.id);
  }
});

events.on('cart:open', () => {
  const items = cartModel.getProducts().map((product, index) => {
    const element = cloneTemplate(ensureElement<HTMLTemplateElement>('#card-basket'));
    
    const indexEl = ensureElement('.basket__item-index', element);
    const titleEl = ensureElement('.card__title', element);
    const priceEl = ensureElement('.card__price', element);
    const deleteBtn = ensureElement('.basket__item-delete', element);
    
    indexEl.textContent = (index + 1).toString();
    titleEl.textContent = product.title;
    priceEl.textContent = product.price !== null ? `${product.price} синапсов` : 'Бесценно';
    element.setAttribute('data-id', product.id);

    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      events.emit('cart:action', { productId: product.id, action: 'remove' });
    });
    
    return element;
  });

  modalView.open(cartView.render({ items, total: cartModel.getTotal() }));
});

events.on('order:open', () => {
  orderModel.items = cartModel.getItems();
  orderModel.total = cartModel.getTotal();
  
  modalView.open(orderFormView.render({
    payment: orderModel.payment,
    address: orderModel.address
  }));
});

events.on('order:next', () => {
  const errors = orderModel.validateStep1();
  if (Object.keys(errors).length === 0) {
    modalView.open(contactsFormView.render({
      email: orderModel.email,
      phone: orderModel.phone
    }));
  } else {
    orderFormView.showErrors(errors);
  }
});

events.on('order:submit', (data: { order: Partial<Order> }) => {
  submitOrder(data.order);
});

events.on('order:success', () => {
  modalView.open(successView.render(orderModel.total));
});

events.on('order:back', () => {
  modalView.open(orderFormView.render({
    payment: orderModel.payment,
    address: orderModel.address
  }));
});

events.on('product:open', (data: { product: Product }) => {
  modalView.open(productModalView.render({ 
    product: data.product, 
    isInCart: cartModel.hasItem(data.product.id) 
  }));
});


function submitOrder(data: Partial<Order>): void {
  if (data.payment) orderModel.payment = data.payment;
  if (data.address) orderModel.address = data.address;
  if (data.email) orderModel.email = data.email;
  if (data.phone) orderModel.phone = data.phone;

  orderModel.items = cartModel.getItems();
  orderModel.total = cartModel.getTotal();

  const errors = orderModel.validateStep2();
  if (Object.keys(errors).length > 0) {
    contactsFormView.showErrors(errors);
    return;
  }

  api.sendOrder(orderModel as Order)
    .then(() => events.emit('order:success'))
    .catch(error => {
      console.error('Order submission error:', error);
      contactsFormView.showErrors({ 
        email: 'Ошибка при оформлении заказа. Попробуйте еще раз.' 
      });
    });
}

function updateCartCounter(): void {
  const counter = ensureElement('.header__basket-counter');
  const count = cartModel.getItemCount();
  counter.textContent = count.toString();
  counter.style.display = 'block';
}


function loadProducts(): void {
  api.getItems()
    .then(data => {
      const gallery = ensureElement('.gallery');
      const itemTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
      
      gallery.innerHTML = '';
      
      data.items.forEach((apiProduct: ApiProduct) => {
        const product: Product = {
          id: apiProduct.id,
          title: apiProduct.title,
          description: apiProduct.description,
          price: apiProduct.price,
          image: CDN_URL + apiProduct.image,
          category: apiProduct.category,
        };

        const itemView = new ItemView(cloneTemplate(itemTemplate), product);
        
        itemView.setModalHandler((product) => {
          events.emit('product:open', { product });
        });

        const itemElement = itemView.render({ 
          product, 
          isInCart: cartModel.hasItem(product.id) 
        });
        itemElement.setAttribute('data-id', product.id);
        
        gallery.appendChild(itemElement);
      });
    })
    .catch(error => {
      console.error('Failed to load products:', error);
      const gallery = ensureElement('.gallery');
      gallery.innerHTML = '<p class="error">Не удалось загрузить товары. Обновите страницу.</p>';
    });
}


ensureElement('.header__basket').addEventListener('click', (e) => {
  e.preventDefault();
  events.emit('cart:open');
});


document.addEventListener('DOMContentLoaded', () => {
  cartModel.clear();
  loadProducts();
  updateCartCounter();
});