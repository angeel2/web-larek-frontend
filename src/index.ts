import './scss/styles.scss';

import { cloneTemplate, ensureElement } from './utils/utils';
import { EventEmitter } from './components/base/events';
import { API_URL, CDN_URL, ERROR_MESSAGES } from './utils/constants';
import { DataApi } from './components/DataApi';
import { CartModel } from './components/CartModel';
import { OrderModel } from './components/OrderModel';
import { ItemView } from './components/ItemView';
import { ModalView } from './components/ModalView';
import { CartView } from './components/CartView';
import { OrderFormView, ContactsFormView } from './components/FormView';
import { SuccessWindowView } from './components/SuccessWindowView';
import { ApiProduct, Product, Order } from './types';

function validateTemplates(): void {
	const templates = [
		'#card-catalog',
		'#basket',
		'#contacts',
		'#order',
		'#success',
		'#card-basket',
		'#card-preview',
	];

	templates.forEach((selector) => {
		const template = document.querySelector(selector);
		if (!template) {
			throw new Error(`Template ${selector} not found in DOM`);
		}
		if (!(template instanceof HTMLTemplateElement)) {
			throw new Error(`Element ${selector} is not a HTMLTemplateElement`);
		}
		if (!template.content || template.content.children.length === 0) {
			throw new Error(`Template ${selector} content is empty`);
		}
	});
}

try {
	validateTemplates();
	console.log('All templates validated successfully');
} catch (error) {
	console.error('Template validation failed:', error);
	document.body.innerHTML =
		'<p class="error">Ошибка загрузки приложения. Пожалуйста, обновите страницу.</p>';
	throw error;
}

// ТЕМПЛЕЙТЫ
const templateGalleryCard = ensureElement<HTMLTemplateElement>('#card-catalog');
const cartTemplate = ensureElement<HTMLTemplateElement>('#basket');
const contactsFormTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const orderFormTemplate = ensureElement<HTMLTemplateElement>('#order');
const windowSuccessTemplate = ensureElement<HTMLTemplateElement>('#success');
const templateCartCard = ensureElement<HTMLTemplateElement>('#card-basket');
const templateModalCard = ensureElement<HTMLTemplateElement>('#card-preview');

// ЭКЗЕМПЛЯРЫ КЛАССОВ
const events = new EventEmitter();
const cartModel = new CartModel(events);
const orderModel = new OrderModel();
const modalView = new ModalView();

// ИНИЦИАЛИЗАЦИЯ КАТАЛОГА
const gallery = ensureElement<HTMLElement>('.gallery');
const api = new DataApi(API_URL);
let itemViews: ItemView[] = [];

function createCartItem(product: Product, index: number): HTMLElement {
	const element = cloneTemplate(templateCartCard);

	const indexElement = element.querySelector('.basket__item-index');
	const titleElement = element.querySelector('.card__title');
	const priceElement = element.querySelector('.card__price');
	const deleteBtn = element.querySelector('.basket__item-delete');

	if (indexElement) indexElement.textContent = index.toString();
	if (titleElement) titleElement.textContent = product.title;
	if (priceElement) {
		priceElement.textContent =
			product.price !== null ? `${product.price} синапсов` : 'Бесценно';
	}

	if (deleteBtn) {
		deleteBtn.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			cartModel.remove(product.id);
		});
	}

	return element;
}

function updateCartCounter(): void {
	const counter = ensureElement('.header__basket-counter');
	const count = cartModel.getItemCount();

	console.log('Updating cart counter:', count, 'items:', cartModel.getItems());

	counter.textContent = count.toString();

	counter.style.display = 'block';
}

function updateCartButtons(): void {
	itemViews.forEach((view) => {
		view.updateButtonState(cartModel.hasItem(view.data.id));
	});
}

function openCart(): void {
	const cartView = new CartView(cloneTemplate(cartTemplate), events);

	cartView.setCheckoutHandler(() => {
		openOrderForm();
	});

	cartView.setRemoveItemHandler((productId) => {
		cartModel.remove(productId);
	});

	refreshCartView(cartView);
	modalView.openModal(cartView.render());
}

