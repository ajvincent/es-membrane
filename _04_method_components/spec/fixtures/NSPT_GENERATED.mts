import type {
  PassThroughType,
  ReturnOrPassThroughType,
  ComponentPassThroughClass,
  ComponentPassThroughMap,
} from "../../source/PassThroughSupport.mjs";

import {
  ForwardTo_Base,
  MultiDriver_Base,
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

export class NumberStringType_Driver
       extends MultiDriver_Base<NumberStringType>
       implements ComponentPassThroughClass<NumberStringType>
{
  static build(
    symbolKey: string,
    subkeys: (string | symbol)[],
    map: ComponentPassThroughMap<NumberStringType>
  ) : symbol
  {
    const key = Symbol(symbolKey);
    void(new NumberStringType_Driver(key, subkeys, map));
    return key;
  }

  repeatBack(
    __previousResults__: PassThroughType<NumberStringType["repeatBack"]>,
    ...__args__: Parameters<NumberStringType["repeatBack"]>
  ): ReturnOrPassThroughType<NumberStringType["repeatBack"]>
  {
    return this[INVOKE_SYMBOL]<NumberStringType["repeatBack"]>(
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
    return this[INVOKE_SYMBOL]<NumberStringType["repeatForward"]>(
      "repeatForward",
      __previousResults__,
      __args__
    );
  }
}
