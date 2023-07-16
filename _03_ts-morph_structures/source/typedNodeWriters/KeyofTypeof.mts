import type {
  TypedNodeWriter
} from "../types/ts-morph-typednodewriter.mjs";
import ChildrenWriter from "./ChildrenWriter.mjs";

export default class KeyofTypeofWriter extends ChildrenWriter
{
  readonly #isKeyOf: boolean;
  readonly #isTypeOf: boolean;

  public get prefix(): string {
    let prefix = "";
    if (this.#isKeyOf)
      prefix += "keyof ";
    if (this.#isTypeOf)
      prefix += "typeof ";
    return prefix;
  }

  public readonly postfix = "";
  public readonly joinCharacters = "";
  public readonly children: [TypedNodeWriter];

  constructor(
    isKeyOf: boolean,
    isTypeOf: boolean,
    childWriter: TypedNodeWriter
  )
  {
    super();

    if (!isKeyOf && !isTypeOf)
      throw new Error("You must set isKeyOf or isTypeOf");

    this.#isKeyOf = isKeyOf
    this.#isTypeOf = isTypeOf;
    this.children = [childWriter];
  }
}
