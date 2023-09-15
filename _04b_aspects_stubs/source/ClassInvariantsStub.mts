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
//import propertyToAccessors from "./propertyToAccessors.mjs";
//#endregion preamble

export default async function ClassInvariantsStub(
  pathToSourceFile: string,
  isFinalSourcePath: boolean,
  stubBuilder: ClassStubBuilder,
  stubClass: ClassDeclarationImpl,
  destinationDirectory: ModuleSourceDirectory,
  destinationPath: string,
): Promise<void>
{
  stubClass = ClassDeclarationImpl.clone(stubClass);


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
  targetFileDecl.statements.push(importDecl);

  const targetFile: SourceFile = stubBuilder.sourceFile.getProject().createSourceFile(
    pathToTargetFile, targetFileDecl
  );
  targetFile.fixMissingImports();

  await targetFile.save();
}
