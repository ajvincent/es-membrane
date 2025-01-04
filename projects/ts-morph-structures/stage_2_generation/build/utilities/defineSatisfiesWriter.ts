// #region preamble
import {
  WriterFunction,
} from "ts-morph";

import {
  FunctionDeclarationImpl,
  LiteralTypedStructureImpl,
  TypeArgumentedTypedStructureImpl,
  TypeAliasDeclarationImpl,
} from "#stage_one/prototype-snapshot/exports.js";

import ConstantTypeStructures from "./ConstantTypeStructures.js";
// #endregion preamble

export default function defineSatisfiesWriter(
  fnDecl: FunctionDeclarationImpl,
  alias: TypeAliasDeclarationImpl,
): WriterFunction
{
  if (!fnDecl.name) {
    throw new Error("no name for function?");
  }
  if (!alias.name) {
    throw new Error("no alias name for function?");
  }

  const subclass = new TypeArgumentedTypedStructureImpl(
    ConstantTypeStructures.SubclassDecorator,
    [
      new LiteralTypedStructureImpl(alias.name),
      ConstantTypeStructures["typeof StructureBase"],
      ConstantTypeStructures.false,
    ]
  )
  return writer => {
    writer.write(fnDecl.name!);
    writer.write(" satisfies ");
    subclass.writerFunction(writer);
    writer.write(";");
  };
}
