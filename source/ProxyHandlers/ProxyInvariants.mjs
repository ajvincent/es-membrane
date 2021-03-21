/**
 * @fileoverview
 * This defines ProxyInvariant for the express purpose of verifying that an
 * ProxyHandler implementation does not violate the ECMAScript specification's
 * invariants regarding proxies.
 *
 * Why not rely on the engine to assert?  The exception that gets thrown would
 * be after the ProxyHandler code has successfully exited.  This at least
 * assures the offending proxy handler method is on the stack when the exception
 * happens.
 *
 * This is a shim, for a proposed Proxy.invariant addition to the ECMAScript
 * standard.  The API for each method of ProxyInvariant MUST be identical to
 * the Reflect API, with the exception that each method has an additional
 * tailing argument for the return value to test against.
 *
 * Thus, a ProxyHandler's has method wishing to verify its correctness may call:
 *
 * return ProxyInvariant.has(target, name, rv);
 */

import {
  isDataDescriptor,
  isAccessorDescriptor
} from "../core/utilities/shared.mjs";

import { LinkedListNode } from "./LinkedList.mjs";

function isGenericDescriptor(desc) {
  if (typeof desc === "undefined")
    return false;
  return !isAccessorDescriptor(desc) && !isDataDescriptor(desc);
}

function IsPropertyKey(P, prefix) {
  const type = typeof P;
  if ((type !== "string") && (type !== "symbol"))
    throw new TypeError(`${prefix}: property name is neither a string nor a symbol`);
}

/**
 * @throws TypeError
 *
 * @see https://www.ecma-international.org/ecma-262/9.0/index.html#sec-topropertydescriptor
 */
function IsCompatiblePropertyDescriptor(extensible, Desc, current, prefix = "") {
  // Step 2.
  if (!current) {
    if (extensible === false)
      throw new TypeError(`${prefix}: proxy can't report an extensible object as non-extensible`);
    if (extensible !== true)
      throw new TypeError(`${prefix}: proxy must report extensible is true`);
    return;
  }

  // Step 3.
  const keys = new Set();
  ["value", "writable", "get", "set", "configurable", "enumerable"].every(
    (key) => {
      if (key in Desc) keys.add(key);
    }
  );
  if (!keys.length)
    return;

  // Step 4
  if (!current.configurable) {
    if (keys.has("configurable") && Desc.configurable)
      throw new TypeError(`${prefix}: proxy can't report an existing non-configurable property as configurable`);
    if (keys.has("enumerable") && (Desc.enumerable !== current.enumerable))
      throw new TypeError(`${prefix}: proxy can't report a different 'enumerable' from target when target is not configurable`);
  }

  // Step 5
  if (isGenericDescriptor(Desc))
    return;

  // Step 6
  const isCurrentData = isDataDescriptor(current);
  if (isCurrentData !== isDataDescriptor(Desc)) {
    if (!current.configurable)
      throw new TypeError(`${prefix}: proxy can't report a different descriptor type when target is not configurable`);
  }

  // Step 7
  if (isCurrentData) {
    if (!current.configurable && !current.writable) {
      if (keys.has("writable") && Desc.writable)
        throw new TypeError(`${prefix}: proxy can't report a non-configurable, non-writable property as writable`);
      if (keys.has("value") && (Desc.value !== current.value))
        throw new TypeError(`${prefix}: proxy must report the same value for the non-writable, non-configurable property`);
    }
  }

  // Step 8
  else {
    if (!current.configurable) {
      if (keys.has("set") && (Desc.set !== current.set))
        throw new TypeError(`${prefix}: proxy can't report different setters for a currently non-configurable property`);
      if (keys.has("get") && (Desc.get !== current.get))
        throw new TypeError(`${prefix}: proxy can't report different getters for a currently non-configurable property`);
    }
  }
}

class ProxyInvariants extends LinkedListNode {
  getPrototypeOf(target, ...args) {
    const rv = this.nextHandler(target).getPrototypeOf(target, ...args);

    // 9.5.1, https://www.ecma-international.org/ecma-262/9.0/index.html#sec-proxy-object-internal-methods-and-internal-slots-getprototypeof
    const type = typeof rv;
    if ((rv === null) || ((type !== "object") && (type !== "undefined")))
      throw new TypeError("ProxyHandler.getPrototypeOf must return a non-null object");
    if (Reflect.isExtensible(target))
      return target;
    if (Reflect.getPrototypeOf(target) !== rv)
      throw new TypeError("ProxyHandler.getPrototypeOf must return the same value as Reflect.getPrototypeOf");
    return rv;
  }

