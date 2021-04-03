/** @module source/core/utilities/FunctionSet.mjs */

import {
  defineNWNCProperties
} from "./shared.mjs";

const validThrowModes = [
  // XXX ajvincent when Node 16 is released, allow aggregate throw mode
  "immediately", "deferred", "return", "none"
];
if (typeof AggregateError === "function")
  validThrowModes.push("aggregate");
const validThrowMessage = `valid throw modes are functions and ${JSON.stringify(validThrowModes).replace(/^.(.*).$/, "$1")}!`;

/**
 * @package
 */
export default class FunctionSet extends Set {
  /**
   * @param {
   *   Function |
   *   "immediately" |
   *   "deferred" |
   *   "return" |
   *   "none" |
   *   "aggregate"
   * } throwMode The mode of operations for handling exceptions.
   */
  constructor(throwMode = "immediately") {
    super();
    if ((typeof throwMode !== "function") && !validThrowModes.includes(throwMode))
      throw new Error(validThrowMessage)

    defineNWNCProperties(this, {
      /**
       * @private
       */
      throwMode
    }, true);
  }

  /**
   * @returns {boolean}
   * @override
   */
  add(value) {
    if (typeof value !== "function")
      return false;

    super.add(value);
    return true;
  }

  /**
   * Call all functions in the set, depending on the throwMode.
   *
   * @param {void[]} args The arguments to pass in.
   * @returns {void[]}
   *
   * @public
   */
  observe(...args) {
    let exceptionThrown = false, exception = [];
    const iterator = Array.from(this.values()), results = [];

    for (let callback of iterator) {
      try {
        results.push(callback(...args));
      }
      catch (ex) {
        if (typeof this.throwMode === "function")
          this.throwMode(ex);
        else if (this.throwMode === "immediately")
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