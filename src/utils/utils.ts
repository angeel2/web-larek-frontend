export function pascalToKebab(value: string): string {
    return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

export function isSelector(x: any): x is string {
    return (typeof x === "string") && x.length > 1;
}

export function isEmpty(value: any): boolean {
    return value === null || value === undefined;
}

export type SelectorCollection<T> = string | NodeListOf<Element> | T[];

export function ensureAllElements<T extends HTMLElement>(selectorElement: SelectorCollection<T>, context: HTMLElement = document as unknown as HTMLElement): T[] {
    if (isSelector(selectorElement)) {
        return Array.from(context.querySelectorAll(selectorElement)) as T[];
    }
    if (selectorElement instanceof NodeList) {
        return Array.from(selectorElement) as T[];
    }
    if (Array.isArray(selectorElement)) {
        return selectorElement;
    }
    throw new Error(`Unknown selector element`);
}

export type SelectorElement<T> = T | string;

export function ensureElement<T extends HTMLElement>(selectorElement: SelectorElement<T>, context?: HTMLElement): T {
    if (isSelector(selectorElement)) {
        const elements = ensureAllElements<T>(selectorElement, context);
        if (elements.length > 1) {
            console.warn(`selector ${selectorElement} return more then one element`);
        }
        if (elements.length === 0) {
            throw new Error(`selector ${selectorElement} return nothing`);
        }
        return elements[0] as T;
    }
    if (selectorElement instanceof HTMLElement) {
        return selectorElement as T;
    }
    throw new Error('Unknown selector element');
}

// Типизированные ensure функции
export function ensureButtonElement(selector: string, context?: HTMLElement): HTMLButtonElement {
    return ensureElement<HTMLButtonElement>(selector, context);
}

export function ensureInputElement(selector: string, context?: HTMLElement): HTMLInputElement {
    return ensureElement<HTMLInputElement>(selector, context);
}

export function ensureImageElement(selector: string, context?: HTMLElement): HTMLImageElement {
    return ensureElement<HTMLImageElement>(selector, context);
}

export function ensureTemplateElement(selector: string, context?: HTMLElement): HTMLTemplateElement {
    return ensureElement<HTMLTemplateElement>(selector, context);
}

export function cloneTemplate<T extends HTMLElement>(query: string | HTMLTemplateElement): T {
    let template: HTMLTemplateElement;
    
    if (typeof query === 'string') {
        const element = document.querySelector(query);
        if (!element) {
            throw new Error(`Template selector "${query}" not found`);
        }
        if (!(element instanceof HTMLTemplateElement)) {
            throw new Error(`Element found with selector "${query}" is not a template`);
        }
        template = element;
    } else {
        template = query;
    }

    if (!template.content || template.content.children.length === 0) {
        throw new Error(`Template content is empty for selector "${template.id || 'unknown'}"`);
    }

    return template.content.firstElementChild.cloneNode(true) as T;
}

export function bem(block: string, element?: string, modifier?: string): { name: string, class: string } {
    let name = block;
    if (element) name += `__${element}`;
    if (modifier) name += `_${modifier}`;
    return {
        name,
        class: `.${name}`
    };
}

export function getObjectProperties(obj: object, filter?: (name: string, prop: PropertyDescriptor) => boolean): string[] {
    return Object.entries(
        Object.getOwnPropertyDescriptors(
            Object.getPrototypeOf(obj)
        )
    )
        .filter(([name, prop]: [string, PropertyDescriptor]) => filter ? filter(name, prop) : (name !== 'constructor'))
        .map(([name, prop]) => name);
}

export function setElementData<T extends Record<string, unknown> | object>(el: HTMLElement, data: T) {
    for (const key in data) {
        el.dataset[key] = String(data[key]);
    }
}

export function getElementData<T extends Record<string, unknown>>(el: HTMLElement, scheme: Record<string, Function>): T {
    const data: Partial<T> = {};
    for (const key in el.dataset) {
        data[key as keyof T] = scheme[key](el.dataset[key]);
    }
    return data as T;
}

export function isPlainObject(obj: unknown): obj is object {
    const prototype = Object.getPrototypeOf(obj);
    return prototype === Object.getPrototypeOf({}) || prototype === null;
}

export function isBoolean(v: unknown): v is boolean {
    return typeof v === 'boolean';
}

export function createElement<T extends HTMLElement>(
    tagName: keyof HTMLElementTagNameMap,
    props?: Partial<Record<keyof T, string | boolean | object>>,
    children?: HTMLElement | HTMLElement[]
): T {
    const element = document.createElement(tagName) as T;
    if (props) {
        for (const key in props) {
            const value = props[key];
            if (isPlainObject(value) && key === 'dataset') {
                setElementData(element, value);
            } else {
                // @ts-expect-error fix indexing later
                element[key] = isBoolean(value) ? value : String(value);
            }
        }
    }
    if (children) {
        for (const child of Array.isArray(children) ? children : [children]) {
            element.append(child);
        }
    }
    return element;
}

export function formatPrice(price: number): string {
    return `${price.toLocaleString('ru-RU')} синапсов`;
}

export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[78][-(]?\d{3}\)?-?\d{3}-?\d{2}-?\d{2}$/;
    return phoneRegex.test(phone);
}

export function getCategoryClass(category: string): string {
    const categoryClasses: Record<string, string> = {
        'софт-скил': 'card__category_soft',
        'хард-скил': 'card__category_hard',
        'другое': 'card__category_other',
        'дополнительное': 'card__category_additional',
        'кнопка': 'card__category_button'
    };
    return categoryClasses[category] || 'card__category_other';
}