  setPrototypeOf(target, proto, ...args) {
    const rv = this.nextHandler(target).setPrototypeOf(target, proto, ...args);
    // 9.5.2, https://www.ecma-international.org/ecma-262/9.0/index.html#sec-proxy-object-internal-methods-and-internal-slots-setprototypeof-v
    if (rv === false)
      return false;
    if (rv !== true)
      throw new TypeError("ProxyHandler.setPrototypeOf must return true or false");
    if (Reflect.isExtensible(target))
      return true;
    if (Reflect.getPrototypeOf(target) !== rv)
      throw new TypeError("ProxyHandler.setPrototypeOf must return the same value as Reflect.getPrototypeOf");
    return rv;
  }

  isExtensible(target, ...args) {
    const rv = this.nextHandler(target).isExtensible(target, ...args);
    // 9.5.3, https://www.ecma-international.org/ecma-262/9.0/index.html#sec-proxy-object-internal-methods-and-internal-slots-isextensible
    if (typeof rv !== "boolean")
      throw new TypeError("ProxyHandler.isExtensible must return true or false");
    if (rv !== Reflect.isExtensible(target))
      throw new TypeError("ProxyHandler.isExtensible must return the same value as Reflect.isExtensible");
    return rv;
  }

  preventExtensions(target, ...args) {
    const rv = this.nextHandler(target).preventExtensions(target, ...args);
    // 9.5.4, https://www.ecma-international.org/ecma-262/9.0/index.html#sec-proxy-object-internal-methods-and-internal-slots-preventextensions
    if (typeof rv !== "boolean")
      throw new TypeError("ProxyHandler.preventExtensions must return true or false");
    if (rv && Reflect.isExtensible(target))
      throw new TypeError("ProxyHandler.preventExtensions only returns true if Reflect.isExtensible returns false");
    return rv;
  }

  getOwnPropertyDescriptor(target, name, ...args) {
    const rv = this.nextHandler(target).getOwnPropertyDescriptor(target, name, ...args);
    // 9.5.5, https://www.ecma-international.org/ecma-262/9.0/index.html#sec-proxy-object-internal-methods-and-internal-slots-getownproperty-p
    const prefix = `ProxyHandler.getOwnPropertyDescriptor(target, ${name})`;
    IsPropertyKey(name, prefix);
    const type = typeof rv;
    if ((rv === null) || ((type !== "object") && (type !== "undefined")))
      throw new TypeError(`${prefix}: proxy must return an object or undefined`);
  
    const desc = Reflect.getOwnPropertyDescriptor(target, name);
    if (type === "undefined") {
      if (desc === undefined)
        return undefined;
      if (!desc.configurable)
        throw new TypeError(`${prefix}: proxy can't report a non-configurable own property as non-existent`);
      if (!Reflect.isExtensible(target))
        throw new TypeError(`${prefix}: proxy can't report an existing own property as non-existent on a non-extensible object`);
      return undefined;
    }
  
    // ToPropertyDescriptor
    {
      let isAccessor = false;
      if ("get" in desc) {
        const gtype = typeof desc.get;
        if ((gtype !== "function") && (gtype !== "undefined"))
          throw new TypeError(`${prefix} must return a descriptor with get undefined or as a function`);
        isAccessor = true;
      }
      if ("set" in desc) {
        const stype = typeof desc.set;
        if ((stype !== "function") && (stype !== "undefined"))
          throw new TypeError(`${prefix} must return a descriptor with set undefined or as a function`);
        isAccessor = true;
      }
      if (isAccessor) {
        if (("value" in desc) || ("writable" in desc))
          throw new TypeError(`${prefix} must return an accessor descriptor or a data descriptor (not both)`);
      }
    }
  
    {
      const extensibleTarget = Reflect.isExtensible(target);
      IsCompatiblePropertyDescriptor(
        extensibleTarget, rv, desc, prefix + " incompatible property descriptor"
      );
      if (!rv.configurable) {
        if (!desc)
          throw new TypeError(`${prefix}: proxy can't report a non-existent property as non-configurable`);
        if (desc.configurable)
          throw new TypeError(`${prefix}: proxy can't report existing configurable property as non-configurable`);
      }
    }
    return rv;
  }

