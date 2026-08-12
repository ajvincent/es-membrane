import assert from "node:assert/strict";

import {
  InterfaceDeclarationImpl,
  LiteralTypeStructureImpl,
  PropertySignatureImpl,
  TypeStructureKind
} from "#stage_two/snapshot/source/exports.js";

const FlatInterfaceMapInternal = new Map<string, InterfaceDeclarationImpl>;

const FlatInterfaceMap: ReadonlyMap<string, InterfaceDeclarationImpl> = FlatInterfaceMapInternal;
export default FlatInterfaceMap;

export function addAndFlattenInterface(
  _interface: InterfaceDeclarationImpl
): void
{
  _interface = InterfaceDeclarationImpl.clone(_interface);
  FlatInterfaceMapInternal.set(_interface.name, _interface);
  for (let typeStructure of _interface.extendsSet) {
    if (typeStructure.kind === TypeStructureKind.TypeArgumented) {
      assert.equal(typeStructure.objectType, LiteralTypeStructureImpl.get("KindedStructure"));
      typeStructure = typeStructure.childTypes[0];

      assert.equal(typeStructure.kind, TypeStructureKind.QualifiedName);
      assert.equal(typeStructure.childTypes[0], "StructureKind");

      const kindProperty = new PropertySignatureImpl("kind");
      kindProperty.typeStructure = typeStructure;
      _interface.properties.push(kindProperty);
      continue;
    }

    assert.equal(typeStructure.kind, TypeStructureKind.Literal);
    const { properties } = FlatInterfaceMap.get(typeStructure.stringValue)!;
    _interface.properties.push(...properties);
  }

  _interface.extendsSet.clear();
  _interface.properties.sort((a, b) => a.name.localeCompare(b.name));
}
