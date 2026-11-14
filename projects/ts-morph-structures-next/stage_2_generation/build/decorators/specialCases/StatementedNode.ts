//#region preamble
import {
  CodeBlockWriter,
} from "ts-morph";

import {
  ArrayTypeStructureImpl,
  ClassBodyStatementsGetter,
  ClassFieldStatementsMap,
  ClassSupportsStatementsFlags,
  type ClassTailStatementsGetter,
  ConstructorBodyStatementsGetter,
  ConstructorHeadStatementsGetter,
  LiteralTypeStructureImpl,
  JSDocImpl,
  JSDocTagImpl,
  type MemberedStatementsKey,
  type MemberedTypeToClass,
  MethodDeclarationImpl,
  MethodSignatureImpl,
  ParameterDeclarationImpl,
  PropertyInitializerGetter,
  PropertySignatureImpl,
  TypeArgumentedTypeStructureImpl,
  UnionTypeStructureImpl,
  type stringWriterOrStatementImpl,
} from "#stage_one/snapshot/source/exports.js";

import type {
  DecoratorModule
} from "../../../moduleClasses/exports.js";

import BlockStatementImpl from "../../../pseudoExpressions/statements/BlockStatement.js";
import CallExpressionStatementImpl from "../../../pseudoExpressions/statements/CallExpression.js";

import type {
  DecoratorModuleModifierTraps
} from "../../../types/DecoratorModuleModifierTraps.js";

import {
  pathToModule
} from "#utilities/source/AsyncSpecModules.js";

import {
  distDir
} from "../../constants.js";

import StatementGetterBase from "../../fieldStatements/GetterBase.js";

import {
  StatementsPriority
} from "../../fieldStatements/StatementsPriority.js";
//#endregion preamble

export const StatementedNodeSpecialCases: DecoratorModuleModifierTraps = {
  modifyTypeToClassBeforeBuild(
    module: DecoratorModule,
    typeToClass: MemberedTypeToClass
  ): void
  {
    module.addImports("public", [], ["AugmentedStatementStructures"]);
    module.importManager.addImports({
      pathToImportedModule: pathToModule(
        distDir, "source/base/StatementsSequence.js"
      ),
      isDefaultImport: false,
      isTypeOnly: false,
      importNames: ["StatementsSequence"],
      isPackageImport: false,
    });

    module.addImports("internal", ["StatementStructureClassesMap"], []);

    const sequenceInitializer = new StatementsSequenceInitializer(module);
    const statementsInitializer = new StatementsInitializer(module);
    const toJSONStatements = new ToJSON_Statements(module);

    const cloneStatementFilter = new CloneStatement_Statements(module);

    typeToClass.addTypeMember(false, sequenceInitializer.getPropertySignature());
    typeToClass.addTypeMember(true, cloneStatementFilter.getMethodSignature());

    typeToClass.addStatementGetters(StatementsPriority.DECORATOR_SPECIFIC, [
      sequenceInitializer, statementsInitializer, cloneStatementFilter, toJSONStatements
    ]);
  },

  postProcessClassMembers(
    module: DecoratorModule,
  ): void
  {
    module.addImports(
      "public",
      [],
      [ "AugmentedStructures" ]
    );

    module.addImports(
      "internal",
      [ "STRUCTURE_CHILDREN" ],
      []
    );

    module.addImports(
      "source/structures/statements/isStatementStructure.ts",
      ["isStatementStructure"],
      []
    );

    const structureChildren: MethodDeclarationImpl = new MethodDeclarationImpl(false, "[STRUCTURE_CHILDREN]");

    const doc = new JSDocImpl();
    structureChildren.docs.push(doc);
    doc.tags.push(new JSDocTagImpl("internal"));

    structureChildren.isGenerator = true;
    structureChildren.returnTypeStructure = new TypeArgumentedTypeStructureImpl(
      LiteralTypeStructureImpl.get("IterableIterator"),
      [
        LiteralTypeStructureImpl.get("AugmentedStructures"),
      ]
    );

    structureChildren.statements.push(`
      yield * this.statementsSequence;
      for (const structure of super[STRUCTURE_CHILDREN]()) {
        if (!isStatementStructure(structure)) {
          yield structure;
        }
      }
    `.trim());

    module.classMembersMap!.addMembers([structureChildren]);
  },
};

