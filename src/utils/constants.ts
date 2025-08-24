export const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
export const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek`;

export const settings = {

};

export const categoryClasses:{[key: string]: string} = {
  "Cофт-скил": "card__category_soft",
  "Хард-скил": "card__category_hard",
  "Кнопка": "card__category_button",
  "Дополнительно": "card__category_additional",
  "Другое": "card__category_other"
}

export const PaymentMethods:{[key: string]: string} = {
  "card": "online",
  "cash": "cash"
}