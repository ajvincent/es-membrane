import ChildrenWriter from "./ChildrenWriter.mjs";

export default class TupleWriter extends ChildrenWriter
{
  public readonly prefix = "[";
  public readonly postfix = "]";
  public readonly joinCharacters = ", ";
}
