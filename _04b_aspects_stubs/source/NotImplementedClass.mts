//#region preamble
import path from "path";

import {
  SourceFile,
} from "ts-morph";

import {
  ModuleSourceDirectory,
  pathToModule,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import {
  ClassDeclarationImpl,
  GetAccessorDeclarationImpl,
  ImportDeclarationImpl,
  ImportSpecifierImpl,
  LiteralTypedStructureImpl,
  ParameterDeclarationImpl,
  SetAccessorDeclarationImpl,
  SourceFileImpl,
} from "#ts-morph_structures/exports.mjs";

import ClassStubBuilder from "./ClassStubBuilder.mjs";
//#endregion preamble

export default async function NotImplementedStub(
  pathToSourceFile: string,
  isAbsoluteSourcePath: boolean,
  stubBuilder: ClassStubBuilder,
  stubClass: ClassDeclarationImpl,
  destinationDirectory: ModuleSourceDirectory,
  destinationPath: string,
): Promise<void>
{
  stubClass = ClassDeclarationImpl.clone(stubClass);
  stubClass.name! += "_NotImplemented";

  stubClass.isDefaultExport = true;

  stubClass.methods.forEach(method => {
    method.parameters.forEach(param => {
      method.statements.push(`void(${param.name});`);
    });

    method.statements.push(`throw new Error("not implemented");`);
  });

  const properties = stubClass.properties.splice(0, Infinity);
  properties.forEach(prop => {
    const getter = new GetAccessorDeclarationImpl(prop.name);
    getter.returnTypeStructure = new LiteralTypedStructureImpl("never");
    getter.statements.push(`throw new Error("not implemented");`);
    stubClass.getAccessors.push(getter);

    if (prop.isReadonly) {
      return;
    }

    const setter = new SetAccessorDeclarationImpl(prop.name);
    const setterParameter = new ParameterDeclarationImpl("value");
    if (prop.typeStructure)
      setterParameter.typeStructure = prop.typeStructure;
    setter.parameters.push(setterParameter);
    setter.statements.push("void(value);");
    setter.statements.push(`throw new Error("not implemented");`);
    stubClass.setAccessors.push(setter);
  });

  const pathToTargetFile = pathToModule(destinationDirectory, destinationPath);

  const importDecl = new ImportDeclarationImpl(
    isAbsoluteSourcePath ? pathToSourceFile : path.relative(pathToTargetFile, pathToSourceFile)
  );
  importDecl.namedImports.push(
    new ImportSpecifierImpl(stubBuilder.interfaceOrAliasName)
  );
  importDecl.isTypeOnly = true;

  const targetFileDecl = new SourceFileImpl;
  targetFileDecl.leadingTrivia.push("// This file is generated.  Do not edit.");
  targetFileDecl.statements.push(importDecl, stubClass);

  const targetFile: SourceFile = stubBuilder.sourceFile.getProject().createSourceFile(
    pathToTargetFile, targetFileDecl
  );
  targetFile.fixMissingImports();

  await targetFile.save();
}
