import type { propertyKey } from "./publicUtilities.mjs";
import type {
  ShadowProxyHandler,
  RequiredHandler,
} from "./ShadowProxyHandler.mjs";

/**
 * @remarks
 * `TailHandler` converts from `ShadowProxyHandler<T>` to `Required<ProxyHandler<T>>` by invoking the
 * `nextHandler` argument with the `nextTarget` and `nextArgArray`, `nextThisArg`, `nextDescriptor`,
 * etc. arguments.
 */
export default class TailHandler implements ShadowProxyHandler
{
  apply(
    shadowTarget: object,
    thisArg: unknown,
    argArray: unknown[],
    
    nextTarget: object,
    nextHandler: RequiredHandler,
    
    nextThisArg: unknown,
    nextArgArray: unknown[]
  ): unknown
  {
    void(shadowTarget);
    void(thisArg);
    void(argArray);
    return nextHandler.apply(nextTarget, nextThisArg, nextArgArray);
  }

  construct(
    shadowTarget: object,
    argArray: unknown[],
    newTarget: Function,
    
    nextTarget: object,
    nextHandler: RequiredHandler,

    nextArgArray: unknown[],
    nextNewTarget: Function
  ): object
  {
    void(shadowTarget);
    void(argArray);
    void(newTarget);
    return nextHandler.construct(nextTarget, nextArgArray, nextNewTarget);
  }

  defineProperty(
    shadowTarget: object,
    p: propertyKey,
    attributes: PropertyDescriptor,
    
    nextTarget: object,
    nextHandler: RequiredHandler,
    
    nextAttributes: PropertyDescriptor
  ): boolean
  {
    void(shadowTarget);
    void(attributes);
    return nextHandler.defineProperty(nextTarget, p, nextAttributes);
  }

  deleteProperty(
    shadowTarget: object,
    p: propertyKey,
    
    nextTarget: object,
    nextHandler: RequiredHandler
  ): boolean
  {
    void(shadowTarget);
    return nextHandler.deleteProperty(nextTarget, p);
  }

  get(
    shadowTarget: object,
    p: propertyKey,
    receiver: unknown,

    nextTarget: object,
    nextHandler: RequiredHandler,
    nextReceiver: unknown
  ): unknown
  {
    void(shadowTarget);
    void(receiver);
    return nextHandler.get(nextTarget, p, nextReceiver);
  }

  getOwnPropertyDescriptor(
    shadowTarget: object,
    p: propertyKey,

    nextTarget: object,
    nextHandler: RequiredHandler
  ): PropertyDescriptor | undefined
  {
    void(shadowTarget);
    return nextHandler.getOwnPropertyDescriptor(nextTarget, p);
  }

  getPrototypeOf(
    shadowTarget: object,

    nextTarget: object,
    nextHandler: RequiredHandler
  ): object | null
  {
    void(shadowTarget);
    return nextHandler.getPrototypeOf(nextTarget);
  }

  has(
    shadowTarget: object,
    p: propertyKey,

    nextTarget: object,
    nextHandler: RequiredHandler
  ): boolean
  {
    void(shadowTarget);
    return nextHandler.has(nextTarget, p);
  }

  isExtensible(
    shadowTarget: object,
    
    nextTarget: object,
    nextHandler: RequiredHandler
  ): boolean
  {
    void(shadowTarget);
    return nextHandler.isExtensible(nextTarget);
  }

  ownKeys(
    shadowTarget: object,

    nextTarget: object,
    nextHandler: RequiredHandler
  ) : ArrayLike<propertyKey>
  {
    void(shadowTarget);
    return nextHandler.ownKeys(nextTarget);
  }

  preventExtensions(
    shadowTarget: object,
    
    nextTarget: object,
    nextHandler: RequiredHandler
  ): boolean
  {
    void(shadowTarget);
    return nextHandler.preventExtensions(nextTarget);
  }

  set(
    shadowTarget: object,
    p: propertyKey,
    value: unknown,
    receiver: unknown,

    nextTarget: object,
    nextHandler: RequiredHandler,

    nextValue: unknown,
    nextReceiver: unknown
  ): boolean
  {
    void(shadowTarget);
    void(value);
    void(receiver);
    return nextHandler.set(nextTarget, p, nextValue, nextReceiver);
  }

  setPrototypeOf(
    shadowTarget: object,
    proto: object | null,

    nextTarget: object,
    nextHandler: RequiredHandler,
    
    nextProto: object | null
  ): boolean
  {
    void(shadowTarget);
    void(proto);
    return nextHandler.setPrototypeOf(nextTarget, nextProto);
  }
}
