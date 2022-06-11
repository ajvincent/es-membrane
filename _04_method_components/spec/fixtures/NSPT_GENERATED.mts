// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

import type {
  PassThroughType,
  ReturnOrPassThroughType,
  MaybePassThrough,
  ComponentPassThroughClass,
  ComponentPassThroughMap,
} from "../../source/PassThroughSupport.mjs";
import {
  PassThroughArgument,
} from "../../source/PassThroughSupport.mjs";

import type {
  NumberStringType
} from "../../spec/fixtures/NumberStringType.mjs";

export function NumberStringType_ClassesUnderTest (
  initialTarget: string | symbol,
  passThroughMap: ComponentPassThroughMap<NumberStringType>
) : NumberStringType
{
  class NumberString_ForwardTo implements NumberStringType
  {
    #invoke<__targetMethodType__ extends AnyFunction>(
      __methodName__: string,
      __args__: Parameters<__targetMethodType__>
    ): ReturnType<__targetMethodType__>
    {
      type __passThroughType__ = PassThroughType<__targetMethodType__>;
      type __maybePassThroughType__ = MaybePassThrough<__targetMethodType__>;
      type __returnOrPassThroughType__ = ReturnOrPassThroughType<__targetMethodType__>;

      const __keyAndCallbackArray__: [string | symbol, __maybePassThroughType__][] = [];

      passThroughMap.forEach((component, key) => {
        const __method__ = Reflect.get(component, __methodName__) as __maybePassThroughType__;
        const __callback__ = (
          __passThrough__: __passThroughType__,
          ...__args__: Parameters<__targetMethodType__>
        ): __returnOrPassThroughType__ =>
        {
          return __method__.apply(component, [__passThrough__, ...__args__]);
        };
        __keyAndCallbackArray__.push([key, __callback__]);
      });

      if (!passThroughMap.has(initialTarget)) {
        throw new Error("No initial target?");
      }

      const __passThrough__ = new PassThroughArgument<__targetMethodType__>(
        initialTarget, __keyAndCallbackArray__, __args__
      )

      return __passThrough__.run();
    }

    repeatBack(
      ...__args__: Parameters<NumberStringType["repeatBack"]>
    ): ReturnType<NumberStringType["repeatBack"]>
    {
      return this.#invoke<NumberStringType["repeatBack"]>("repeatBack", __args__);
    }

    repeatForward(
      ...__args__: Parameters<NumberStringType["repeatForward"]>
    ): ReturnType<NumberStringType["repeatForward"]>
    {
      return this.#invoke<NumberStringType["repeatForward"]>("repeatForward", __args__);
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
