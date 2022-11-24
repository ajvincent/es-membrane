import {
  INVOKE_SYMBOL,
} from "../../source/exports/Common.mjs";

import Entry_Base from "./Entry_Base.mjs";

import type {
  NumberStringType
} from "../NumberStringType.mjs";

export default class NumberString_EntryBase
               extends Entry_Base<NumberStringType, NumberStringType>
               implements NumberStringType
{
  repeatForward(s: string, n: number): string
  {
    return this[INVOKE_SYMBOL]<
      NumberStringType["repeatForward"]
    >
    (
      "repeatForward",
      [s, n]
    );
  }

  repeatBack(n: number, s: string): string
  {
    return this[INVOKE_SYMBOL]<
      NumberStringType["repeatBack"]
    >
    (
      "repeatBack",
      [n, s]
    );
  }
}
