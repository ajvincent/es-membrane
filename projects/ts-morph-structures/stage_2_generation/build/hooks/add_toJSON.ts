import {
  CodeBlockWriter,
  Scope,
  StructureKind,
} from "ts-morph";

import StructureDictionaries, {
  DecoratorParts,
  StructureParts,
} from "#stage_two/generation/build/StructureDictionaries.js";

import {
  DecoratorImplMeta,
  StructureImplMeta,
} from "#stage_two/generation/build/structureMeta/DataClasses.js";

import {
  LiteralTypedStructureImpl,
  MethodDeclarationImpl,
  PropertyDeclarationImpl,
  TypeArgumentedTypedStructureImpl,
  TypeStructureKind,
  TypeStructures,
  createCodeBlockWriter,
  pairedWrite,
} from "#stage_one/prototype-snapshot/exports.js";

import ConstantTypeStructures from "../utilities/ConstantTypeStructures.js";
import ClassFieldStatementsMap from "../utilities/public/ClassFieldStatementsMap.js";

export default function add_toJSON(
  name: string,
  meta: DecoratorImplMeta | StructureImplMeta,
  dictionaries: StructureDictionaries
): void
{
  let parts: DecoratorParts | StructureParts;
  if (meta instanceof DecoratorImplMeta) {
    parts = dictionaries.decoratorParts.get(meta)!;
  } else {
    parts = dictionaries.structureParts.get(meta)!;
  }

  const { classMembersMap, importsManager } = parts;

  importsManager.addImports({
    pathToImportedModule: dictionaries.internalExports.absolutePathToExportFile,
    isPackageImport: false,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: [ "StructureClassToJSON" ]
  });

  const toJSONMethod = new MethodDeclarationImpl("toJSON");
  const toJSONType = new TypeArgumentedTypedStructureImpl(
    ConstantTypeStructures.StructureClassToJSON,
    [ new LiteralTypedStructureImpl(parts.classDecl.name!)]
  );
  toJSONMethod.returnTypeStructure = toJSONType;
  toJSONMethod.scope = Scope.Public;

  parts.classFieldsStatements.set(ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL, toJSONMethod.name, [
    (writer: CodeBlockWriter): void => {
      writer.write(`const rv = super.toJSON() as `);
      toJSONType.writerFunction(writer);
    }
  ]);
  parts.classFieldsStatements.set(ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN, toJSONMethod.name, [
    `return rv;`
  ]);

  const properties = classMembersMap.arrayOfKind<StructureKind.Property>(
    StructureKind.Property
  );

  let needsReplaceWriter = false;
  properties.forEach((prop: PropertyDeclarationImpl): void => {
    const [propValue, isReplacing]: [string, boolean] = getJSONPropertyCopy(prop);
    if (isReplacing)
      needsReplaceWriter = true;
      let rv = `rv.${prop.name} = ${propValue};`;
      if (prop.hasQuestionToken) {
        rv = `if (this.${prop.name}) {\n  ${rv}\n} else { rv.${prop.name} = undefined; }`;
      }
      parts.classFieldsStatements.set(prop.name, toJSONMethod.name, [rv]);
  });

  if (needsReplaceWriter) {
    importsManager.addImports({
      pathToImportedModule: dictionaries.internalExports.absolutePathToExportFile,
      isPackageImport: false,
      isDefaultImport: false,
      isTypeOnly: false,
      importNames: [
        "REPLACE_WRITER_WITH_STRING"
      ]
    });
  }

  classMembersMap.addMembers([toJSONMethod]);
}

/**
 * Build a value to assign for a JSONifiable copy.
 *
 * @param prop - the property to replace
 * @returns [the value to assign, whether we need REPLACE_WRITER_WITH_STRING]
 */
function getJSONPropertyCopy(
  prop: PropertyDeclarationImpl
): [string, boolean]
{
  if ((prop.initializer === "false")) {
    return [`this.${prop.name};`, false];
  }

  let typeStructure: TypeStructures | undefined = prop.typeStructure;
  if (!typeStructure) {
    return [`this.${prop.name};`, false];
  }

  let isMap = false;
  if (typeStructure.kind === TypeStructureKind.Array) {
    isMap = true;
    typeStructure = typeStructure.objectType;
  }
  if (typeStructure.kind === TypeStructureKind.Parentheses) {
    typeStructure = typeStructure.childTypes[0];
  }

  const typeStructureSet = new Set<TypeStructures>(
    typeStructure.kind === TypeStructureKind.Union ? typeStructure.childTypes : [typeStructure]
  );
  const foundWriter = (
    typeStructureSet.has(ConstantTypeStructures.WriterFunction) ||
    typeStructureSet.has(ConstantTypeStructures.stringOrWriterFunction)
  );

  if (!foundWriter) {
    return [`this.${prop.name};`, false];
  }

  typeStructureSet.delete(ConstantTypeStructures.WriterFunction);
  typeStructureSet.delete(ConstantTypeStructures.stringOrWriterFunction);

  const writer = createCodeBlockWriter();
  pairedIfWrite(isMap, writer, `this.${prop.name}.map(value => {`, "})", true, true, () => {
    if (isMap && typeStructureSet.size > 0) {
      writer.write(`if (typeof value === "object")`);
      writer.block(() => writer.writeLine("return value;"));
    }

    writer.conditionalWrite(isMap, "return ");
    writer.write("StructureBase[REPLACE_WRITER_WITH_STRING]");
    pairedWrite(writer, "(", ")", false, false, () => {
      writer.write(isMap ? `value` : `this.${prop.name}`);
    });
  });

  return [writer.toString(), true];
}

/**
 * If the condition is met, call `pairedWrite()`, else call `block()`.
 * @param condition - the condition to check.
 * @param writer - the code block writer.
 * @param startToken - the start token.
 * @param endToken - the end token.
 * @param newLine - true if we should call `.newLine()` after the start and before the end.
 * @param indent - true if we should indent the block statements.
 * @param block - the callback to execute for the block statements.
 *
 * @see {@link https://github.com/dsherret/code-block-writer/issues/44}
 */
function pairedIfWrite(
  this: void,
  condition: boolean,
  writer: CodeBlockWriter,
  startToken: string,
  endToken: string,
  newLine: boolean,
  indent: boolean,
  block: () => void
) : void
{
  if (condition) {
    pairedWrite(writer, startToken, endToken, newLine, indent, block);
  }
  else {
    block();
  }
}

// this is really useful for debugging
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function logIfNameMatch(
  prop: PropertyDeclarationImpl,
  callback: () => readonly unknown[]
): void
{
  if (prop.name === "") {
    console.log(...callback());
  }
}
