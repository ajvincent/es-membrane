import assert from "node:assert/strict";

import {
  CodeBlockWriter,
  StructureKind,
  VariableDeclarationKind,
  WriterFunction,
} from 'ts-morph';

import {
  ArrayTypedStructureImpl,
  LiteralTypedStructureImpl,
  MethodDeclarationImpl,
  ParameterDeclarationImpl,
  ParenthesesTypedStructureImpl,
  type StatementStructureImpls,
  TypeStructureClassesMap,
  TypeStructureKind,
  UnionTypedStructureImpl,
  VariableDeclarationImpl,
  VariableStatementImpl,
  type stringOrWriterFunction,
} from "#stage_one/prototype-snapshot/exports.js";

import StructureDictionaries, {
  DecoratorParts,
  StructureParts,
} from "#stage_two/generation/build/StructureDictionaries.js";

import {
  getStructureImplName
} from '#utilities/source/StructureNameTransforms.js';

import type {
  PropertyValue,
  PropertyName,
} from '../structureMeta/DataClasses.js';

import pairedWrite from "./pairedWrite.js";
import ConstantTypeStructures from "./ConstantTypeStructures.js";

export function write_cloneRequiredAndOptionalArray(
  structureName: string,
  dictionaries: StructureDictionaries,
  parts: DecoratorParts | StructureParts,
  propertyValue: PropertyValue,
  propertyKey: PropertyName
): WriterFunction {
  assert(
    propertyValue.mayBeString === false,
    `expected mayBeString to be false for structure name ${structureName}, property name ${propertyKey}`
  );
  assert(
    propertyValue.mayBeWriter === false,
    `expected mayBeWriter to be false for structure name ${structureName}, property name ${propertyKey}`
  );
  assert(
    propertyValue.mayBeUndefined === false,
    `expected mayBeUndefined to be false for structure name ${structureName}, property name ${propertyKey}`
  );
  assert(
    propertyValue.otherTypes[0].isOptionalKind === true,
    `expected first type to be required for structure name ${structureName}, property name ${propertyKey}`
  );
  assert(
    propertyValue.otherTypes[0].structureName !== undefined,
    `expected first structure name to exist for structure name ${structureName}, property name ${propertyKey}`
  );
  assert(
    propertyValue.otherTypes[1].isOptionalKind === false,
    `expected second type to be optional for structure name ${structureName}, property name ${propertyKey}`
  );
  assert(
    propertyValue.otherTypes[1].structureName !== undefined,
    `expected second structure name to exist for structure name ${structureName}, property name ${propertyKey}`
  );

  const requiredName = propertyValue.otherTypes[1].structureName;
  const requiredKind = dictionaries.structures.get(requiredName)!.structureKindName;
  const requiredImpl = getStructureImplName(requiredName);

  const optionalName = propertyValue.otherTypes[0].structureName;
  const optionalKind = dictionaries.structures.get(optionalName)!.structureKindName;
  const optionalImpl = getStructureImplName(optionalName);

  parts.importsManager.addImports({
    pathToImportedModule: "ts-morph",
    isPackageImport: true,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: [
      "OptionalKind",
      requiredName,
      optionalName,
    ]
  });

  parts.importsManager.addImports({
    pathToImportedModule: "ts-morph",
    isPackageImport: true,
    isDefaultImport: false,
    isTypeOnly: false,
    importNames: [
      "StructureKind",
    ]
  });

  const statement = (writer: CodeBlockWriter): void => {
    if (propertyValue.mayBeUndefined || propertyValue.hasQuestionToken) {
      writer.write(`if (source.${propertyKey}) `);
      writer.block(() => addPush(writer));
    }
    else {
      addPush(writer);
    }
  };

  const addPush = (writer: CodeBlockWriter): void => {
    writer.write(`target.${propertyKey}.push`);
    pairedWrite(writer, "(", ");", false, false, () => {
      writer.indent(() => {
        writer.write("...StructureClassesMap.cloneRequiredAndOptionalArray");
        pairedWrite(writer, "<", ">", true, true, () => {
          writer.writeLine(requiredName + ",");
          writer.writeLine(`StructureKind.${requiredKind},`);
          writer.writeLine(`OptionalKind<${optionalName}>,`);
          writer.writeLine(`StructureKind.${optionalKind},`);
          writer.writeLine(requiredImpl + ",");
          writer.writeLine(optionalImpl);
        });
        pairedWrite(writer, "(", ")", true, true, () => {
          writer.write(`source.${propertyKey}, StructureKind.${requiredKind}, StructureKind.${optionalKind}`);
        });
      });
    });
  };

  return statement;
}export function write_cloneStructureArray(
  structureName: string,
  dictionaries: StructureDictionaries,
  parts: DecoratorParts | StructureParts,
  propertyValue: PropertyValue,
  propertyKey: PropertyName
): WriterFunction {
  assert(
    propertyValue.otherTypes.length === 1,
    `expected propertyValue.otherTypes.length to be 1 or 2 for structure name ${structureName}, property name ${propertyKey}`
  );

  const otherType = propertyValue.otherTypes[0];
  const sourceStructureName = otherType.structureName!;
  const sourceKind = dictionaries.structures.get(sourceStructureName)!.structureKindName;

  const tsMorphImportNames: string[] = [sourceStructureName];

  parts.importsManager.addImports({
    pathToImportedModule: "ts-morph",
    isPackageImport: true,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: tsMorphImportNames
  });

  parts.importsManager.addImports({
    pathToImportedModule: "ts-morph",
    isPackageImport: true,
    isDefaultImport: false,
    isTypeOnly: false,
    importNames: [
      "StructureKind",
    ]
  });

  parts.importsManager.addImports({
    pathToImportedModule: dictionaries.internalExports.absolutePathToExportFile,
    isPackageImport: false,
    isDefaultImport: false,
    isTypeOnly: false,
    importNames: ["StructureClassesMap"]
  });

  let targetImpl: string = getStructureImplName(sourceStructureName);
  if (propertyValue.mayBeString && propertyValue.mayBeWriter) {
    targetImpl = `${targetImpl} | stringOrWriterFunction`;
  }
  else if (propertyValue.mayBeString) {
    targetImpl = `${targetImpl} | string`;
  }
  else {
    assert(
      propertyValue.mayBeWriter === false,
      `expected propertyValue.mayBeWriter to be false for structure name ${structureName}, property name ${propertyKey}`
    );
  }

  const statement = (writer: CodeBlockWriter): void => {
    if (propertyValue.mayBeUndefined || propertyValue.hasQuestionToken) {
      writer.write(`if (source.${propertyKey}) `);
      writer.block(() => addPush(writer));
    }
    else {
      addPush(writer);
    }
  };

  const addPush = (writer: CodeBlockWriter): void => {
    writer.write(`target.${propertyKey}.push`);
    pairedWrite(writer, "(", ");", true, true, () => {
      writer.write("...StructureClassesMap.cloneArrayWithKind");
      pairedWrite(writer, "<", ">", false, false, () => {
        writer.write(sourceStructureName + ", ");
        writer.write(`StructureKind.${sourceKind}, `);
        writer.write(targetImpl);
      });
      pairedWrite(writer, "(", ")", false, false, () => {
        writer.write(`StructureKind.${sourceKind},`);
        writer.write(`StructureClassesMap.forceArray(source.${propertyKey}),`);
      });
    });
  };

  return statement;
}

