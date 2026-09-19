import { EventEmitter } from "node:events";
import { IEventPublisher } from "../../repositories/interfaces/contracts.js";

export class LocalEventPublisher extends IEventPublisher {
  constructor() {
    super();
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(50);
  }

  async publishEvent(topic, payload) {
    const event = {
      topic,
      payload,
      timestamp: new Date().toISOString(),
    };
    this.emitter.emit(topic, event);
    this.emitter.emit("*", event);
    return event;
  }

  subscribe(topic, handler) {
    this.emitter.on(topic, handler);
    return () => this.emitter.off(topic, handler);
  }
}
