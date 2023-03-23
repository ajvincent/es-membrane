import type { propertyKey } from "../../_02_membrane_utilities/source/publicUtilities.mjs";

/*
void(Reflect as Required<ProxyHandler<object>>);
*/

export type RequiredHandler = Required<ProxyHandler<object>>;

export type ShadowProxyHandler =
{
  apply(
    shadowTarget: object,
    thisArg: unknown,
    argArray: unknown[],

    nextTarget: object,
    nextHandler: RequiredHandler,

    nextThisArg: unknown,
    nextArgArray: unknown[]
  ): unknown;

  construct(
    shadowTarget: object,
    argArray: unknown[],
    newTarget: Function,

    nextTarget: object,
    nextHandler: RequiredHandler,

    nextArgArray: unknown[],
    nextNewTarget: Function
  ): object;

  defineProperty(
    shadowTarget: object,
    p: propertyKey,
    attributes: PropertyDescriptor,

    nextTarget: object,
    nextHandler: RequiredHandler,

    nextAttributes: PropertyDescriptor
  ): boolean;

  deleteProperty(
    shadowTarget: object,
    p: propertyKey,

    nextTarget: object,
    nextHandler: RequiredHandler
  ): boolean;

  get(
    shadowTarget: object,
    p: propertyKey,
    receiver: unknown,

    nextTarget: object,
    nextHandler: RequiredHandler,

    nextReceiver: unknown
  ): unknown;

  getOwnPropertyDescriptor(
    shadowTarget: object,
    p: propertyKey,

    nextTarget: object,
    nextHandler: RequiredHandler
  ): PropertyDescriptor | undefined;

  getPrototypeOf(
    shadowTarget: object,

    nextTarget: object,
    nextHandler: RequiredHandler
  ): object | null;

  has(
    shadowTarget: object,
    p: propertyKey,

    nextTarget: object,
    nextHandler: RequiredHandler
  ): boolean;

  isExtensible(
    shadowTarget: object,

    nextTarget: object,
    nextHandler: RequiredHandler
  ): boolean;

  ownKeys(
    shadowTarget: object,

    nextTarget: object,
    nextHandler: RequiredHandler
  ): ArrayLike<propertyKey>;

  preventExtensions(
    shadowTarget: object,

    nextTarget: object,
    nextHandler: RequiredHandler
  ): boolean;

  set(
    shadowTarget: object,
    p: propertyKey,
    value: unknown,
    receiver: unknown,

    nextTarget: object,
    nextHandler: RequiredHandler,

    nextValue: unknown,
    nextReceiver: unknown
  ): boolean;

  setPrototypeOf(
    shadowTarget: object,
    proto: object | null,

    nextTarget: object,
    nextHandler: RequiredHandler,

    nextProto: object | null
  ): boolean;
}
