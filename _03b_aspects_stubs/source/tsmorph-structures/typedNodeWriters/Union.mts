import ChildrenWriter from "./ChildrenWriter.mjs";

export default class UnionWriter extends ChildrenWriter {
  public readonly prefix = "";
  public readonly postfix = "";
  public readonly joinCharacters = " | ";
}
