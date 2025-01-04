// #region preamble

import {
  Scope,
} from "ts-morph";

import {
  JSDocImpl,
  JSDocTagImpl,
  LiteralTypedStructureImpl,
  MethodDeclarationImpl,
  ParameterDeclarationImpl,
  //TypeArgumentedTypedStructureImpl,
  IntersectionTypedStructureImpl,
  TypeArgumentedTypedStructureImpl,
} from "#stage_one/prototype-snapshot/exports.js";

import {
  DecoratorImplMeta,
  StructureImplMeta,
} from "#stage_two/generation/build/structureMeta/DataClasses.js";

import ConstantTypeStructures from "./ConstantTypeStructures.js";
import StructureDictionaries, {
  DecoratorParts,
  StructureParts
} from "../StructureDictionaries.js";

import ClassFieldStatementsMap from "./public/ClassFieldStatementsMap.js";
import ClassMembersMap from "./public/ClassMembersMap.js";

// #endregion preamble

const internalDoc = new JSDocImpl()
internalDoc.tags.push(new JSDocTagImpl("internal"));

export default function defineCopyFieldsMethod(
  meta: DecoratorImplMeta | StructureImplMeta,
  parts: Pick<
    DecoratorParts | StructureParts,
    "classDecl" | "classFieldsStatements" | "classMembersMap" | "importsManager"
  >,
  dictionaries: StructureDictionaries
): MethodDeclarationImpl
{
  const {
    classDecl,
    classMembersMap,
    importsManager,
  } = parts;
  const copyFields = new MethodDeclarationImpl("[COPY_FIELDS]");
  copyFields.scope = Scope.Public;
  copyFields.isStatic = true;
  copyFields.docs.push(JSDocImpl.clone(internalDoc));

  importsManager.addImports({
    pathToImportedModule: dictionaries.internalExports.absolutePathToExportFile,
    isDefaultImport: false,
    isPackageImport: false,
    isTypeOnly: false,
    importNames: [
      "COPY_FIELDS"
    ]
  });

  const sourceParam = new ParameterDeclarationImpl("source");
  const targetParam = new ParameterDeclarationImpl("target");

  if (meta instanceof DecoratorImplMeta) {
    sourceParam.typeStructure = new IntersectionTypedStructureImpl([
      new LiteralTypedStructureImpl(meta.structureName),
      ConstantTypeStructures.Structures
    ]);
    targetParam.typeStructure = new IntersectionTypedStructureImpl([
      /*
      new TypeArgumentedTypedStructureImpl(
        ConstantTypeStructures.Required,
        [
      */
          new LiteralTypedStructureImpl(classDecl.name!),
      /*
        ]
      ),
      */
      ConstantTypeStructures.Structures
    ]);
  }
  else {
    sourceParam.typeStructure = new TypeArgumentedTypedStructureImpl(
      ConstantTypeStructures.OptionalKind,
      [new LiteralTypedStructureImpl(meta.structureName)]
    );
    targetParam.typeStructure = new LiteralTypedStructureImpl(classDecl.name!);
  }

  copyFields.parameters.push(sourceParam, targetParam);
  copyFields.returnTypeStructure = ConstantTypeStructures.void;

  parts.classFieldsStatements.set(
    ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL,
    ClassMembersMap.keyFromMember(copyFields), [
      `super[COPY_FIELDS](source, target);`
    ]
  );

  classMembersMap.addMembers([copyFields]);
  return copyFields;
}
