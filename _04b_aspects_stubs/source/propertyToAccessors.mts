import {
  StatementStructures,
} from "ts-morph";

import {
  ClassDeclarationImpl,
  GetAccessorDeclarationImpl,
  ParameterDeclarationImpl,
  PropertyDeclarationImpl,
  SetAccessorDeclarationImpl,
} from "#ts-morph_structures/exports.mjs";

import type {
  stringOrWriterFunction
} from "#ts-morph_structures/source/types/ts-morph-native.mjs";

export default function propertyToAccessors(
  stubClass: ClassDeclarationImpl,
  property: PropertyDeclarationImpl,
  getterStatements: (stringOrWriterFunction | StatementStructures)[],
  setterStatements: (stringOrWriterFunction | StatementStructures)[],
): void
{
  const getter = new GetAccessorDeclarationImpl(property.name);
  getter.returnTypeStructure = property.typeStructure;
  getter.statements.push(...getterStatements);
  stubClass.getAccessors.push(getter);

  if (property.isReadonly)
    return;

  const setter = new SetAccessorDeclarationImpl(property.name);
  const setterParameter = new ParameterDeclarationImpl("value");
  if (property.typeStructure)
    setterParameter.typeStructure = property.typeStructure;
  setter.parameters.push(setterParameter);
  setter.statements.push(...setterStatements);
  stubClass.setAccessors.push(setter);
}
