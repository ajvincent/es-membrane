import type { AnyFunction } from "../../source/AnyFunction.mjs";

import type {
  PassThroughType,
  ReturnOrPassThroughType,
  MaybePassThrough,
  ComponentPassThroughClass,
  ComponentPassThroughMap,
} from "../../source/PassThroughSupport.mjs";
import {
  ForwardTo_Base,
  INVOKE_SYMBOL,
} from "../../source/GenerateTypedPassThrough.mjs";

import type {
  NumberStringType
} from "../../spec/fixtures/NumberStringType.mjs";

export function NumberStringType_ClassesUnderTest (
  initialTarget: string | symbol,
  passThroughMap: ComponentPassThroughMap<NumberStringType>
) : NumberStringType
{
  class NumberString_ForwardTo extends ForwardTo_Base implements NumberStringType
  {
    repeatBack(
      ...__args__: Parameters<NumberStringType["repeatBack"]>
    ): ReturnType<NumberStringType["repeatBack"]>
    {
      return this[INVOKE_SYMBOL]<
        NumberStringType["repeatBack"],
        NumberStringType
      >
      (
        initialTarget,
        passThroughMap,
        "repeatBack",
         __args__
      );
    }

    repeatForward(
      ...__args__: Parameters<NumberStringType["repeatForward"]>
    ): ReturnType<NumberStringType["repeatForward"]>
    {
      return this[INVOKE_SYMBOL]<
        NumberStringType["repeatForward"],
        NumberStringType
      >
      (
        initialTarget,
        passThroughMap,
          "repeatForward",
          __args__
        );
      }
  }

  return new NumberString_ForwardTo;
}

export class NumberStringType_Driver implements ComponentPassThroughClass<NumberStringType> {
  #subkeys: ReadonlyArray<string | symbol>;
  readonly #map: ComponentPassThroughMap<NumberStringType>;
  constructor(
    key: string | symbol,
    subkeys: (string | symbol)[],
    map: ComponentPassThroughMap<NumberStringType>
  )
  {
    this.#subkeys = subkeys;
    this.#map = map;

    map.set(key, this);
  }

  #invoke<__targetMethodType__ extends AnyFunction>(
    __methodName__: string,
    __previousResults__: PassThroughType<__targetMethodType__>,
    __args__: Parameters<__targetMethodType__>
  ): ReturnOrPassThroughType<__targetMethodType__>
  {
    for (const key of this.#subkeys)
    {
      if (!this.#map.has(key))
        throw new Error(`No component pass through for key "${String(key)}"!`);
    }

    let result: ReturnOrPassThroughType<__targetMethodType__> = __previousResults__;
    for (const key of this.#subkeys)
    {
      const entry = this.#map.get(key) as ComponentPassThroughClass<__targetMethodType__>;

      const callback = Reflect.get(entry, __methodName__) as MaybePassThrough<__targetMethodType__>;
      result = callback(__previousResults__, ...__args__);
      if (result !== __previousResults__)
        break;
    }

    return result;
  }

  repeatBack(
    __previousResults__: PassThroughType<NumberStringType["repeatBack"]>,
    ...__args__: Parameters<NumberStringType["repeatBack"]>
  ): ReturnOrPassThroughType<NumberStringType["repeatBack"]>
  {
    return this.#invoke<NumberStringType["repeatBack"]>(
      "repeatBack",
      __previousResults__,
      __args__
    );
  }

  repeatForward(
    __previousResults__: PassThroughType<NumberStringType["repeatForward"]>,
    ...__args__: Parameters<NumberStringType["repeatForward"]>
  ): string | PassThroughType<NumberStringType["repeatForward"]>
  {
    return this.#invoke<NumberStringType["repeatForward"]>(
      "repeatForward",
      __previousResults__,
      __args__
    );
  }

  static build(
    symbolKey: string,
    subkeys: (string | symbol)[],
    map: ComponentPassThroughMap<NumberStringType>
  ) : symbol
  {
    const key = Symbol(symbolKey)
    void(new NumberStringType_Driver(key, subkeys, map))
    return key;
  }
}
