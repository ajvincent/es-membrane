//#region preamble
import {
  Scope,
  StructureKind,
} from "ts-morph";

import {
  ClassSupportsStatementsFlags,
  ClassMembersMap,
  ClassBodyStatementsGetter,
  ClassTailStatementsGetter,
  LiteralTypeStructureImpl,
  JSDocImpl,
  JSDocTagImpl,
  MemberedStatementsKey,
  type MemberedTypeToClass,
  MethodSignatureImpl,
  ParameterDeclarationImpl,
  PropertyDeclarationImpl,
  SetAccessorDeclarationImpl,
  TupleTypeStructureImpl,
  type TypeMembersMap,
  UnionTypeStructureImpl,
  type stringWriterOrStatementImpl,
} from "#stage_one/snapshot/source/exports.js";

import type InterfaceModule from "../../../moduleClasses/InterfaceModule.js";

import type {
  StructureModule
} from "../../../moduleClasses/StructureModule.js";

import CallExpressionStatementImpl from "../../../pseudoExpressions/statements/CallExpression.js";

import type {
  StructureModuleModifierTraps
} from "../../../types/StructureModuleModifierTraps.js";

import {
  StatementsPriority,
} from "../../fieldStatements/StatementsPriority.js";

import StatementGetterBase from "../../fieldStatements/GetterBase.js";

import {
  COPY_FIELDS_NAME,
} from "../../constants.js";

//#endregion preamble

/**
 * JSDOcTag has a `text` field naturally, which can contain a type and a description.  This
 * code is all about making sure we transform the text into a type structure and a description.
 *
 * In particular, I replace the text proeprty with a text getter and setter, and add two
 * methods: `getTypeAndDescription()` and `setTypeAndDescription(typeStructure, description)`.
 *
 * Doing so has other knock-on effects for `[COPY_FIELDS]`, `toJSON` and the constructor.
 *
 * To accomodate identities, I provide `#unboundTextWriter` and `#defaultTextWriter` so that
 * `text` will always be a `WriterFunction`.
 */