  defineProperty(target, name, Desc, ...args) {
    const rv = this.nextHandler(target).defineProperty(target, name, Desc, ...args);
    // 9.5.6, https://www.ecma-international.org/ecma-262/9.0/index.html#sec-proxy-object-internal-methods-and-internal-slots-defineownproperty-p-desc
    const prefix = `ProxyHandler.defineProperty(target, ${name}, Desc)`;
    IsPropertyKey(name, prefix);
  
    const type = typeof rv;
    if (type !== "boolean")
      throw new TypeError(`${prefix}: return value must be a boolean`);
    if (!rv)
      return false;
  
    const targetDesc = Reflect.getOwnPropertyDescriptor(target, name);
    const extensibleTarget = Reflect.isExtensible(target);
    const settingConfigFalse = Boolean(("configurable" in Desc) && !Desc.configurable);
    if (targetDesc === undefined) {
      if (!extensibleTarget)
        throw new TypeError(`${prefix}: proxy can't define a new property on a non-extensible object`);
      if (settingConfigFalse)
        throw new TypeError(`${prefix}: proxy can't define a non-existent property as non-configurable`);
    }
    else {
      IsCompatiblePropertyDescriptor(extensibleTarget, Desc, targetDesc);
      if (settingConfigFalse && targetDesc.configurable)
        throw new TypeError(`${prefix}: proxy can't define an existing configurable property as non-configurable`);
    }
  
    return true;
  }

  has(target, name, ...args) {
    const rv = this.nextHandler(target).has(target, name, ...args);
    // 9.5.7, https://www.ecma-international.org/ecma-262/9.0/index.html#sec-proxy-object-internal-methods-and-internal-slots-hasproperty-p
    const prefix = `ProxyHandler.has(target, ${name})`;
    IsPropertyKey(name, prefix);
  
    const type = typeof rv;
    if (type !== "boolean")
      throw new TypeError(`${prefix}: return value must be a boolean`);
    if (!rv) {
      const targetDesc = Reflect.getOwnPropertyDescriptor(target, name);
      if (targetDesc !== "undefined") {
        if (!targetDesc.configurable)
          throw new TypeError(`${prefix}: proxy can't report a non-configurable own property as non-existent`);
        if (!Reflect.isExtensible(target))
          throw new TypeError(`${prefix}: proxy can't report an existing own property as non-existent on a non-extensible object`);
      }
    }
  
    return rv;
  }

  get(target, name, receiver, ...args) {
    const rv = this.nextHandler(target).get(target, name, receiver, ...args);
    // 9.5.8, https://www.ecma-international.org/ecma-262/9.0/index.html#sec-proxy-object-internal-methods-and-internal-slots-get-p-receiver
    const prefix = `ProxyHandler.get(target, ${name}, receiver)`;
    IsPropertyKey(name, prefix);
  
    const targetDesc = Reflect.getOwnPropertyDescriptor(target, name, receiver);
    if ((targetDesc !== "undefined") && !targetDesc.configurable) {
      if (isDataDescriptor(targetDesc) &&
          !targetDesc.writable &&
          (rv.value !== targetDesc.value)
      )
        throw new TypeError(`${prefix}: proxy must report the same value for the non-writable, non-configurable property`);
      if (isAccessorDescriptor(targetDesc) &&
          (targetDesc.get === undefined) &&
          (rv !== undefined)
      )
        throw new TypeError(`${prefix}: proxy must report undefined for a non-configurable accessor property without a getter`);
    }
  
    return rv;
  }

  set(target, name, value, receiver, ...args) {
    const rv = this.nextHandler(target).set(target, name, value, receiver, ...args);

    // 9.5.9, https://www.ecma-international.org/ecma-262/9.0/index.html#sec-proxy-object-internal-methods-and-internal-slots-set-p-v-receiver
    const prefix = `ProxyHandler.set(target, ${name}, value, receiver)`;
    IsPropertyKey(name, prefix);
  
    if (typeof rv !== "boolean")
      throw new TypeError(`${prefix}: return value must be a boolean`);
    if (!rv)
      return false;
  
    const targetDesc = Reflect.getOwnPropertyDescriptor(target, name, value, receiver);
    if ((targetDesc !== undefined) && !targetDesc.configurable) {
      if (isDataDescriptor(targetDesc) &&
          !targetDesc.writable &&
          (value !== targetDesc.value))
        throw new TypeError(`${prefix}: proxy can't successfully set a non-writable, non-configurable property`);
      if (isAccessorDescriptor(targetDesc) && (targetDesc.set === undefined))
        throw new TypeError(`${prefix}: proxy can't succesfully set an accessor property without a setter`);
    }
  
    return true;
  }

