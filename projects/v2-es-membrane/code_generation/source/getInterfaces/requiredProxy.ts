import {
  StructureKind
} from "ts-morph";

import {
  ArrayTypeStructureImpl,
  InterfaceDeclarationImpl,
  LiteralTypeStructureImpl,
  ParenthesesTypeStructureImpl,
  type StructureImpls,
  type TypeStructures,
  TypeStructureKind,

  forEachAugmentedStructureChild,
} from "ts-morph-structures";

import getLibraryInterface from "./fromTypeScriptLib.js";
import UnionStringOrSymbol from "../UnionStringOrSymbol.js";

const AnyLiteral = LiteralTypeStructureImpl.get("any");
const UnknownLiteral = LiteralTypeStructureImpl.get("unknown");

const requiredHandlerInterface = InterfaceDeclarationImpl.clone(
  getLibraryInterface("ProxyHandler")
);
for (const method of requiredHandlerInterface.methods) {
  method.hasQuestionToken = false;
  const targetParam = method.parameters[0];
  targetParam.typeStructure = LiteralTypeStructureImpl.get("object");

  if (method.name === "ownKeys") {
    method.returnTypeStructure = new ArrayTypeStructureImpl(
      new ParenthesesTypeStructureImpl(
        UnionStringOrSymbol
      )
    );
  }

  replaceAnyWithUnknown(method);
}

function replaceAnyWithUnknown(
  child: StructureImpls | TypeStructures
): void
{
  switch (child.kind) {
    case TypeStructureKind.Array: {
      if (child.objectType === AnyLiteral) {
        child.objectType = UnknownLiteral;
      }
      break;
    }

    case StructureKind.Parameter: {
      if (child.typeStructure === AnyLiteral) {
        child.typeStructure = UnknownLiteral;
      }
      break;
    }

    case StructureKind.MethodSignature: {
      if (child.returnTypeStructure === AnyLiteral) {
        child.returnTypeStructure = UnknownLiteral;
      }
      break;
    }
  }

  forEachAugmentedStructureChild(child, replaceAnyWithUnknown);
}

export default
function getRequiredProxyHandlerInterface(): InterfaceDeclarationImpl
{
  return InterfaceDeclarationImpl.clone(requiredHandlerInterface);
}