export const JSDocTagSpecialCases: StructureModuleModifierTraps = {
  modifyTypeMembersForTypeStructures(
    module: StructureModule,
    baseName: string,
    map: TypeMembersMap
  ): void
  {
    void baseName;

    module.addImports(
      "public",
      [ "parseLiteralType" ],
      [ "TypeStructures", "TypeStructuresOrNull", ]
    );

    module.addImports(
      "internal",
      ["REPLACE_WRITER_WITH_STRING", "TypeStructureClassesMap"],
      []
    );

    module.addImports(
      "ts-morph",
      [],
      ["CodeBlockWriter", "WriterFunction"]
    );

    map.convertPropertyToAccessors("text", true, true);

    const unboundWriter = new MethodSignatureImpl("#unboundTextWriter");
    {
      const param = new ParameterDeclarationImpl("writer");
      param.typeStructure = LiteralTypeStructureImpl.get("CodeBlockWriter");
      unboundWriter.parameters.push(param);
    }

    const getTypeAndDesc = new MethodSignatureImpl("getTypeAndDescription");
    {
      getTypeAndDesc.returnTypeStructure = new UnionTypeStructureImpl([
        new TupleTypeStructureImpl([
          LiteralTypeStructureImpl.get("TypeStructuresOrNull"),
          LiteralTypeStructureImpl.get("string")
        ]),
        LiteralTypeStructureImpl.get("undefined")
      ]);

      const doc = new JSDocImpl();
      getTypeAndDesc.docs.push(doc);
      doc.description = "Get the type structure and description of the tag.";
    }

    const setTypeAndDesc = new MethodSignatureImpl("setTypeAndDescription");
    {
      setTypeAndDesc.returnTypeStructure = LiteralTypeStructureImpl.get("void");

      const type = new ParameterDeclarationImpl("type");
      type.typeStructure = LiteralTypeStructureImpl.get("TypeStructuresOrNull");

      const description = new ParameterDeclarationImpl("description");
      description.typeStructure = LiteralTypeStructureImpl.get("string");

      setTypeAndDesc.parameters.push(type, description);

      const doc = new JSDocImpl();
      setTypeAndDesc.docs.push(doc);
      doc.description = "Set the type structure and description of the tag.";

      let tag = new JSDocTagImpl("param");
      tag.text = "type - The type structure to use.";
      doc.tags.push(tag);

      tag = new JSDocTagImpl("param");
      tag.text = "description - The text to write after the type structure.";
      doc.tags.push(tag);
    }

    map.addMembers([unboundWriter, getTypeAndDesc, setTypeAndDesc]);
  },

  buildTypeToClass(
    module: StructureModule,
    interfaceModule: InterfaceModule,
    typeToClass: MemberedTypeToClass
  ): void
  {
    void module;
    void interfaceModule;
    typeToClass.addStatementGetters(StatementsPriority.STRUCTURE_SPECIFIC, [
      new JSDocTagMethodStatements(module),
    ]);

    const COPY_FIELDS = new MethodSignatureImpl("[COPY_FIELDS]");
    const setText = new SetAccessorDeclarationImpl(false, "text", new ParameterDeclarationImpl("value"));
    typeToClass.insertMemberKey(false, setText, true, COPY_FIELDS);

    const toJSON = new MethodSignatureImpl("toJSON");
    typeToClass.insertMemberKey(false, setText, false, toJSON);
  },

  postProcessClassMembers(
    module: StructureModule
  ): void
  {
    const hashTypeRE = new PropertyDeclarationImpl(true, "#typeRE");
    hashTypeRE.isReadonly = true;
    hashTypeRE.isStatic = true;
    hashTypeRE.initializer = `/^\\{([^}]+)\\}\\s?(.*)/`;

    const hashTypeStructure = new PropertyDeclarationImpl(false, "#typeStructure");
    hashTypeStructure.typeStructure = LiteralTypeStructureImpl.get("TypeStructuresOrNull");
    hashTypeStructure.initializer = "null";

    const hashDescription = new PropertyDeclarationImpl(false, "#description");
    hashDescription.typeStructure = LiteralTypeStructureImpl.get("string");

    // handled in constructor
    //hashDescription.initializer = `""`;

    const hashDefaultWriter = new PropertyDeclarationImpl(false, "#defaultTextWriter");
    hashDefaultWriter.typeStructure = LiteralTypeStructureImpl.get("WriterFunction");
    hashDefaultWriter.isReadonly = true;
    {
      const callExpr = new CallExpressionStatementImpl({
        name: "this.#unboundTextWriter.bind",
        parameters: ["this"]
      });
      hashDefaultWriter.initializer = callExpr.writerFunction;
    }

    const hashText = new PropertyDeclarationImpl(false, "#text");
    hashText.typeStructure = LiteralTypeStructureImpl.get("WriterFunction");
    hashText.initializer = "this.#defaultTextWriter";

    module.classMembersMap!.addMembers([
      hashTypeRE, hashTypeStructure, hashDescription, hashDefaultWriter, hashText,
    ]);

    module.classMembersMap!.getAsKind(StructureKind.Constructor, false, "constructor")!.statements.push(
      `this.#description = "";`,
      `this.setTypeAndDescription(null, "");`,
    );

    module.classMembersMap!.getAsKind(StructureKind.GetAccessor, false, "text")!.scope = Scope.Public;
    module.classMembersMap!.getAsKind(StructureKind.SetAccessor, false, "text")!.scope = Scope.Public;
    module.classMembersMap!.getAsKind(StructureKind.Method, false, "getTypeAndDescription")!.scope = Scope.Public;
    module.classMembersMap!.getAsKind(StructureKind.Method, false, "setTypeAndDescription")!.scope = Scope.Public;
  }
};

