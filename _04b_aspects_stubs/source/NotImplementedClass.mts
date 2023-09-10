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
  ImportDeclarationImpl,
  ImportSpecifierImpl,
  SourceFileImpl,
} from "#ts-morph_structures/exports.mjs";

import ClassStubBuilder from "./ClassStubBuilder.mjs";
import propertyToAccessors from "./propertyToAccessors.mjs";
//#endregion preamble

export default async function NotImplementedStub(
  pathToSourceFile: string,
  isFinalSourcePath: boolean,
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
  properties.forEach(prop => propertyToAccessors(
    stubClass,
    prop,
    [
      `throw new Error("not implemented");`,
    ],
    [
      "void(value);",
      `throw new Error("not implemented");`
    ]
  ));

  const pathToTargetFile = pathToModule(destinationDirectory, destinationPath);

  const importDecl = new ImportDeclarationImpl(
    isFinalSourcePath ? pathToSourceFile : path.relative(pathToTargetFile, pathToSourceFile)
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
