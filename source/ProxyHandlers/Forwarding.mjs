import Base from "./Base.mjs";
import {
  allTraps,
} from "../core/utilities/shared.mjs";

export default class Forwarding extends Base {
  constructor() {
    super();

    Reflect.defineProperty(this, "nextHandler", {
      value: null,
      writable: true,
      enumerable: true,
      configurable: false,
    });
  }
}

{
  const proto = Forwarding.prototype;
  allTraps.forEach((trapName) =>
    proto[trapName] = function(...args) {
      return this.nextHandler[trapName].apply(this.nextHandler, args);
    }
  );
}
