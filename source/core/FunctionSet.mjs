/** @module source/core/FunctionSet.mjs */

import {
  defineNWNCProperties
} from "./utilities/shared.mjs";

const validThrowModes = [
  // XXX ajvincent when Node 16 is released, allow aggregate throw mode
  "immediately", "deferred", "return", "none"
];
if (typeof AggregateError === "function")
  validThrowModes.push("aggregate");
const validThrowMessage = `valid throw modes are ${JSON.stringify(validThrowModes).replace(/^.(.*).$/, "$1")}!`;

export default class FunctionSet extends Set {
  constructor(throwMode = "immediately") {
    super();
    if (!validThrowModes.includes(throwMode))
      throw new Error(validThrowMessage)

    defineNWNCProperties(this, { throwMode }, true);
  }

  add(value) {
    if (typeof value !== "function")
      return false;

    super.add(value);
    return true;
  }

  observe(...args) {
    let exceptionThrown = false, exception = [];
    const iterator = (new Set(this)).entries(), results = [];

    for (let [callback] of iterator) {
      try {
        results.push(callback(...args));
      }
      catch (ex) {
        if (this.throwMode === "immediately")
          throw ex;
        else if ((this.throwMode === "deferred")) {
          if (!exceptionThrown) {
            exceptionThrown = true;
            exception = ex;
          }
        }
        else if (this.throwMode === "aggregate") {
          exceptionThrown = true;
          exception.push(ex);
        }
        else if (this.throwMode === "return")
          break;
      }
    }

    if (exceptionThrown) {
      //eslint-disable-next-line no-undef
      throw this.throwMode === "aggregate" ? new AggregateError(exception) : exception;
    }

    return results;
  }
}

Object.freeze(FunctionSet);
Object.freeze(FunctionSet.prototype);
