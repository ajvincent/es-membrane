import { InterfaceDeclarationImpl } from "ts-morph-structures";
import getLibraryInterface from "./fromTypeScriptLib.js";

const ProxyHandlerInterface = getLibraryInterface("ProxyHandler");
export default function getProxyHandlerInterface(): InterfaceDeclarationImpl {
  return InterfaceDeclarationImpl.clone(ProxyHandlerInterface);
};