class StatementsSequenceInitializer extends StatementGetterBase
implements PropertyInitializerGetter
{
  constructor(
    module: DecoratorModule
  )
  {
    super(
      module,
      "StatementsSequenceInitializer",
      ClassSupportsStatementsFlags.PropertyInitializer
    );
  }

  getPropertySignature(): PropertySignatureImpl {
    const property = new PropertySignatureImpl("statementsSequence");
    property.typeStructure = new ArrayTypeStructureImpl(LiteralTypeStructureImpl.get("AugmentedStatementStructures"));
    return property;
  }

  filterPropertyInitializer(key: MemberedStatementsKey): boolean {
    return key.fieldKey === "statementsSequence";
  }

  getPropertyInitializer(key: MemberedStatementsKey): stringWriterOrStatementImpl | undefined {
    void key;
    return "[]";
  }
}

class StatementsInitializer extends StatementGetterBase
implements PropertyInitializerGetter, ConstructorHeadStatementsGetter, ConstructorBodyStatementsGetter
{
  constructor(
    module: DecoratorModule
  )
  {
    super(
      module,
      "StatementsInitializer",
      ClassSupportsStatementsFlags.PropertyInitializer |
      ClassSupportsStatementsFlags.ConstructorHeadStatements |
      ClassSupportsStatementsFlags.ConstructorBodyStatements
    );
  }

  filterPropertyInitializer(
    key: MemberedStatementsKey
  ): boolean
  {
    return key.fieldKey === "statements";
  }

  getPropertyInitializer(
    key: MemberedStatementsKey
  ): stringWriterOrStatementImpl | undefined
  {
    void key;
    return undefined;
  }

  filterCtorHeadStatements(key: MemberedStatementsKey): boolean {
    return key.fieldKey === ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL;
  }

  getCtorHeadStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    void key;
    return [`super();`];
  }

  filterCtorBodyStatements(
    key: MemberedStatementsKey
  ): boolean
  {
    return key.fieldKey === "statements";
  }

  getCtorBodyStatements(
    key: MemberedStatementsKey
  ): readonly stringWriterOrStatementImpl[]
  {
    void key;
    return [
      `this.statements = StatementsSequence.createProxy(this.statementsSequence);`
    ];
  }
}

class ToJSON_Statements extends StatementGetterBase
implements ClassBodyStatementsGetter
{
  constructor(
    module: DecoratorModule
  )
  {
    super(
      module,
      "StatementedNode_ToJSON",
      ClassSupportsStatementsFlags.BodyStatements
    );
  }

  filterBodyStatements(
    key: MemberedStatementsKey
  ): boolean
  {
    return (
      (key.statementGroupKey === "toJSON") &&
      (key.isFieldStatic === false) &&
      (key.fieldKey === "statementsSequence")
    );
  }

  getBodyStatements(
    key: MemberedStatementsKey
  ): readonly stringWriterOrStatementImpl[]
  {
    void key;
    return [];
  }
}

class CloneStatement_Statements extends StatementGetterBase
implements ClassTailStatementsGetter
{
  constructor(
    module: DecoratorModule
  )
  {
    super(
      module,
      "CloneStatement_Statements",
      ClassSupportsStatementsFlags.TailStatements
    );
  }

  getMethodSignature(): MethodSignatureImpl
  {
    this.module.addImports("ts-morph", [], ["StatementStructures"]);
    this.module.addImports("public", [], ["stringOrWriterFunction", "StatementStructureImpls"]);
    const method = new MethodSignatureImpl("#cloneStatement");

    const param = new ParameterDeclarationImpl("source");
    param.typeStructure = new UnionTypeStructureImpl([
      LiteralTypeStructureImpl.get("StatementStructures"),
      LiteralTypeStructureImpl.get("stringOrWriterFunction"),
    ]);
    method.parameters.push(param);

    method.returnTypeStructure = new UnionTypeStructureImpl([
      LiteralTypeStructureImpl.get("StatementStructureImpls"),
      LiteralTypeStructureImpl.get("stringOrWriterFunction"),
    ]);

    return method;
  }

  filterTailStatements(
    key: MemberedStatementsKey
  ): boolean
  {
    return key.statementGroupKey === "static #cloneStatement";
  }

  getTailStatements(
    key: MemberedStatementsKey
  ): readonly stringWriterOrStatementImpl[]
  {
    void(key);
    this.module.addImports("internal", ["StructureClassesMap"], []);

    return [
      new BlockStatementImpl(
        `if (typeof source !== "object")`,
        [
          `return source;`
        ]
      ).writerFunction,

      (writer: CodeBlockWriter): void => {
        writer.write("return ");
        (new CallExpressionStatementImpl({
          name: "StructureClassesMap.clone",
          typeParameters: [
            LiteralTypeStructureImpl.get("StatementStructures"),
            LiteralTypeStructureImpl.get("StatementStructureImpls"),
          ],
          parameters: ["source"]
        })).writerFunction(writer);
      }
    ];
  }
}
