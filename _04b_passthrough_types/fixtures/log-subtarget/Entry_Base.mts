import {
  INVOKE_SYMBOL,

  // types
  AnyFunction,
  PropertyKey,
} from "../../source/exports/internal/Common.mjs";

import type { ReadonlyKeyToComponentMap } from "../../source/exports/KeyToComponentMap_Base.mjs";

/**
 * The entry point from a non-augmented type into pass-through-augmented components.
 */
export default class Entry_Base<
  ClassType extends object,
  ThisClassType extends ClassType,
>
{
  readonly #extendedMap: ReadonlyKeyToComponentMap<ClassType, ThisClassType>;

  constructor(
    extendedMap: ReadonlyKeyToComponentMap<ClassType, ThisClassType>,
  )
  {
    if (new.target === Entry_Base)
      throw new Error("Do not construct this class directly: subclass it!");
    this.#extendedMap = extendedMap;
  }

  /**
   * @typeParam MethodType - The type of the original method.
   * @param methodName       - The name of the method we want to call, which we get from each component via Reflect.
   * @param initialArguments - The initial arguments to pass to the starting target.
   * @returns The original target method's type.
   */
  protected [INVOKE_SYMBOL]<
    MethodType extends AnyFunction,
  >
  (
    methodName: PropertyKey,
    initialArguments: Parameters<MethodType>
  ): ReturnType<MethodType>
  {
    const startTarget = this.#extendedMap.startComponent;
    if (!startTarget)
      throw new Error("assertion failure: we should have a start target");

    // This is safe because we're in a protected method.
    const passThrough = this.#extendedMap.buildPassThrough<MethodType>(
      this as unknown as ThisClassType,
      methodName,
      initialArguments
    );

    passThrough.callTarget(startTarget);
    const [hasReturn, result] = passThrough.getReturnValue();
    if (!hasReturn)
      throw new Error("No resolved result!");

    return result;
  }
}
