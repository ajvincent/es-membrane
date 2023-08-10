/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * This proxy handler is simply making any methods which modify an array in
 * place unreachable, and likewise prevents setting index values.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy#handler_functions}
 */
export default class ReadonlyArrayProxyHandler<ElementType>
implements Required<ProxyHandler<ElementType[]>>
{
  /** Members which don't affect the original array. */
  static #safeMembers: ReadonlySet<keyof (readonly object[])> = new Set([
    Symbol.iterator,
    Symbol.unscopables,
    "length",
    "concat",
    "join",
    "slice",
    "indexOf",
    "lastIndexOf",
    "every",
    "some",
    "forEach",
    "map",
    "filter",
    "reduce",
    "reduceRight",
    "find",
    "findIndex",
    "entries",
    "keys",
    "values",
    "includes",
    "flatMap",
    "flat",
    "at",
    "findLast",
    "findLastIndex",
  ]);

  /** Determine if the array field is safe to return.  Some methods, all numbered indexes. */
  static #isSafeMember(p: string | symbol): boolean {
    if (this.#safeMembers.has(p as keyof readonly object[]))
      return true;

    if (p === "constructor")
      return true;

    if (typeof p === "symbol")
      return false;

    const pNum = parseFloat(p);
    if (isNaN(pNum) || (Math.floor(pNum) !== pNum) || (pNum < 0) || !isFinite(pNum))
      return false;

    return true;
  }

  readonly #errorMessage: string;

  /**
   * @param errorMessage - an error message to throw for unreachable methods.
   */
  constructor(
    errorMessage: string
  )
  {
    this.#errorMessage = errorMessage;
  }

  apply(target: ElementType[], thisArg: any, argArray: any[]): never
  {
    throw new Error("Method not implemented.");
  }
  construct(target: ElementType[], argArray: any[], newTarget: Function): object {
    throw new Error("Method not implemented.");
  }
  defineProperty(target: ElementType[], property: string | symbol, attributes: PropertyDescriptor): boolean {
    throw new Error(this.#errorMessage);
  }
  deleteProperty(target: ElementType[], p: string | symbol): boolean {
    throw new Error(this.#errorMessage);
  }
  get(target: ElementType[], p: string | symbol, receiver: any): any {
    if (ReadonlyArrayProxyHandler.#isSafeMember(p)) {
      return Reflect.get(target, p, receiver);
    }
    if (!Reflect.has(Array.prototype, p))
      return undefined;
    throw new Error(this.#errorMessage);
  }
  getOwnPropertyDescriptor(target: ElementType[], p: string | symbol): PropertyDescriptor | undefined {
    if (ReadonlyArrayProxyHandler.#isSafeMember(p))
      return Reflect.getOwnPropertyDescriptor(target, p);
    if (!Reflect.has(Array.prototype, p))
      return undefined;
    throw new Error(this.#errorMessage);
  }
  getPrototypeOf(target: ElementType[]): object | null {
    return Reflect.getPrototypeOf(target);
  }
  has(target: ElementType[], p: string | symbol): boolean {
    return Reflect.has(target, p);
  }
  isExtensible(target: ElementType[]): boolean {
    return Reflect.isExtensible(target);
  }
  ownKeys(target: ElementType[]): ArrayLike<string | symbol> {
    return Reflect.ownKeys(target);
  }
  preventExtensions(target: ElementType[]): boolean {
    throw new Error(this.#errorMessage);
  }
  set(target: ElementType[], p: string | symbol, newValue: any, receiver: any): boolean {
    throw new Error(this.#errorMessage);
  }
  setPrototypeOf(target: ElementType[], v: object | null): boolean {
    throw new Error(this.#errorMessage);
  }
}
