export const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
export const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek`;

export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Поле обязательно для заполнения',
  INVALID_EMAIL: 'Введите корректный email',
  INVALID_PHONE: 'Введите корректный телефон',
  SELECT_PAYMENT: 'Выберите способ оплаты',
  ENTER_ADDRESS: 'Введите адрес доставки',
  ORDER_ERROR: 'Ошибка при оформлении заказа. Попробуйте еще раз.'
};

export const CATEGORY_CLASSES = {
  'софт-скил': 'card__category_soft',
  'хард-скил': 'card__category_hard',
  'другое': 'card__category_other',
  'дополнительное': 'card__category_additional',
  'кнопка': 'card__category_button'
};

export const CURRENCY = 'синапсов';