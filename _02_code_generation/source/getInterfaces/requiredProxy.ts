import { InterfaceDeclarationImpl } from "ts-morph-structures";
import getLibraryInterface from "./fromTypeScriptLib.js";

const requiredHandlerInterface = InterfaceDeclarationImpl.clone(
  getLibraryInterface("ProxyHandler")
);
for (const method of requiredHandlerInterface.methods) {
  method.hasQuestionToken = false;
}

export default function getRequiredProxyHandlerInterface(): InterfaceDeclarationImpl {
  return InterfaceDeclarationImpl.clone(requiredHandlerInterface);
}
