import assert from "node:assert/strict";

import {
  StructureKind,
  VariableDeclarationKind
} from "ts-morph";

import {
  type AccessorMirrorGetter,
  type ConstructorBodyStatementsGetter,
  ClassSupportsStatementsFlags,
  TypeStructureKind,
  type MemberedStatementsKey,
  type stringWriterOrStatementImpl,
  VariableStatementImpl,
  VariableDeclarationImpl,
  ArrayTypeStructureImpl,
  LiteralTypeStructureImpl,
} from "#stage_two/snapshot/source/exports.js";

import {
  BaseClassModule
} from "../../../moduleClasses/exports.js";

import PropertyHashesWithTypes from "../../classTools/PropertyHashesWithTypes.js";
import StatementGetterBase from "../GetterBase.js";

import {
  DefineMirrorAccessor
} from "../../../pseudoExpressions/statements/DefineMirrorAccessor.js";

export default
class TypeArrayStatements extends StatementGetterBase
implements AccessorMirrorGetter, ConstructorBodyStatementsGetter
{
  constructor(
    module: BaseClassModule,
  )
  {
    super(
      module,
      "TypeArrayStatements",
      ClassSupportsStatementsFlags.AccessorMirror |
      ClassSupportsStatementsFlags.ConstructorBodyStatements
    );
  }

  filterAccessorMirror(key: MemberedStatementsKey): boolean {
    if (key.fieldType?.kind !== StructureKind.GetAccessor)
      return false;
    if (key.fieldType.returnTypeStructure?.kind !== TypeStructureKind.Array)
      return false;
    return PropertyHashesWithTypes.has(this.module.baseName, key.fieldType.name);
  }

  getAccessorMirror(
    key: MemberedStatementsKey
  ): stringWriterOrStatementImpl
  {
    void key;
    return "[]";
  }

  filterCtorBodyStatements(
    key: MemberedStatementsKey
  ): boolean
  {
    if (key.fieldType?.kind !== StructureKind.GetAccessor)
      return false;
    if (key.fieldType.returnTypeStructure?.kind !== TypeStructureKind.Array)
      return false;

    return PropertyHashesWithTypes.has(this.module.baseName, key.fieldType.name);
  }

  getCtorBodyStatements(
    key: MemberedStatementsKey
  ): readonly stringWriterOrStatementImpl[]
  {
    /*
    // implements is getting lost in ts-morph clone operations
    const implementsProxyArray: stringOrWriterFunction[] =
      this.#implementsProxyArray;
    Reflect.defineProperty(this, "implements", {
      configurable: false,
      enumerable: true,
      get: function (): stringOrWriterFunction[] {
        return implementsProxyArray;
      },
    });
    */
    assert(key.fieldType?.kind === StructureKind.GetAccessor);
    const propKey = key.fieldType.name;

    const constStatement = new VariableStatementImpl();
    constStatement.declarationKind = VariableDeclarationKind.Const;
    const closureIdentifier = propKey + "ProxyArray";

    const propTypeStructure = new ArrayTypeStructureImpl(
      LiteralTypeStructureImpl.get("stringOrWriterFunction")
    );

    {
      const implementsProxyArray = new VariableDeclarationImpl(closureIdentifier);
      implementsProxyArray.initializer = `this.#${propKey}ProxyArray`;
      implementsProxyArray.typeStructure = propTypeStructure;
      constStatement.declarations.push(implementsProxyArray);

      constStatement.leadingTrivia.push(
        `// ${propKey} is getting lost in ts-morph clone operations\n`
      );
    }

    const defineProp = new DefineMirrorAccessor(
      propKey,
      propTypeStructure,
      closureIdentifier,
      false,
      true,
      true,
      false
    );

    return [
      constStatement, defineProp.writerFunction
    ];
  }
}