function refreshCartView(cartView: CartView): void {
    const products = cartModel.getProducts();
    
    if (products.length === 0) {
    } else {
        cartView.clear();
        products.forEach((product, index) => {
            try {
                const cartItem = createCartItem(product, index + 1);
                cartItem.setAttribute('data-id', product.id);
                cartView.addItem(cartItem, product.id);
            } catch (error) {
                console.error('Failed to create cart item:', error);
            }
        });
    }
    
    cartView.updateTotal(cartModel.getTotal());
}

function openOrderForm(): void {
	const orderForm = new OrderFormView(cloneTemplate(orderFormTemplate), events);

	orderForm.setSubmitHandler((data: Partial<Order>) => {
		if (data.payment) orderModel.payment = data.payment;
		if (data.address) orderModel.address = data.address;
	});

	orderForm.setNextStepHandler(() => {
		const errors = orderModel.validateStep1();
		if (Object.keys(errors).length === 0) {
			orderModel.items = cartModel.getItems();
			orderModel.total = cartModel.getTotal();
			openContactsForm();
		} else {
			orderForm.showValidationErrors(errors);
		}
	});

	modalView.openModal(orderForm.render());
}

function openContactsForm(): void {
	const contactsForm = new ContactsFormView(
		cloneTemplate(contactsFormTemplate),
		events
	);

	contactsForm.setSubmitHandler((data: Partial<Order>) => {
		if (data.email) orderModel.email = data.email;
		if (data.phone) orderModel.phone = data.phone;

		const errors = orderModel.validateStep2();
		if (Object.keys(errors).length === 0) {
			const orderData: Order = {
				payment: orderModel.payment,
				address: orderModel.address,
				email: orderModel.email,
				phone: orderModel.phone,
				items: orderModel.items,
				total: orderModel.total,
			};

			api
				.sendOrder(orderData)
				.then((response) => {
					showSuccessWindow();
				})
				.catch((error) => {
					console.error('Ошибка при оформлении заказа:', error);
					contactsForm.showValidationErrors({
						phone: error.message || ERROR_MESSAGES.ORDER_ERROR,
					});
				});
		} else {
			contactsForm.showValidationErrors(errors);
		}
	});

	contactsForm.setBackHandler(() => {
		openOrderForm();
	});

	modalView.openModal(contactsForm.render());
}

function showSuccessWindow(): void {
	const successView = new SuccessWindowView(
		cloneTemplate(windowSuccessTemplate),
		events
	);
	successView.setContinueShoppingHandler(() => {
		modalView.closeModal();
		cartModel.clear();
		orderModel.reset();
		updateCartCounter();
		updateCartButtons();
	});

	modalView.openModal(successView.render(orderModel.total));
}

api
	.getItems()
	.then((data) => {
		cartModel.clear();

		itemViews = data.items.map((item: ApiProduct) => {
			const product: Product = {
				id: item.id,
				title: item.title,
				description: item.description,
				price: item.price,
				image: CDN_URL + item.image,
				category: item.category,
			};

			const itemView = new ItemView(
				cloneTemplate(templateGalleryCard),
				events,
				product
			);

			itemView.setAddToCartHandler((product) => {
				if (!cartModel.hasItem(product.id)) {
					cartModel.add(product);
				}
			});

			itemView.setRemoveFromCartHandler((productId) => {
				cartModel.remove(productId);
			});

			itemView.setIsInCartHandler((productId) => {
				return cartModel.hasItem(productId);
			});

			gallery.appendChild(itemView.render());
			return itemView;
		});

		updateCartButtons();
		updateCartCounter();
	})
	.catch((err) => {
		console.error('Ошибка загрузки товаров:', err);
		gallery.innerHTML =
			'<p class="error">Не удалось загрузить товары. Пожалуйста, попробуйте позже.</p>';
	});


events.on('modal:open', (data: { element: HTMLElement }) => {
	if (data.element) {
		modalView.openModal(data.element);
	}
});

events.on('modal:close', () => {
	modalView.closeModal();
});

events.on('cart:changed', () => {
	console.log('Cart changed event received');
	updateCartCounter();
	updateCartButtons();
});

const headerBasket = ensureElement('.header__basket');
headerBasket.addEventListener('click', (e) => {
	e.preventDefault();
	openCart();
});

updateCartCounter();
modalView.setCloseHandler(() => {
	events.emit('modal:close');
});
