import type { ShadowProxyHandler } from "./ShadowProxyHandler.mjs";
import type { ObjectGraphStub } from "./ObjectGraphStub.mjs";

type NextTargetAndHandler<T extends object> = {
  nextTarget: T,
  nextHandler: Required<ProxyHandler<T>>;
}

export default class HeadHandler<T extends object> implements Required<ProxyHandler<T>>
{
  readonly #shadowHandler: ShadowProxyHandler<T>;
  readonly #currentGraph: ObjectGraphStub<T>;
  readonly #targetGraph: ObjectGraphStub<T>;

  constructor(
    shadowHandler: ShadowProxyHandler<T>,
    currentGraph: ObjectGraphStub<T>,
    targetGraph: ObjectGraphStub<T>
  )
  {
    this.#shadowHandler = shadowHandler;
    this.#currentGraph = currentGraph;
    this.#targetGraph = targetGraph;
  }

  #nextTargetAndHandler(shadowTarget: T) : NextTargetAndHandler<T>
  {
    const nextTarget  = this.#targetGraph.getNextTargetForShadow(shadowTarget);
    const nextHandler = this.#targetGraph.getHandlerForTarget(nextTarget);

    return { nextTarget, nextHandler };
  }

  apply
  (
    shadowTarget: T,
    thisArg: unknown,
    argArray: unknown[]
  ) : unknown
  {
    const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
    const [nextThisArg, ...nextArgArray] = this.#targetGraph.convertArguments(thisArg, ...argArray);

    const result = this.#shadowHandler.apply(
      shadowTarget, thisArg, argArray, nextTarget, nextHandler, nextThisArg, nextArgArray
    );
    return this.#currentGraph.convertArguments(result)[0];
  }

  construct
  (
    shadowTarget: T,
    argArray: unknown[],
    newTarget: Function
  ) : object
  {
    const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
    const [nextNewTarget, ...nextArgArray] = this.#targetGraph.convertArguments(newTarget, ...argArray);

    const result = this.#shadowHandler.construct(
      shadowTarget, argArray, newTarget, nextTarget, nextHandler, nextArgArray, nextNewTarget as Function
    );
    return this.#currentGraph.convertArguments(result)[0] as object;
  }

  defineProperty(
    shadowTarget: T,
    p: string | symbol,
    attributes: PropertyDescriptor
  ) : boolean
  {
    const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
    const nextAttributes = this.#targetGraph.convertDescriptor(attributes);

    return this.#shadowHandler.defineProperty(
      shadowTarget, p, attributes, nextTarget, nextHandler, nextAttributes
    );
  }

  deleteProperty(
    shadowTarget: T,
    p: string | symbol
  ) : boolean
  {
    const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
    return this.#shadowHandler.deleteProperty(shadowTarget, p, nextTarget, nextHandler);
  }

  get(
    shadowTarget: T,
    p: string | symbol,
    receiver: unknown
  ) : unknown
  {
    const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
    const [nextReceiver] = this.#targetGraph.convertArguments([receiver]);

    const result = this.#shadowHandler.get(
      shadowTarget, p, receiver, nextTarget, nextHandler, nextReceiver
    )

    return this.#currentGraph.convertArguments(result)[0];
  }

  getOwnPropertyDescriptor(
    shadowTarget: T,
    p: string | symbol
  ) : PropertyDescriptor | undefined
  {
    const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
    const desc = this.#shadowHandler.getOwnPropertyDescriptor(
      shadowTarget, p, nextTarget, nextHandler
    );

    return desc ? this.#currentGraph.convertDescriptor(desc) : desc;
  }

  getPrototypeOf(
    shadowTarget: T
  ) : object | null
  {
    const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
    const proto = this.#shadowHandler.getPrototypeOf(
      shadowTarget, nextTarget, nextHandler
    );

    return this.#currentGraph.convertArguments(proto)[0] as object | null
  }

  has(
    shadowTarget: T,
    p: string | symbol
  ) : boolean
  {
    const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
    return this.#shadowHandler.has(shadowTarget, p, nextTarget, nextHandler);
  }

  isExtensible(
    shadowTarget: T,
  ) : boolean
  {
    const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
    return this.#shadowHandler.isExtensible(shadowTarget, nextTarget, nextHandler);
  }

  ownKeys(shadowTarget: T) : ArrayLike<string | symbol>
  {
    const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
    return this.#shadowHandler.ownKeys(shadowTarget, nextTarget, nextHandler);
  }

  preventExtensions(
    shadowTarget: T,
  ) : boolean
  {
    const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
    return this.#shadowHandler.preventExtensions(shadowTarget, nextTarget, nextHandler);
  }

  set(
    shadowTarget: T,
    p: string | symbol,
    value: unknown,
    receiver: unknown
  ) : boolean
  {
    const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
    const [nextValue, nextReceiver] = this.#targetGraph.convertArguments(value, receiver);

    return this.#shadowHandler.set(
      shadowTarget, p, value, receiver, nextTarget, nextHandler, nextValue, nextReceiver
    );
  }

  setPrototypeOf(
    shadowTarget: T,
    proto: object | null
  ) : boolean
  {
    const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
    const [nextProto] = this.#targetGraph.convertArguments(proto);

    return this.#shadowHandler.setPrototypeOf(
      shadowTarget, proto, nextTarget, nextHandler, nextProto as object | null
    );
  }
}
