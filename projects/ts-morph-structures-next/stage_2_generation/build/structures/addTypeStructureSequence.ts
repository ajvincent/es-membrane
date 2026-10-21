import {
  StructureKind
} from "ts-morph";

import {
  ClassBodyStatementsGetter,
  ClassSupportsStatementsFlags,
  ConstructorBodyStatementsGetter,
  MemberedStatementsKey,
  MemberedTypeToClass,
  PropertyInitializerGetter,
  PropertySignatureImpl,
  stringWriterOrStatementImpl,
  TypeStructureKind,
  type TypeMembersMap,
} from "#stage_one/snapshot/source/exports.js";

import {
  StructureModule,
} from "../../moduleClasses/exports.js";

import PropertyHashesWithTypes from "../classTools/PropertyHashesWithTypes.js";

import {
  StatementsPriority
} from "../fieldStatements/StatementsPriority.js";

import StatementGetterBase from "../fieldStatements/GetterBase.js";

export function addTypeStructureSequence(
  module: StructureModule,
  interfaceMembers: TypeMembersMap,
  typeToClass: MemberedTypeToClass
): void
{
  const properties = interfaceMembers.arrayOfKind(StructureKind.PropertySignature);
  properties.forEach(property => {
    if (property.typeStructure?.kind !== TypeStructureKind.Array)
      return;

    let name: string = property.name;
    if (PropertyHashesWithTypes.has(module.baseName, name)) {
      typeToClass.addStatementGetters(StatementsPriority.STRUCTURE_TYPE_ARRAY, [
        new TypeArrayInitializer(module, property),
      ]);

      module.addImports("internal", ["TypeStructureSequence", "TypeStructureClassesMap"], []);
      return;
    }

    if (name.endsWith("Sequence") === false)
      return;

    name = name.replace(/Sequence$/, "");
    if (!PropertyHashesWithTypes.has(module.baseName, name)) {
      // how'd we get here?
      return;
    }

    typeToClass.addStatementGetters(StatementsPriority.STRUCTURE_TYPE_ARRAY, [
      new SequenceInitializer(module, property),
    ]);
  });
}

class SequenceInitializer extends StatementGetterBase
implements PropertyInitializerGetter, ClassBodyStatementsGetter
{
  readonly #propSignature: PropertySignatureImpl;

  constructor(
    module: StructureModule,
    propSignature: PropertySignatureImpl
  )
  {
    super(
      module,
      "TypeStructureSequence",
      ClassSupportsStatementsFlags.PropertyInitializer |
      ClassSupportsStatementsFlags.BodyStatements |
      0
    );

    this.#propSignature = propSignature;
  }

  filterBodyStatements(key: MemberedStatementsKey): boolean {
    if (key.statementGroupKey !== "static [COPY_FIELDS]" && key.statementGroupKey !== "toJSON")
      return false;
    if (key.fieldKey !== this.#propSignature.name)
      return false;
    return true;
  }

  getBodyStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    if (key.statementGroupKey === "toJSON")
      return [];

    const originalName = this.#propSignature.name.replace(/Sequence$/, "");
    return [
      `
      if (source instanceof ${this.module.defaultExportName}) {
        target.${this.#propSignature.name}.push(...TypeStructureClassesMap.cloneArray(source.${this.#propSignature.name}));
      } else if (Array.isArray(source.${originalName})) {
        target.${originalName}.push(...source.${originalName});
      } else if (source.${originalName} !== undefined) {
        target.${originalName}.push(source.${originalName});
      }
      `
    ];
  }

  filterPropertyInitializer(
    key: MemberedStatementsKey
  ): boolean
  {
    return key.fieldKey === this.#propSignature.name;
  }

  getPropertyInitializer(
    key: MemberedStatementsKey
  ): stringWriterOrStatementImpl | undefined
  {
    void key;
    return "[]";
  }
}

class TypeArrayInitializer extends StatementGetterBase
implements ConstructorBodyStatementsGetter, PropertyInitializerGetter
{
  readonly #propSignature: PropertySignatureImpl;

  constructor(
    module: StructureModule,
    propSignature: PropertySignatureImpl
  )
  {
    super(
      module,
      "TypeArrayInitializer",
      ClassSupportsStatementsFlags.ConstructorBodyStatements |
      ClassSupportsStatementsFlags.PropertyInitializer |
      ClassSupportsStatementsFlags.BodyStatements |
      0
    );
    this.#propSignature = propSignature;
  }

  filterPropertyInitializer(
    key: MemberedStatementsKey
  ): boolean
  {
    return key.fieldKey === this.#propSignature.name;
  }

  getPropertyInitializer(
    key: MemberedStatementsKey
  ): stringWriterOrStatementImpl | undefined
  {
    void key;
    return undefined;
  }

  filterCtorBodyStatements(
    key: MemberedStatementsKey
  ): boolean
  {
    return key.fieldKey === this.#propSignature.name;
  }

  getCtorBodyStatements(
    key: MemberedStatementsKey
  ): readonly stringWriterOrStatementImpl[]
  {
    void key;
    const { name } = this.#propSignature;
    return [
      `this.${name} = TypeStructureSequence.createProxy(this.${name}Sequence);`
    ];
  }

  filterBodyStatements(key: MemberedStatementsKey): boolean {
    if (key.statementGroupKey !== "static [COPY_FIELDS]")
      return false;
    if (key.fieldKey !== this.#propSignature.name)
      return false;
    return true;
  }

  getBodyStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    void key;
    return [];
  }
}
