import assert from "node:assert/strict";

import {
  StructureKind
} from "ts-morph";

import {
  InterfaceDeclarationImpl,
  TypeStructureKind,
} from "#stage_two/snapshot/source/exports.js";

import {
  PromiseAllParallel,
} from "#utilities/source/PromiseTypes.js";

import {
  getClassInterfaceName,
} from "#utilities/source/StructureNameTransforms.js";

import {
  addImportsToModule,
  InterfaceModule,
  publicExports,
} from "../../moduleClasses/exports.js";

import InterfaceMap from "../../vanilla/InterfaceMap.js";

import consolidateNameDecorators from "./consolidateNameDecorators.js";
import consolidateScopeDecorators from "./consolidateScopeDecorators.js";
import mergeInterfaces from "./mergeInterfaces.js";
import setHasQuestionToken from "./setHasQuestionToken.js";
import tightenPropertyType from "./tightenPropertyType.js";
import addTypeStructures from "./addTypeStructures.js";

export default async function createInterfaces(
  structureNames: readonly string[]
): Promise<void>
{
  /* Here's what we have to do.
  (1) Create the structure interfaces.
  (2) Determine which decorator interfaces we need.
  (3) Create the decorator interfaces.
  (4) Consolidate decorator interfaces into structures as necessary.
  (5) Convert structure members' types to the desired format.
  */

  const decoratorNamesUnordered: string[] = [];
  for (const name of structureNames) {
    createStructureInterface(name);
    const module = InterfaceModule.structuresMap.get(
      getClassInterfaceName(name)
    )!
    decoratorNamesUnordered.push(...module.extendsSet);
  }

  const decoratorNames = new Set<string>(decoratorNamesUnordered);
  for (const name of decoratorNames) {
    createDecoratorInterface(name, decoratorNames);
  }

  consolidateNameDecorators();
  consolidateScopeDecorators();
  mergeInterfaces();

  const modules = [
    ...InterfaceModule.structuresMap.values(),
    ...InterfaceModule.decoratorsMap.values()
  ];
  modules.forEach(addTypeStructures);
  modules.forEach(defineImportsForModule);
  modules.forEach(definePublicExport);
  await PromiseAllParallel(modules, module => module.saveFile());

  InterfaceModule.structuresMap.forEach((baseModule: InterfaceModule, key: string): void => {
    const typeMembers = baseModule.typeMembers.clone();
    InterfaceModule.flatTypesMap.set(key, typeMembers);

    baseModule.extendsSet.forEach(extendsName => {
      typeMembers.addMembers(Array.from(
        InterfaceModule.decoratorsMap.get(getClassInterfaceName(extendsName))!.typeMembers.values()
      ));
    });
  });
}

function createStructureInterface(
  name: string,
): void
{
  const module = new InterfaceModule(
    getClassInterfaceName(name),
  );

  addInterface(name, module);
  if (name === "SourceFileStructure")
    module.structureKindName = "SourceFile";
  else
    assert(module.structureKindName, "structure kind name not found for " + name);

  InterfaceModule.structuresMap.set(
    module.defaultExportName, module
  );

  tightenTypeMembers(module);
}

function createDecoratorInterface(
  name: string,
  decoratorNames: Set<string>,
): void
{
  const module = new InterfaceModule(
    getClassInterfaceName(name),
  );

  addInterface(name, module);
  module.extendsSet.forEach(
    extendName => decoratorNames.add(extendName)
  );

  InterfaceModule.decoratorsMap.set(
    module.defaultExportName, module
  );

  tightenTypeMembers(module);
}

function addInterface(
  name: string,
  module: InterfaceModule,
): void
{
  const structureInterface = InterfaceDeclarationImpl.clone(
    InterfaceMap.get(name)!
  );

  for (const extendsValue of structureInterface.extendsSet) {
    const { kind } = extendsValue;
    assert(kind === TypeStructureKind.Literal || kind === TypeStructureKind.TypeArgumented);
    if (kind === TypeStructureKind.Literal) {
      const id = extendsValue.stringValue;
      if (id.endsWith("SpecificStructure") || id.endsWith("BaseStructure")) {
        addInterface(id, module);
      } else {
        module.extendsSet.add(extendsValue.stringValue);
      }
    }
    else {
      assert.equal(extendsValue.objectType.kind, TypeStructureKind.Literal);
      assert.equal(extendsValue.objectType.stringValue, "KindedStructure");

      const kindedName = extendsValue.childTypes[0];
      assert.equal(kindedName.kind, TypeStructureKind.QualifiedName);
      assert.equal(kindedName.childTypes[0], "StructureKind");
      assert.equal(kindedName.childTypes.length, 2);

      module.structureKindName = kindedName.childTypes[1];
    }
  }

  module.typeMembers.addMembers(structureInterface.properties);
}

function tightenTypeMembers(
  module: InterfaceModule
): void
{
  module.typeMembers.arrayOfKind(StructureKind.PropertySignature).forEach(
    property => {
      property.typeStructure = tightenPropertyType(property.typeStructure!);
      setHasQuestionToken(module, property);

      if ((property.typeStructure.kind === TypeStructureKind.Array) && !property.hasQuestionToken)
        property.isReadonly = true;
    }
  );
}

function defineImportsForModule(
  module: InterfaceModule
): void
{
  module.typeMembers.arrayOfKind(StructureKind.PropertySignature).forEach(
    property => addImportsToModule(module, property.typeStructure!)
  );
}

function definePublicExport(
  module: InterfaceModule
): void
{
  publicExports.addExports({
    pathToExportedModule: module.importManager.absolutePathToModule,
    isDefaultExport: false,
    isType: true,
    exportNames: [module.defaultExportName]
  });
}