  deleteProperty(target, name, ...args) {
    const rv = this.nextHandler(target).deleteProperty(target, name, ...args);

    // 9.5.10, https://www.ecma-international.org/ecma-262/9.0/index.html#sec-proxy-object-internal-methods-and-internal-slots-delete-p
    const prefix = `ProxyHandler.delete(target, ${name})`;
    IsPropertyKey(name, prefix);

    if (typeof rv !== "boolean")
      throw new TypeError(`${prefix}: return value must be a boolean`);
    if (rv === false)
      return false;
    const targetDesc = Reflect.getOwnPropertyDescriptor(target, name);
    if (targetDesc === undefined)
      return true;
    if (!targetDesc.configurable)
      throw new TypeError(`${prefix}: property is non-configurable and can't be deleted`);
    return true;
  }

  ownKeys(target, ...args) {
    const rv = this.nextHandler(target).ownKeys(target, ...args);

    // 9.5.11, https://www.ecma-international.org/ecma-262/9.0/index.html#sec-proxy-object-internal-methods-and-internal-slots-ownpropertykeys
    const prefix = `ProxyHandler.ownKeys(target)`;
    if (!Array.isArray(rv))
      throw new TypeError(`${prefix}: ownKeys should return an array`);
  
    {
      const keys = new Set(rv);
      if (keys.size !== rv.length) {
        rv.every((key) => {
          if (keys.has(key))
            keys.delete(key);
          else
            throw new TypeError(`${prefix}: proxy can't report property '${key}' more than once`);
        });
      }
    }
  
    const extensibleTarget = Reflect.isExtensible(target);
    const targetKeys = Reflect.ownKeys(target);
    const targetConfigurableKeys = [], targetNonconfigurableKeys = [];
  
    targetKeys.forEach((key) => {
      const desc = Reflect.getOwnPropertyDescriptor(key);
      if ((desc !== undefined) && !desc.configurable)
        targetNonconfigurableKeys.push(key);
      else
        targetConfigurableKeys.push(key);
    });
  
    if (extensibleTarget && (targetNonconfigurableKeys.length === 0))
      return rv;
  
    const uncheckedResultKeys = new Set(rv);
    targetNonconfigurableKeys.forEach((key) => {
      if (!uncheckedResultKeys.has(key))
        throw new TypeError(`${prefix}: proxy can't skip a non-configurable property '${key}'`);
      uncheckedResultKeys.delete(key);
    });
  
    if (extensibleTarget)
      return rv;
  
    targetConfigurableKeys.forEach((key) => {
      if (!uncheckedResultKeys.has(key))
        throw new TypeError(`${prefix}: proxy can't report an existing own property '${key}' as non-existent on a non-extensible object`);
      uncheckedResultKeys.delete(key);
    });
  
    if (uncheckedResultKeys.size) {
      const iterator = uncheckedResultKeys.values();
      const key = iterator.next().value;
      throw new TypeError(`${prefix}: proxy can't report a new property '${key}' on a non-extensible object`);
    }
  
    return rv;
  }

  // 9.5.12: https://www.ecma-international.org/ecma-262/9.0/index.html#sec-proxy-object-internal-methods-and-internal-slots-call-thisargument-argumentslist
  /* The apply trap makes no invariant assertions after the target executes.
   */

  construct(target, argList, newTarget, ...args) {
    const rv = this.nextHandler(target).construct(target, argList, newTarget, ...args);

    // 9.5.13: https://www.ecma-international.org/ecma-262/9.0/index.html#sec-proxy-object-internal-methods-and-internal-slots-construct-argumentslist-newtarget
    const type = typeof rv;
    if ((rv !== null) && (type !== "object") && (type !== "function"))
      throw new TypeError(`ProxyHandler.construct: proxy must return an object`);
    return rv;
  }
}


Object.freeze(ProxyInvariants);
Object.freeze(ProxyInvariants.prototype);
export default ProxyInvariants;
