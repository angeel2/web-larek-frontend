import './scss/styles.scss';
import { cloneTemplate, ensureElement, ensureTemplateElement } from './utils/utils';
import { EventEmitter } from './components/base/events';
import { API_URL } from './utils/constants';
import { DataApi } from './components/DataApi';
import { CartModel } from './components/CartModel';
import { ProductModel } from './components/ProductModel';
import { OrderModel } from './components/OrderModel';
import { ProductsView } from './components/ProductsView';
import { ItemView } from './components/ItemView';
import { CartView } from './components/CartView';
import { CartItemView } from './components/CartItemView';
import { OrderFormView } from './components/FormView';
import { ContactsFormView } from './components/ContactsFormView';
import { SuccessWindowView } from './components/SuccessWindowView';
import { ModalView } from './components/ModalView';
import { ProductModalView } from './components/ProductModalView';
import { HeaderView } from './components/HeaderView';
import { Product, ValidationErrors, PaymentType, CartActionData, OrderChangeData } from './types';


const events = new EventEmitter();
const api = new DataApi(API_URL);
const productModel = new ProductModel(events);
const cartModel = new CartModel(events);
const orderModel = new OrderModel(events);
const modalView = new ModalView();


const productsView = new ProductsView(events);
const headerView = new HeaderView(events);
const cartView = new CartView(
    cloneTemplate(ensureTemplateElement('#basket')), 
    events
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

events.on('products:loading', () => {
    productsView.showLoading();
});

events.on('products:loaded', () => {
    renderProducts();
});

events.on<string>('products:error', (error) => {
    productsView.showError(error);
});

events.on<OrderChangeData>('order:change', (data) => {
    orderModel.setData(data.field, data.value);
});

events.on<ValidationErrors>('form:validate', (errors) => {
    if (modalView.isOpen()) {
        const currentContent = modalView.getContent();
        
        if (currentContent.querySelector('input[name="email"]')) {
            contactsFormView.validate(errors);
        } else if (currentContent.querySelector('input[name="address"]')) {
            orderFormView.validate(errors);
        }
    }
});

events.on('cart:changed', () => {
    headerView.updateCounter(cartModel.getItemCount());
});

events.on('cart:list-updated', () => {
    updateCart();
});

events.on<CartActionData>('cart:action', (data) => {
    if (data.action === 'add' && data.product) {
        cartModel.add(data.product);
    } else if (data.action === 'remove' && data.productId) {
        cartModel.remove(data.productId);
    }
});

events.on('cart:open', () => {
    modalView.open(cartView.render());
});

events.on('order:open', () => {
    if (cartModel.getItems().length === 0) return;
    
    orderModel.reset();
    modalView.open(orderFormView.render({
        payment: PaymentType.ONLINE,
        address: ''
    }));
});

events.on('order:next', () => {
    const errors = orderModel.validateStep1();
    if (Object.keys(errors).length === 0) {
        modalView.open(contactsFormView.render({
            email: orderModel.email || '',
            phone: orderModel.phone || ''
        }));
    } else {
        orderFormView.validate(errors);
    }
});

events.on('order:submit', () => {
    const errors = orderModel.validateStep2();
    if (Object.keys(errors).length === 0) {
        submitOrder();
    } else {
        contactsFormView.validate(errors);
    }
});

events.on<{ total: number }>('order:success', (data) => {
    modalView.open(successView.render(data.total));
});

events.on('order:back', () => {
    modalView.open(orderFormView.render({
        payment: orderModel.payment,
        address: orderModel.address,
    }));
});

events.on<{ product: Product }>('product:open', (data) => {
    modalView.open(productModalView.render({
        product: data.product,
        isInCart: cartModel.hasItem(data.product.id),
    }));
});

events.on('modal:close', () => {
    modalView.close();
});

function renderProducts(): void {
    const products = productModel.getAllProducts();
    
    const productItems = products.map((product: Product) => {
        const itemView = new ItemView(cloneTemplate(ensureTemplateElement('#card-catalog')), product);

        itemView.setModalHandler((product) => {
            events.emit('product:open', { product });
        });

        return itemView.render({
            product,
            isInCart: cartModel.hasItem(product.id),
        });
    });
    
    productsView.setProductItems(productItems);
}

function updateCart(): void {
    const products = cartModel.getProducts();
    const total = cartModel.getTotal();
    
    const listItems = products.map((product, index) => {
        const itemView = new CartItemView(
            ensureTemplateElement('#card-basket'),
            product,
            index,
            events
        );
        return itemView.getElement();
    });
    
    cartView.setListItems(listItems);
    cartView.setTotal(total);
    cartView.setCheckoutEnabled(listItems.length > 0);
    headerView.updateCounter(products.length);
}

function submitOrder(): void {
    const orderData = orderModel.getOrderData();
    const fullOrder = {
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
        .catch(() => {
            contactsFormView.validate({ 
                email: 'Ошибка при оформлении заказа. Попробуйте еще раз.' 
            });
        });
}

function loadProducts(): void {
    productModel.setLoading(true);

    api.getItems()
        .then(data => {
            productModel.setProducts(data.items);
        })
        .catch(() => {
            productModel.setError('Не удалось загрузить товары. Обновите страницу.');
        });
}

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    headerView.updateCounter(cartModel.getItemCount());
});