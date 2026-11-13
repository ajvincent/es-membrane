import assert from "node:assert/strict";

import {
  FunctionDeclarationImpl,
  InterfaceDeclarationImpl,
  LiteralTypeStructureImpl,
  ParameterDeclarationImpl,
  type PropertySignatureImpl,
  SourceFileImpl,
  TypePredicateTypeStructureImpl,
  TypeStructureKind,
  type UnionTypeStructureImpl,
} from "#stage_two/snapshot/source/exports.js";

import {
  getStructureNameFromModified,
} from "#utilities/source/StructureNameTransforms.js";

import BlockStatementImpl from "../pseudoExpressions/statements/BlockStatement.js";

import BaseModule from "./BaseModule.js";

import FlatInterfaceMap from "../vanilla/FlatInterfaceMap.js";
import UnionModule from "./UnionModule.js";

export class IsStructureOfType_Module extends BaseModule {
  constructor() {
    super("source/structures/standard", "isStructureOfType", false);
  }

  protected getSourceFileImpl(): SourceFileImpl {
    const sourceFile = new SourceFileImpl;

    this.addImports("ts-morph", ["StructureKind"], []);

    const isStructureFunctions: FunctionDeclarationImpl[] = [];
    for (const typeAlias of UnionModule.aliases.values()) {
      if (typeAlias.name === "StructureImpls")
        continue;
      if (typeAlias.typeStructure.kind === TypeStructureKind.Union && typeAlias.typeStructure.childTypes.length > 1) {
        isStructureFunctions.push(this.#getFunction(typeAlias.name, typeAlias.typeStructure));
      }
    }

    isStructureFunctions.sort((a, b) => a.name!.localeCompare(b.name!));

    sourceFile.statements.push(
      ...this.importManager.getDeclarations(),
      ...isStructureFunctions
    );
    return sourceFile;
  }

  #getFunction(aliasName: string, typeUnion: UnionTypeStructureImpl): FunctionDeclarationImpl {
    this.addImports("public", [], ["StructureImpls", aliasName]);

    const fnDecl = new FunctionDeclarationImpl();
    fnDecl.name = "is" + getStructureNameFromModified(aliasName).replace(/s$/, "");
    fnDecl.returnTypeStructure = new TypePredicateTypeStructureImpl(
      false, LiteralTypeStructureImpl.get("structure"), LiteralTypeStructureImpl.get(aliasName)
    );
    fnDecl.isExported = true;

    const param = new ParameterDeclarationImpl("structure");
    param.typeStructure = LiteralTypeStructureImpl.get("StructureImpls");
    fnDecl.parameters.push(param);

    const block = new BlockStatementImpl("switch (structure.kind)", [
      ...this.#getCases(typeUnion),
      "return true;"
    ]);
    fnDecl.statements.push(block.writerFunction, "return false;");

    return fnDecl;
  }

  * #getCases(typeUnion: UnionTypeStructureImpl): IterableIterator<string> {
    for (const innerType of typeUnion.childTypes) {
      assert(innerType.kind === TypeStructureKind.Literal, "Expected literal type for " + JSON.stringify(typeUnion));
      const name: string = getStructureNameFromModified(innerType.stringValue);

      const ifc = FlatInterfaceMap.get(name);
      assert(ifc, "missing interface for " + name);
      yield `case StructureKind.${this.#getKind(ifc)}:`;
    }
  }

  #getKind(ifc: InterfaceDeclarationImpl): string {
    const prop: PropertySignatureImpl | undefined = ifc.properties.find(
      p => p.name === "kind"
    );
    assert(prop, "kind property signature not found");

    const { typeStructure } = prop;
    assert.equal(typeStructure?.kind, TypeStructureKind.QualifiedName);
    assert.equal(typeStructure.childTypes[0], "StructureKind");
    return typeStructure.childTypes[1];
  }
}