/* FIXME: this should be using the classFieldStatementsMap, and should be a special case for the `StatementedNodeStructureMixin` */
export function write_cloneStatementsArray(
  structureName: string,
  dictionaries: StructureDictionaries,
  parts: DecoratorParts | StructureParts,
  propertyValue: PropertyValue,
  propertyKey: PropertyName
): (StatementStructureImpls | stringOrWriterFunction)[] {
  void (propertyKey);
  void (propertyValue);

  parts.importsManager.addImports({
    pathToImportedModule: dictionaries.internalExports.absolutePathToExportFile,
    isDefaultImport: false,
    isPackageImport: false,
    isTypeOnly: false,
    importNames: [
      "StructureClassesMap",
    ]
  });

  parts.importsManager.addImports({
    pathToImportedModule: "ts-morph",
    isDefaultImport: false,
    isPackageImport: true,
    isTypeOnly: true,
    importNames: [
      "StatementStructures",
    ]
  });

  parts.importsManager.addImports({
    pathToImportedModule: dictionaries.publicExports.absolutePathToExportFile,
    isDefaultImport: false,
    isPackageImport: false,
    isTypeOnly: true,
    importNames: [
      "StatementStructureImpls",
    ]
  });

  let sourceParamType: UnionTypedStructureImpl, returnType: UnionTypedStructureImpl;
  {
    const statementsProp = parts.classMembersMap.getAsKind<StructureKind.Property>("statements", StructureKind.Property)!;
    const statementsArrayType = statementsProp.typeStructure!;
    assert(statementsArrayType.kind === TypeStructureKind.Array, `expected Array type structure`);
    const parensType = (statementsArrayType as ArrayTypedStructureImpl).objectType;
    assert(parensType.kind === TypeStructureKind.Parentheses, `expected Parentheses type structure`);
    const unionType = (parensType as ParenthesesTypedStructureImpl).childTypes[0];
    assert(unionType.kind === TypeStructureKind.Union, `expected Union type structure`);
    const literalType = (unionType as UnionTypedStructureImpl).childTypes[0];
    assert((literalType.kind === TypeStructureKind.Literal) && (literalType.stringValue === "StatementStructures"),
      `expected "StatementStructures" literal type`);

    sourceParamType = TypeStructureClassesMap.clone(unionType) as UnionTypedStructureImpl;

    (unionType as UnionTypedStructureImpl).childTypes.splice(
      0, 1, new LiteralTypedStructureImpl("StatementStructureImpls")
    );

    returnType = TypeStructureClassesMap.clone(unionType) as UnionTypedStructureImpl;
  }

  // this is a hack, since we should be defining the method and its statements elsewhere!
  const cloneStatementMethod = new MethodDeclarationImpl("#cloneStatement");
  cloneStatementMethod.isStatic = true;
  const sourceParam = new ParameterDeclarationImpl("source");
  sourceParam.typeStructure = sourceParamType;
  cloneStatementMethod.parameters.push(sourceParam);
  cloneStatementMethod.returnTypeStructure = returnType;

  cloneStatementMethod.statements.push(writer => {
    writer.write(`if (typeof source !== "object") `);
    writer.block(() => writer.write("return source;"));
  });
  cloneStatementMethod.statements.push(writer => {
    writer.writeLine(`return StructureClassesMap.clone<StatementStructures, StatementStructureImpls>(source);`);
  });

  parts.classMembersMap.addMembers([cloneStatementMethod]);

  const statements: (StatementStructureImpls | stringOrWriterFunction)[] = [];

  const statementsArrayLet = new VariableStatementImpl;
  statements.push(statementsArrayLet);
  statementsArrayLet.declarationKind = VariableDeclarationKind.Let;

  const statementsArrayDecl = new VariableDeclarationImpl("statementsArray");
  statementsArrayDecl.typeStructure = new ArrayTypedStructureImpl(
    new ParenthesesTypedStructureImpl(
      new UnionTypedStructureImpl([
        new LiteralTypedStructureImpl("StatementStructureImpls"),
        ConstantTypeStructures.stringOrWriterFunction
      ])
    )
  );
  statementsArrayDecl.initializer = "[]";
  statementsArrayLet.declarations.push(statementsArrayDecl);

  // trying to make this consistent with later work... this actually makes whitespace consistent
  statements.push(
    (writer: CodeBlockWriter) => {
      writer.write(`if (Array.isArray(source.statements)) {
        statementsArray = source.statements as (StatementStructureImpls | stringOrWriterFunction)[];
      }`);
    },
    (writer: CodeBlockWriter): void => {
      writer.write(`else if (source.statements !== undefined) {
        statementsArray = [source.statements];
      }`);
    },
    (writer: CodeBlockWriter): void => {
      writer.write(`target.statements.push(
        ...statementsArray.map(statement => StatementedNodeStructureMixin.#cloneStatement(statement))
      );`);
    }
  )

  return statements;
}
