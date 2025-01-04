import {
  Scope,
  StructureKind
} from "ts-morph";

import StructureDictionaries from "#stage_two/generation/build/StructureDictionaries.js";

import {
  StructureImplMeta
} from "#stage_two/generation/build/structureMeta/DataClasses.js";

import ConstantTypeStructures from "#stage_two/generation/build/utilities/ConstantTypeStructures.js";

import {
  LiteralTypedStructureImpl,
  MethodDeclarationImpl,
  ParameterDeclarationImpl,
  TypeArgumentedTypedStructureImpl,
} from "#stage_one/prototype-snapshot/exports.js";

import ClassMembersMap from "#stage_two/generation/build/utilities/public/ClassMembersMap.js";
import ClassFieldStatementsMap from "#stage_two/generation/build/utilities/public/ClassFieldStatementsMap.js";

export default function addStaticClone(
  name: string,
  meta: StructureImplMeta,
  dictionaries: StructureDictionaries
): void
{
  const parts = dictionaries.structureParts.get(meta);
  if (!parts)
    return;

  const {
    classDecl,
    classFieldsStatements,
    classMembersMap,
    importsManager,
  } = parts;

  importsManager.addImports({
    pathToImportedModule: "ts-morph",
    isPackageImport: true,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: ["OptionalKind"]
  });

  importsManager.addImports({
    pathToImportedModule: dictionaries.internalExports.absolutePathToExportFile,
    isPackageImport: false,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: [
      "CloneableStructure",
    ]
  });

  importsManager.addImports({
    pathToImportedModule: dictionaries.internalExports.absolutePathToExportFile,
    isPackageImport: false,
    isDefaultImport: false,
    isTypeOnly: false,
    importNames: [
      "StructureClassesMap",
    ]
  });

  const cloneMethod = new MethodDeclarationImpl("clone");
  cloneMethod.scope = Scope.Public;
  cloneMethod.isStatic = true;

  const sourceParam = new ParameterDeclarationImpl("source");
  sourceParam.typeStructure = new TypeArgumentedTypedStructureImpl(
    ConstantTypeStructures.OptionalKind,
    [
      new LiteralTypedStructureImpl(meta.structureName)
    ]
  );
  cloneMethod.parameters.push(sourceParam);

  cloneMethod.returnTypeStructure = new LiteralTypedStructureImpl(classDecl.name!);
  let constructorArgs: string[] = [];

  const ctor = classMembersMap.getAsKind<StructureKind.Constructor>("constructor", StructureKind.Constructor);
  if (ctor) {
    constructorArgs = ctor.parameters.map(param => {
      let rv = "source." + param.name;
      if (param.name === "isStatic")
        rv += " ?? false";
      return rv;
    });
  }

  classFieldsStatements.set(
    "(body)",
    ClassMembersMap.keyFromMember(cloneMethod),
    [
      `const target = new ${classDecl.name!}(${constructorArgs.join(", ")});`,
      `this[COPY_FIELDS](source, target);`,
    ]
  );

  classFieldsStatements.set(
    ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN,
    ClassMembersMap.keyFromMember(cloneMethod),
    [
      `return target;`
    ]
  );

  classMembersMap.addMembers([cloneMethod]);
}
