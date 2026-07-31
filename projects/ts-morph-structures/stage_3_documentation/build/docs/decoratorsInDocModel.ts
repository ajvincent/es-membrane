//#region preamble
import fs from "fs/promises";
import path from "path";

import {
  ModuleKind,
  ModuleResolutionKind,
  Project,
  type ProjectOptions,
  ScriptTarget,
  SourceFile,
  StructureKind,
  TypeNode,
  ImportDeclaration,
} from "ts-morph";

import {
  typingsSnapshotDir
} from '../constants.js';

import {
  ImportDeclarationImpl,
  PropertyDeclarationImpl,
  MemberedObjectTypeStructureImpl,
  MethodDeclarationImpl,
  VariableDeclarationImpl,
  ImportTypedStructureImpl,
  MethodSignatureImpl,
  PropertySignatureImpl,
  LiteralTypedStructureImpl,
  TypeStructures,
  TypeStructureKind,
  getTypeAugmentedStructure,
} from "#stage_one/prototype-snapshot/exports.js";

import ClassMembersMap from "#stage_two/generation/build/utilities/public/ClassMembersMap.js";

import {
  PromiseAllParallel
} from "#utilities/source/PromiseTypes.js";

import {
  getStructureClassBaseName,
  getStructureNameFromModified
} from "#utilities/source/StructureNameTransforms.js";
//#endregion preamble

const structuresDir = path.join(typingsSnapshotDir, "source/structures/standard");

/**
 * @returns true if we need to run the extractor again.
 */
export default
async function applyDecoratorsForDocModel(): Promise<void>
{
  const project: Project = createProject();

  const files = await fs.readdir(
    structuresDir, { encoding: "utf-8" }
  );
  await PromiseAllParallel(files, fileName => updateSourceFile(project, fileName));
}

function createProject(): Project
{
  // duplicating getTS_SourceFile, because I don't want cross-contamination.
  const TSC_CONFIG: ProjectOptions = {
    "compilerOptions": {
      "lib": ["es2022"],
      "module": ModuleKind.ESNext,
      "target": ScriptTarget.ESNext,
      "moduleResolution": ModuleResolutionKind.NodeNext,
      "sourceMap": true,
      "declaration": true,
      "noEmit": true,
    },
    skipAddingFilesFromTsConfig: true,
    skipFileDependencyResolution: true,
  };

  return new Project(TSC_CONFIG);
}

async function updateSourceFile(
  project: Project,
  fileName: string
): Promise<void>
{
  const className = fileName.replace(/\.d\.ts$/, "");
  const classBaseName = getStructureClassBaseName(getStructureNameFromModified(className));

  const sourceFile = project.addSourceFileAtPath(path.join(structuresDir, fileName));
  const classDecl = sourceFile.getClassOrThrow(className);

  const importsDecl = requireImportsDecl(sourceFile);

  const propertiesAndMethods = getPropertiesAndMethods(sourceFile, classBaseName);
  propertiesAndMethods.forEach(value => {
    if (value.kind === StructureKind.PropertySignature) {
      replacePropertyType(importsDecl, value);
    }
    else {
      replaceMethodType(importsDecl, value);
    }
  });
  const classMap = getClassMembersMap(propertiesAndMethods);

  classDecl.addMembers(Array.from(classMap.values()));
  classDecl.removeExtends();

  if (importsDecl.getNamedImports().length === 0)
    importsDecl.remove();

  await sourceFile.save();
}

function requireImportsDecl(sourceFile: SourceFile): ImportDeclaration
{
  let importsDecl: ImportDeclaration | undefined = sourceFile.getImportDeclaration("../../exports.js");
  if (!importsDecl) {
    importsDecl = sourceFile.addImportDeclaration(new ImportDeclarationImpl("../../exports.js"));
  }
  return importsDecl;
}

function getPropertiesAndMethods(
  sourceFile: SourceFile,
  classBaseName: string
): readonly (MethodSignatureImpl | PropertySignatureImpl)[]
{
  const classBaseNode = sourceFile.getVariableDeclarationOrThrow(classBaseName);

  const baseStructure = getTypeAugmentedStructure(classBaseNode, (
    message: string,
    failingTypeNode: TypeNode
  ) => {
    void(failingTypeNode);
    throw new Error(message);
  }).rootStructure as VariableDeclarationImpl;

  const importType = baseStructure.typeStructure as ImportTypedStructureImpl;
  const membered = importType.childTypes[1] as MemberedObjectTypeStructureImpl;

  classBaseNode.remove();

  return [
    ...membered.properties,
    ...membered.methods
  ];
}

function getClassMembersMap(
  propertiesAndMethods: readonly (MethodSignatureImpl | PropertySignatureImpl)[]
): ClassMembersMap
{
  const map = new ClassMembersMap;
  const classMembers: (MethodDeclarationImpl | PropertyDeclarationImpl)[] = [];
  propertiesAndMethods.forEach(value => {
    if (value.kind === StructureKind.PropertySignature) {
      classMembers.push(PropertyDeclarationImpl.fromSignature(value));
    } else {
      classMembers.push(MethodDeclarationImpl.fromSignature(value));
    }
  });
  map.addMembers(classMembers);
  return map;
}

function replacePropertyType(
  importsDecl: ImportDeclaration,
  value: PropertySignatureImpl
): void
{
  value.typeStructure = replaceImportTypeRecursive(importsDecl, value.typeStructure!);
}

function replaceMethodType(
  importsDecl: ImportDeclaration,
  value: MethodSignatureImpl
): void
{
  value.returnTypeStructure = replaceImportTypeRecursive(importsDecl, value.returnTypeStructure!);
}

function replaceImportTypeRecursive(
  importsDecl: ImportDeclaration,
  type: TypeStructures
): TypeStructures
{
  switch (type.kind) {
    case TypeStructureKind.Import:
      return getExportedTypeLiteral(importsDecl, type as ImportTypedStructureImpl);
    case TypeStructureKind.Array:
      type.objectType = replaceImportTypeRecursive(importsDecl, type.objectType);
      break;
    case TypeStructureKind.Parentheses:
      type.childTypes[0] = replaceImportTypeRecursive(importsDecl, type.childTypes[0]);
      break;
    case TypeStructureKind.Union:
      type.childTypes = type.childTypes.map(childType =>
        replaceImportTypeRecursive(importsDecl, childType)
      );
      break;
  }

  return type;
}

const fileMatchRE = /^\.\/([a-zA-Z]*)\.js$/;

function getExportedTypeLiteral(
  importsDecl: ImportDeclaration,
  importType: ImportTypedStructureImpl
): LiteralTypedStructureImpl | ImportTypedStructureImpl
{
  if (importType.childTypes.length > 0)
    return importType;
  if (importType.qualifier?.kind !== TypeStructureKind.Literal)
    return importType;

  if (importType.argument.stringValue.startsWith(".") === false)
    return importType;

  let literal: LiteralTypedStructureImpl | undefined;
  if (importType.qualifier.stringValue === "default") {
    const match = fileMatchRE.exec(importType.argument.stringValue);
    if (!match)
      return importType;

    const desiredType = match[1];

    literal = new LiteralTypedStructureImpl(desiredType);
  }
  else {
    literal = new LiteralTypedStructureImpl(importType.qualifier.stringValue);
  }

  const knownImports = new Set(importsDecl.getNamedImports().map(spec => spec.getName()));
  if (knownImports.has(literal.stringValue) === false)
    importsDecl.addNamedImport(literal.stringValue);

  return literal;
}
