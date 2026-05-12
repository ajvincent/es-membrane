import { StructureKind } from "ts-morph";

import { GetAccessorDeclarationImpl,PropertySignatureImpl, TypeMembersMap } from "#stage_two/snapshot/source/exports.js";
import PropertyHashesWithTypes from "./classTools/PropertyHashesWithTypes.js";
import DecoratorModule from "../moduleClasses/DecoratorModule.js";
import StructureModule from "../moduleClasses/StructureModule.js";

export function * getTypeStructureNativeMembers(
  module: DecoratorModule | StructureModule,
  map: TypeMembersMap
): IterableIterator<[string, GetAccessorDeclarationImpl | PropertySignatureImpl]>
{
  for (const propOrGetter of propertyOrGetterIterator(map)) {
    if (PropertyHashesWithTypes.has(module.baseName, propOrGetter.name))
      yield [propOrGetter.name, propOrGetter];
  }
}

function * propertyOrGetterIterator(
  map: TypeMembersMap
): IterableIterator<GetAccessorDeclarationImpl | PropertySignatureImpl>
{
  yield * map.arrayOfKind(StructureKind.GetAccessor);
  yield * map.arrayOfKind(StructureKind.PropertySignature);
}
