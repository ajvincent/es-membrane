import {
  InterfaceDeclarationImpl,
  LiteralTypeStructureImpl,
} from "ts-morph-structures";

import getLibraryInterface from "./fromTypeScriptLib.js";

const requiredHandlerInterface = InterfaceDeclarationImpl.clone(
  getLibraryInterface("ProxyHandler")
);
for (const method of requiredHandlerInterface.methods) {
  method.hasQuestionToken = false;
  const targetParam = method.parameters[0]!;
  targetParam.typeStructure = LiteralTypeStructureImpl.get("object");
}

export default
function getRequiredProxyHandlerInterface(): InterfaceDeclarationImpl
{
  return InterfaceDeclarationImpl.clone(requiredHandlerInterface);
}
