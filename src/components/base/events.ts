type EventName = string | RegExp;
type Subscriber<T = any> = (data: T) => void;

export interface IEvents {
  on<T = any>(event: EventName, callback: Subscriber<T>): void;
  emit<T = any>(event: string, data?: T): void;
  off(event: EventName, callback: Subscriber): void;
}

export class EventEmitter implements IEvents {
  _events: Map<EventName, Set<Subscriber>>;

  constructor() {
    this._events = new Map<EventName, Set<Subscriber>>();
  }

  on<T = any>(eventName: EventName, callback: Subscriber<T>): void {
    if (!this._events.has(eventName)) {
      this._events.set(eventName, new Set<Subscriber>());
    }
    this._events.get(eventName)?.add(callback as Subscriber);
  }

  off(eventName: EventName, callback: Subscriber): void {
    if (this._events.has(eventName)) {
      this._events.get(eventName)!.delete(callback);
      if (this._events.get(eventName)?.size === 0) {
        this._events.delete(eventName);
      }
    }
  }

  emit<T = any>(eventName: string, data?: T): void {
    this._events.forEach((subscribers, name) => {
      if (name instanceof RegExp && name.test(eventName) || name === eventName) {
        subscribers.forEach(callback => callback(data));
      }
    });
  }
}