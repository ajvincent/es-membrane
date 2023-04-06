import type { propertyKey } from "./publicUtilities.mjs";
import type {
  ShadowProxyHandler,
  RequiredHandler,
} from "./ShadowProxyHandler.mjs";
import type { ObjectGraphStub } from "./ObjectGraphStub.mjs";

type NextTargetAndHandler = {
  nextTarget: object,
  nextHandler: RequiredHandler;
}

/**
 * @remarks
 * `ShadowHeadHandler` converts from `Required<ProxyHandler<T>>` to `ShadowProxyHandler<T>`, with the
 * assistance of two `ObjectGraphStub` instances to (maybe) convert arguments from one object graph to
 * another.
 */
export default class ShadowHeadHandler implements RequiredHandler
{
  readonly #shadowHandler: ShadowProxyHandler;
  readonly #currentGraph: ObjectGraphStub;
  readonly #targetGraph: ObjectGraphStub;

  constructor(
    shadowHandler: ShadowProxyHandler,
    currentGraph: ObjectGraphStub,
    targetGraph: ObjectGraphStub,
  )
  {
    this.#shadowHandler = shadowHandler;
    this.#currentGraph = currentGraph;
    this.#targetGraph = targetGraph;
  }

  #nextTargetAndHandler(shadowTarget: object) : NextTargetAndHandler
  {
    const nextTarget  = this.#targetGraph.getNextTargetForShadow(shadowTarget);
    const nextHandler = this.#targetGraph.getHandlerForTarget(nextTarget);

    return { nextTarget, nextHandler };
  }

  apply
  (
    shadowTarget: object,
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
    shadowTarget: object,
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
    shadowTarget: object,
    p: propertyKey,
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
    shadowTarget: object,
    p: propertyKey
  ) : boolean
  {
    const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
    return this.#shadowHandler.deleteProperty(shadowTarget, p, nextTarget, nextHandler);
  }

  get(
    shadowTarget: object,
    p: propertyKey,
    receiver: unknown
  ) : unknown
  {
    const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
    const [nextReceiver] = this.#targetGraph.convertArguments(receiver);

    const result = this.#shadowHandler.get(
      shadowTarget, p, receiver, nextTarget, nextHandler, nextReceiver
    )

    return this.#currentGraph.convertArguments(result)[0];
  }

  getOwnPropertyDescriptor(
    shadowTarget: object,
    p: propertyKey
  ) : PropertyDescriptor | undefined
  {
    const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
    const desc = this.#shadowHandler.getOwnPropertyDescriptor(
      shadowTarget, p, nextTarget, nextHandler
    );

    return desc ? this.#currentGraph.convertDescriptor(desc) : desc;
  }

  getPrototypeOf(
    shadowTarget: object,
  ) : object | null
  {
    const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
    const proto = this.#shadowHandler.getPrototypeOf(
      shadowTarget, nextTarget, nextHandler
    );

    return this.#currentGraph.convertArguments(proto)[0] as object | null
  }

  has(
    shadowTarget: object,
    p: propertyKey
  ) : boolean
  {
    const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
    return this.#shadowHandler.has(shadowTarget, p, nextTarget, nextHandler);
  }

  isExtensible(
    shadowTarget: object,
  ) : boolean
  {
    const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
    return this.#shadowHandler.isExtensible(shadowTarget, nextTarget, nextHandler);
  }

  ownKeys(shadowTarget: object) : ArrayLike<propertyKey>
  {
    const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
    return this.#shadowHandler.ownKeys(shadowTarget, nextTarget, nextHandler);
  }

  preventExtensions(
    shadowTarget: object,
  ) : boolean
  {
    const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
    return this.#shadowHandler.preventExtensions(shadowTarget, nextTarget, nextHandler);
  }

  set(
    shadowTarget: object,
    p: propertyKey,
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
    shadowTarget: object,
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
