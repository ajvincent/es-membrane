import type {
  PrefixedNumber
} from "../types/PrefixedNumber.js";

export class StringCounter<Prefix extends string>
{
  #counter = 0;

  next<SpecificPrefix extends Prefix>(prefix: SpecificPrefix): PrefixedNumber<SpecificPrefix>
  {
    return `${prefix}:${this.#counter++}`;
  }
}
