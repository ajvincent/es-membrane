// #region preamble
import {
  ClassDeclarationImpl,
  FunctionDeclarationImpl,
  IndexedAccessTypedStructureImpl,
  LiteralTypedStructureImpl,
  ParameterDeclarationImpl,
  TypeArgumentedTypedStructureImpl,
  TypeAliasDeclarationImpl,
} from "#stage_one/prototype-snapshot/exports.js";

import {
  getStructureMixinName,
} from "#utilities/source/StructureNameTransforms.js";

import type {
  DecoratorImplMeta
} from "../structureMeta/DataClasses.js";

import ConstantTypeStructures from "./ConstantTypeStructures.js";

// #endregion preamble

export default function defineDecoratorWrapper(
  meta: DecoratorImplMeta,
  classDecl: ClassDeclarationImpl,
  alias: TypeAliasDeclarationImpl
): FunctionDeclarationImpl
{
  const fnDecl = new FunctionDeclarationImpl;
  fnDecl.name = getStructureMixinName(meta.structureName);
  fnDecl.isDefaultExport = true;

  const baseClassParam = new ParameterDeclarationImpl("baseClass");
  baseClassParam.typeStructure = ConstantTypeStructures["typeof StructureBase"];

  const contextParam = new ParameterDeclarationImpl("context");
  contextParam.typeStructure = ConstantTypeStructures.ClassDecoratorContext;

  const aliasName = new LiteralTypedStructureImpl(alias.name);

  fnDecl.parameters.push(baseClassParam, contextParam);
  fnDecl.returnTypeStructure = new TypeArgumentedTypedStructureImpl(
    ConstantTypeStructures.MixinClass,
    [
      new IndexedAccessTypedStructureImpl(
        aliasName,
        ConstantTypeStructures.staticFields
      ),
      new IndexedAccessTypedStructureImpl(
        aliasName,
        ConstantTypeStructures.instanceFields
      ),
      baseClassParam.typeStructure
    ]
  );

  fnDecl.statements.push(
    "void(context);",
    classDecl,
    "return " + classDecl.name + ";",
  );

  return fnDecl;
}
