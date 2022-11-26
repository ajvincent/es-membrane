import type { NumberStringType } from "../build/NumberStringType.mjs";
import type {
  PassThroughClassType,
  PassThroughArgumentType
} from "../generated/PassThroughClassType.mjs";

type Call = {
  readonly methodName: string;
  readonly arguments: unknown[];
  returnValue?: unknown,
  exception?: unknown
};

export default class NumberStringClass_Spy
  implements PassThroughClassType
{
  #target: PassThroughClassType;

  #calls: Call[] = [];
  get calls() : ReadonlyArray<Call>
  {
    return this.#calls;
  }

  constructor(target: PassThroughClassType) {
    this.#target = target;
  }

  repeatForward(
    __passThrough__: PassThroughArgumentType<NumberStringType["repeatForward"]>,
    s: string,
    n: number,
  ): void
  {
    const call: Call = { methodName: "repeatForward", arguments: [s, n]};
    this.#calls.push(call);
    try {
      this.#target.repeatForward(__passThrough__, s, n);
      call.returnValue = __passThrough__.getReturnValue()[1];
    }
    catch (ex) {
      call.exception = ex;
    }
  }

  repeatBack(
    __passThrough__: PassThroughArgumentType<NumberStringType["repeatBack"]>,
    n: number,
    s: string
  ): void
  {
    const call: Call = { methodName: "repeatBack", arguments: [n, s]};
    this.#calls.push(call);
    try {
      this.#target.repeatBack(__passThrough__, n, s);
      call.returnValue = __passThrough__.getReturnValue()[1];
    }
    catch (ex) {
      call.exception = ex;
    }
  }
}
