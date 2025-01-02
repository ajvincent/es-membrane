import assert from "node:assert/strict";

import {
  StructureKind
} from "ts-morph";

import {
  InterfaceDeclarationImpl,
  LiteralTypeStructureImpl,
  TypeStructureKind,
  VoidTypeNodeToTypeStructureConsole,
  getTypeAugmentedStructure,
} from "#stage_two/snapshot/source/exports.js";

import {
  addAndFlattenInterface
} from "./FlatInterfaceMap.js";

import TS_MORPH_D from "#utilities/source/ts-morph-d-file.js";

const InterfaceMapInternal = new Map<string, InterfaceDeclarationImpl>;

const InterfaceMap: Map<string, InterfaceDeclarationImpl> = InterfaceMapInternal;
export default InterfaceMap;

export function requireInterface(
  name: string
): InterfaceDeclarationImpl
{
  if (!InterfaceMapInternal.has(name)) {
    const node = TS_MORPH_D.getInterfaceOrThrow(name);
    const structure = getTypeAugmentedStructure(
      node, VoidTypeNodeToTypeStructureConsole, true, StructureKind.Interface
    ).rootStructure;
    InterfaceMapInternal.set(name, structure);

    InterfaceMap.get(name)!.extendsSet.forEach(typeStructure => {
      if (typeStructure.kind === TypeStructureKind.TypeArgumented) {
        assert.equal(typeStructure.objectType, LiteralTypeStructureImpl.get("KindedStructure"));
        typeStructure = typeStructure.childTypes[0];

        assert.equal(typeStructure.kind, TypeStructureKind.QualifiedName);
        assert.equal(typeStructure.childTypes[0], "StructureKind");
        return;
      }

      assert.equal(
        typeStructure.kind,
        TypeStructureKind.Literal,
        `for name ${name} found kind ${TypeStructureKind[typeStructure.kind]}`
      );
      try {
        requireInterface(typeStructure.stringValue);
      }
      catch (ex) {
        console.error("failed for original name " + name);
        throw ex;
      }
    });

    addAndFlattenInterface(structure);
  }
  return InterfaceMap.get(name)!;
}
