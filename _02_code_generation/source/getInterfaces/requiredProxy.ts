import {
  ArrayTypeStructureImpl,
  InterfaceDeclarationImpl,
  LiteralTypeStructureImpl,
  ParenthesesTypeStructureImpl,
} from "ts-morph-structures";

import getLibraryInterface from "./fromTypeScriptLib.js";
import UnionStringOrSymbol from "../UnionStringOrSymbol.js";

const requiredHandlerInterface = InterfaceDeclarationImpl.clone(
  getLibraryInterface("ProxyHandler")
);
for (const method of requiredHandlerInterface.methods) {
  method.hasQuestionToken = false;
  const targetParam = method.parameters[0]!;
  targetParam.typeStructure = LiteralTypeStructureImpl.get("object");

  if (method.name === "ownKeys") {
    method.returnTypeStructure = new ArrayTypeStructureImpl(
      new ParenthesesTypeStructureImpl(
        UnionStringOrSymbol
      )
    );
  }
}

export default
function getRequiredProxyHandlerInterface(): InterfaceDeclarationImpl
{
  return InterfaceDeclarationImpl.clone(requiredHandlerInterface);
}
