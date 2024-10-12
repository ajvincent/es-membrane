/*
This needs to take the Required<ProxyHandler<object>> and create a modified interface with additional parameters.

- nextTarget: object
- next* parameters

The output of this module needs to be a .d.ts file.  Also, other MemberedTypeToClass code will use this interface.
*/

import path from "path";

import {
  ImportManager,
  type InterfaceDeclarationImpl,
  type MethodSignatureImpl,
  ParameterDeclarationImpl,
  SourceFileImpl,
} from "ts-morph-structures";

import {
  createSourceFileFromStructure,
} from "#stage_utilities/source/getTS_SourceFile.js";

import {
  generatedDirs
} from "./constants.js";

import getRequiredProxyHandlerInterface from "./getInterfaces/requiredProxy.js";

import UnionStringOrSymbol from "./UnionStringOrSymbol.js";

export const pathToInterfaceModule = path.join(
  generatedDirs.raw, "types/ObjectGraphHandlerIfc.d.ts"
);

export default
async function createObjectGraphHandlerIfc(): Promise<InterfaceDeclarationImpl>
{
  const importManager = new ImportManager(pathToInterfaceModule);
  importManager.addImports({
    pathToImportedModule: path.join(generatedDirs.raw, "../types/RequiredProxyHandler.d.ts"),
    isPackageImport: false,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: [
      "RequiredProxyHandler"
    ]
  });

  const ObjectGraphHandlerIfc: InterfaceDeclarationImpl = getRequiredProxyHandlerInterface();
  ObjectGraphHandlerIfc.name = "ObjectGraphHandlerIfc";
  ObjectGraphHandlerIfc.isExported = true;
  ObjectGraphHandlerIfc.typeParameters.splice(0, ObjectGraphHandlerIfc.typeParameters.length);

  const nextGraphKeyParam = new ParameterDeclarationImpl("nextGraphKey");
  nextGraphKeyParam.typeStructure = UnionStringOrSymbol;

  ObjectGraphHandlerIfc.methods.forEach((method: MethodSignatureImpl): void => {
    const addedParameters = method.parameters.map(param => {
      param = ParameterDeclarationImpl.clone(param);
      param.name = `next${(param.name[0].toUpperCase() + param.name.substring(1))}`;
      return param;
    });

    method.parameters.push(
      ParameterDeclarationImpl.clone(nextGraphKeyParam), ...addedParameters
    );

    method.parameters[0]!.name = "shadowTarget";
  });

  const sourceStructure = new SourceFileImpl();
  sourceStructure.statements.push(
    "// This file is generated.  Do not edit.",
    ...importManager.getDeclarations(),
    ObjectGraphHandlerIfc,
  );

  await createSourceFileFromStructure(
    pathToInterfaceModule,
    sourceStructure
  );

  return ObjectGraphHandlerIfc;
}
