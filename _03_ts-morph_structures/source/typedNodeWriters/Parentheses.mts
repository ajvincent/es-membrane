import type {
  TypedNodeWriter
} from "../types/ts-morph-typednodewriter.mjs";
import ChildrenWriter from "./ChildrenWriter.mjs";

export default class ParenthesesWriter extends ChildrenWriter
{
  public readonly prefix = "(";
  public readonly postfix = ")";
  public readonly joinCharacters = "";
  public readonly children: [TypedNodeWriter];

  constructor(childWriter: TypedNodeWriter) {
    super();
    this.children = [childWriter];
  }
}
