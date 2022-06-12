import type {
  PassThroughType,
  ReturnOrPassThroughType,
  ComponentPassThroughClass,
  ComponentPassThroughMap,
} from "../../source/PassThroughSupport.mjs";

import {
  ForwardTo_Base,
  ForwardToSequence_Base,
  INVOKE_SYMBOL,
} from "../../source/GenerateTypedPassThrough.mjs";

import type {
  NumberStringType
} from "../../spec/fixtures/NumberStringType.mjs";

export class NumberString_ForwardTo
       extends ForwardTo_Base
       implements NumberStringType
{
  #initialTarget: string | symbol;
  #passThroughMap: ComponentPassThroughMap<NumberStringType>;

  constructor(
    initialTarget: string | symbol,
    passThroughMap: ComponentPassThroughMap<NumberStringType>
  )
  {
    super();
    this.#initialTarget = initialTarget;
    this.#passThroughMap = passThroughMap;
  }

  repeatBack(
    ...__args__: Parameters<NumberStringType["repeatBack"]>
  ): ReturnType<NumberStringType["repeatBack"]>
  {
    return this[INVOKE_SYMBOL]<
      NumberStringType["repeatBack"],
      NumberStringType
    >
    (
      this.#initialTarget,
      this.#passThroughMap,
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
      this.#initialTarget,
      this.#passThroughMap,
        "repeatForward",
        __args__
    );
  }
}

export class NumberStringType_Sequence
       extends ForwardToSequence_Base<NumberStringType>
       implements ComponentPassThroughClass<NumberStringType>
{
  repeatBack(
    __previousResults__: PassThroughType<NumberStringType["repeatBack"]>,
    ...__args__: Parameters<NumberStringType["repeatBack"]>
  ): ReturnOrPassThroughType<NumberStringType["repeatBack"]>
  {
    void(__args__);
    return this[INVOKE_SYMBOL]<NumberStringType["repeatBack"]>(
      "repeatBack",
      __previousResults__
    );
  }

  repeatForward(
    __previousResults__: PassThroughType<NumberStringType["repeatForward"]>,
    ...__args__: Parameters<NumberStringType["repeatForward"]>
  ): string | PassThroughType<NumberStringType["repeatForward"]>
  {
    void(__args__);
    return this[INVOKE_SYMBOL]<NumberStringType["repeatForward"]>(
      "repeatForward",
      __previousResults__
    );
  }
}
