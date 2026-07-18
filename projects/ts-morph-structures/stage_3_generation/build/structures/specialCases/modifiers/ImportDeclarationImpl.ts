//#region preamble
import {
  StructureKind
} from "ts-morph";

import type {
  StructureModule
} from "#stage_three/generation/moduleClasses/StructureModule.js";

import {
  ClassMembersMap,
  ClassSupportsStatementsFlags,
  ClassTailStatementsGetter,
  type JSDocImpl,
  JSDocTagImpl,
  LiteralTypeStructureImpl,
  MemberedStatementsKey,
  type MemberedTypeToClass,
  MethodSignatureImpl,
  ParameterDeclarationImpl,
  type PropertySignatureImpl,
  StringTypeStructureImpl,
  type TypeMembersMap,
  UnionTypeStructureImpl,
  type stringOrWriterFunction,
  stringWriterOrStatementImpl,
} from "#stage_two/snapshot/source/exports.js";

import type {
  StructureModuleModifierTraps
} from "#stage_three/generation/types/StructureModuleModifierTraps.js";

import InterfaceModule from "#stage_three/generation/moduleClasses/InterfaceModule.js";

import {
  StatementsPriority
} from "#stage_three/generation/build/fieldStatements/StatementsPriority.js";

import StatementGetterBase from "#stage_three/generation/build/fieldStatements/GetterBase.js";
//#endregion preamble

const ImportDeclarationSpecialCases: StructureModuleModifierTraps = {
  defineImplMethods: function(
    module: StructureModule,
    interfaceMembers: TypeMembersMap,
    typeToClass: MemberedTypeToClass,
    replacedProperties: PropertySignatureImpl[],
  ): void
  {
    void module;
    void interfaceMembers;
    void replacedProperties;

    {
      const staticCloneMethod = typeToClass.getCurrentTypeMembers(true).find(
        typeMember => typeMember.kind === StructureKind.MethodSignature && typeMember.name === "clone"
      ) as MethodSignatureImpl;

      const withTypesArg = new ParameterDeclarationImpl("withTypesArg");
      withTypesArg.hasQuestionToken = true;
      withTypesArg.typeStructure = new UnionTypeStructureImpl([
        StringTypeStructureImpl.get("typesOnly"),
        StringTypeStructureImpl.get("excludeTypes"),
      ]);
      staticCloneMethod.parameters.push(withTypesArg);

      const jsDoc = staticCloneMethod.docs[0] as JSDocImpl;
      const withTypesTag = new JSDocTagImpl("param");
      withTypesTag.text = `withTypesArg - When "typesOnly", the clone has only type imports.  When "excludeTypes", the clone has no type imports.`;
      jsDoc.tags.push(withTypesTag);
    }

    {
      const namedImportsTypeFilter = new MethodSignatureImpl("#namedImportsTypeFilter");

      const thisArg = new ParameterDeclarationImpl("this");
      thisArg.typeStructure = LiteralTypeStructureImpl.get("void");

      const namedImport = new ParameterDeclarationImpl("namedImport");
      namedImport.typeStructure = new UnionTypeStructureImpl([
        LiteralTypeStructureImpl.get("ImportSpecifierImpl"),
        LiteralTypeStructureImpl.get("stringOrWriterFunction")
      ]);

      const withTypes = new ParameterDeclarationImpl("withTypes");
      withTypes.typeStructure = LiteralTypeStructureImpl.get("boolean");

      namedImportsTypeFilter.parameters.push(thisArg, namedImport, withTypes);

      namedImportsTypeFilter.returnTypeStructure = LiteralTypeStructureImpl.get("boolean");
      typeToClass.addTypeMember(true, namedImportsTypeFilter);
    }
  },

  modifyStaticClone_TailStatements(statements: stringOrWriterFunction[]) {
    statements.splice(statements.length - 1, 0, `
      if (withTypesArg) {
        const typesOnly = withTypesArg === "typesOnly";
        const filteredImports = target.namedImports.filter(
          namedImport => this.#namedImportsTypeFilter(namedImport, typesOnly)
        ) as readonly ImportSpecifierImpl[];
        for (const namedImport of filteredImports) {
          namedImport.isTypeOnly = false;
        }
        target.namedImports.splice(0, target.namedImports.length, ...filteredImports);
        target.isTypeOnly = typesOnly;
        if (typesOnly)
          delete target.defaultImport;
      }
    `);
  },

  buildTypeToClass(
    module: StructureModule,
    interfaceModule: InterfaceModule,
    typeToClass: MemberedTypeToClass,
  ): void
  {
    void module;
    void interfaceModule;
    typeToClass.addStatementGetters(StatementsPriority.STRUCTURE_SPECIFIC, [
      new NamedImportsTypeFilterStatements(module),
    ]);
  }
};

class NamedImportsTypeFilterStatements extends StatementGetterBase implements ClassTailStatementsGetter {
  static readonly #key: string = ClassMembersMap.keyFromName(StructureKind.Method, true, "#namedImportsTypeFilter");

  constructor(
    module: StructureModule,
  )
  {
    super(
      module,
      "CloneStructureStatements",
      ClassSupportsStatementsFlags.TailStatements
    );
  }

  filterTailStatements(key: MemberedStatementsKey): boolean {
    return key.statementGroupKey === NamedImportsTypeFilterStatements.#key;
  }

  getTailStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    void key;
    return [`
      if (typeof namedImport !== "object") {
        throw new Error("cannot process string or writer functions");
      }
      return namedImport.isTypeOnly === withTypes;
    `];
  }
}

export {
  ImportDeclarationSpecialCases
};
