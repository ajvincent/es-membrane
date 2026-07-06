import {
  UnionTypeStructureImpl,
  LiteralTypeStructureImpl
} from "ts-morph-structures";

const UnionStringOrSymbol = new UnionTypeStructureImpl([
  LiteralTypeStructureImpl.get("string"),
  LiteralTypeStructureImpl.get("symbol"),
]);

export default UnionStringOrSymbol;