class JSDocTagMethodStatements extends StatementGetterBase
implements ClassBodyStatementsGetter, ClassTailStatementsGetter
{
  // I'm not messing with statement structures for something this complex.  Save that for stage 3.
  static readonly #tailMethodToStatements: ReadonlyMap<string, string> = new Map([
    [ClassMembersMap.keyFromName(StructureKind.GetAccessor, false, "text"), `return this.#text;`],
    [ClassMembersMap.keyFromName(StructureKind.SetAccessor, false, "text"), `
      if (typeof value === "function") {
        this.#typeStructure = null;
        this.#description = "";
        this.#text = value;
        return;
      }

      if (typeof value === "undefined") {
        value = "";
      }

      const match = JSDocTagImpl.#typeRE.exec(value.trim());
      if (match) {
        try {
          const typeStructure: TypeStructures = parseLiteralType(match[1]);
          this.setTypeAndDescription(typeStructure, match[2]);
          return;
        } catch (ex) {
          void (ex);
          // fall through
        }
      }

      this.setTypeAndDescription(null, value);
    `.trim()],

    [ClassMembersMap.keyFromName(StructureKind.Method, false, "getTypeAndDescription"), `
      if (this.#text === this.#defaultTextWriter)
        return [this.#typeStructure, this.#description];
      return undefined;
    `.trim()],

    [ClassMembersMap.keyFromName(StructureKind.Method, false, "setTypeAndDescription"), `
      this.#text = this.#defaultTextWriter;
      this.#typeStructure = type;
      this.#description = description;
    `.trim()],

    [ClassMembersMap.keyFromName(StructureKind.Method, false, "#unboundTextWriter"), `
      if (this.#typeStructure) {
        writer.write("{");
        this.#typeStructure.writerFunction(writer);
        writer.write("} ");
      }

      writer.write(this.#description);
    `.trim()],
  ]);

  constructor(
    module: StructureModule,
  )
  {
    super(
      module,
      "JSDocTagMethodStatements",
      ClassSupportsStatementsFlags.BodyStatements |
      ClassSupportsStatementsFlags.TailStatements |
      0
    );
  }

  static #SET_TEXT = ClassMembersMap.keyFromName(StructureKind.SetAccessor, false, "text");

  filterBodyStatements(key: MemberedStatementsKey): boolean {
    if (key.fieldKey === JSDocTagMethodStatements.#SET_TEXT && key.statementGroupKey === COPY_FIELDS_NAME)
      return true;
    if (key.fieldKey === JSDocTagMethodStatements.#SET_TEXT && key.statementGroupKey === "toJSON")
      return true;
    return false;
  }

  getBodyStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    if (key.fieldKey === JSDocTagMethodStatements.#SET_TEXT && key.statementGroupKey === COPY_FIELDS_NAME) {
      return [`
        if (source instanceof JSDocTagImpl) {
          const typeAndDesc = source.getTypeAndDescription();
          if (typeAndDesc) {
            let typeStructure: TypeStructuresOrNull = typeAndDesc[0];
            if (typeStructure)
              typeStructure = TypeStructureClassesMap.clone(typeStructure);
            target.setTypeAndDescription(typeStructure, typeAndDesc[1]);
          } else {
            target.text = source.text;
          }
        } else if (source.text) {
          target.text = source.text;
        }
      `.trim()];
    }

    if (key.fieldKey === JSDocTagMethodStatements.#SET_TEXT && key.statementGroupKey === "toJSON") {
      return [`
        if (this.text) {
          rv.text = StructureBase[REPLACE_WRITER_WITH_STRING](this.text);
        }
      `.trim()];
    }

    return [];
  }

  filterTailStatements(key: MemberedStatementsKey): boolean {
    return JSDocTagMethodStatements.#tailMethodToStatements.has(key.statementGroupKey);
  }
  getTailStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    return [JSDocTagMethodStatements.#tailMethodToStatements.get(key.statementGroupKey)!];
  }
}
