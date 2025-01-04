import {
  VariableDeclarationKind,
  type WriterFunction,
} from "ts-morph";

import {
  ClassDeclarationImpl,
  IndexedAccessTypeStructureImpl,
  IntersectionTypeStructureImpl,
  LiteralTypeStructureImpl,
  MethodSignatureImpl,
  ParameterDeclarationImpl,
  PrefixOperatorsTypeStructureImpl,
  StringTypeStructureImpl,
  SourceFileImpl,
  TupleTypeStructureImpl,
  TypeArgumentedTypeStructureImpl,
  TypeMembersMap,
  VariableDeclarationImpl,
  VariableStatementImpl,
} from "#stage_two/snapshot/source/exports.js";

import {
  getClassInterfaceName,
  getStructureClassBaseName,
  getStructureImplName,
  getStructureMixinName,
} from "#utilities/source/StructureNameTransforms.js";

import CallExpressionStatementImpl from "../pseudoStatements/CallExpression.js";
import SatisfiesStatementImpl from "../pseudoStatements/SatisfiesStatement.js";

import BaseClassModule from "./BaseClassModule.js";
import InterfaceModule from "./InterfaceModule.js";
import sortClassMembers from "./sortClassMembers.js";

export default class StructureModule extends BaseClassModule
{
  static readonly map = new Map<string, StructureModule>;

  static #getFieldsName(this: void, name: string): string {
    return name + "Fields";
  }

  readonly baseName: string;
  readonly exportName: string;
  readonly #interfaceModule: InterfaceModule;
  #flatTypeMembers?: TypeMembersMap

  constructor(
    baseName: string,
    interfaceModule: InterfaceModule,
  )
  {
    const structureName = getStructureImplName(baseName);
    super("source/structures/standard", structureName, false);
    StructureModule.map.set(structureName, this);

    this.baseName = baseName;
    this.exportName = structureName;
    this.#interfaceModule = interfaceModule;
  }

  createStaticCloneMethod(): MethodSignatureImpl
  {
    this.addImports("ts-morph", [], ["OptionalKind"]);
    const method = new MethodSignatureImpl("clone");

    const sourceParam = new ParameterDeclarationImpl("source");
    sourceParam.typeStructure = new TypeArgumentedTypeStructureImpl(
      LiteralTypeStructureImpl.get("OptionalKind"),
      [LiteralTypeStructureImpl.get(this.baseName)]
    );

    method.parameters.push(sourceParam);

    method.returnTypeStructure = LiteralTypeStructureImpl.get(this.exportName);
    return method;
  }

  getFlatTypeMembers(): TypeMembersMap
  {
    if (this.#flatTypeMembers)
      return this.#flatTypeMembers;

    const map = new TypeMembersMap;
    map.addMembers(Array.from(this.#interfaceModule.typeMembers.values()));
    this.#interfaceModule.extendsSet.forEach(extendsName => {
      const childInterface = InterfaceModule.decoratorsMap.get(getClassInterfaceName(extendsName))!;
      map.addMembers(Array.from(childInterface.typeMembers.values()));
    });

    this.#flatTypeMembers = map;
    return map;
  }

  protected getSourceFileImpl(): SourceFileImpl {
    const sourceFile = new SourceFileImpl;

    const mixinBase = this.#buildMixinBase();
    const mixinClass = this.#buildClass();
    const satisfiesWriter = this.#getSatisfiesStatement().writerFunction;
    const classesMapWriter = this.#addToStructureClassesMapStatement();

    sourceFile.statements.push(
      "//#region preamble",
      ...this.importManager.getDeclarations(),
      "//#endregion preamble",

      mixinBase,
      mixinClass,
      satisfiesWriter,
      classesMapWriter
    );

    return sourceFile;
  }

  #buildMixinBase(): VariableStatementImpl
  {
    const extendsKeys = Array.from(this.#interfaceModule.extendsSet.keys());

    const extendsFields = extendsKeys.map(StructureModule.#getFieldsName)
    const extendsMixins = extendsKeys.map(getStructureMixinName);

    this.addImports(
      "internal",
      [
        "StructureBase",
        ...extendsMixins
      ],
      extendsFields
    );

    this.importManager.addImports({
      pathToImportedModule: "mixin-decorators",
      isDefaultImport: true,
      isPackageImport: true,
      isTypeOnly: false,
      importNames: ["MultiMixinBuilder"]
    });

    const structureBase = new VariableDeclarationImpl(
      getStructureClassBaseName(this.baseName)
    );

    structureBase.initializer = new CallExpressionStatementImpl({
      name: "MultiMixinBuilder",
      typeParameters: [
        new TupleTypeStructureImpl(
          extendsFields.map((fieldName => LiteralTypeStructureImpl.get(fieldName)))
        ),
        new PrefixOperatorsTypeStructureImpl(
          ["typeof"],
          LiteralTypeStructureImpl.get("StructureBase")
        )
      ],
      parameters: [
        `[${extendsMixins.join(",\n")}]`,
        `StructureBase`
      ]
    }).writerFunction;

    const statement = new VariableStatementImpl;
    statement.declarationKind = VariableDeclarationKind.Const;
    statement.declarations.push(structureBase);
    return statement;
  }

  #buildClass(): ClassDeclarationImpl {
    const classDecl = new ClassDeclarationImpl;

    const interfaceName = getClassInterfaceName(this.baseName);
    this.addImports("public", [], [interfaceName]);
    classDecl.name = this.exportName;
    classDecl.isDefaultExport = true;
    classDecl.extendsStructure = LiteralTypeStructureImpl.get(getStructureClassBaseName(this.baseName))
    classDecl.implementsSet.add(LiteralTypeStructureImpl.get(interfaceName));
    this.classMembersMap!.moveMembersToClass(classDecl);

    sortClassMembers(classDecl);

    return classDecl;
  }

  #getSatisfiesStatement(): SatisfiesStatementImpl
  {
    this.addImports(
      "internal",
      [],
      [
        "CloneableStructure",
        "ExtractStructure"
      ]
    );

    this.addImports("ts-morph", [], [this.baseName]);

    this.addImports(
      "type-fest",
      [],
      [
        "Class"
      ]
    )

    return new SatisfiesStatementImpl(
      this.exportName,
      new IntersectionTypeStructureImpl([
        new TypeArgumentedTypeStructureImpl(
          LiteralTypeStructureImpl.get("CloneableStructure"),
          [
            LiteralTypeStructureImpl.get(this.baseName),
            LiteralTypeStructureImpl.get(this.exportName)
          ]
        ),

        new TypeArgumentedTypeStructureImpl(
          LiteralTypeStructureImpl.get("Class"),
          [
            new TypeArgumentedTypeStructureImpl(
              LiteralTypeStructureImpl.get("ExtractStructure"),
              [
                new IndexedAccessTypeStructureImpl(
                  LiteralTypeStructureImpl.get(this.baseName),
                  StringTypeStructureImpl.get("kind")
                )
              ]
            )
          ]
        )
      ])
    );
  }

  #addToStructureClassesMapStatement(): WriterFunction
  {
    this.addImports("ts-morph", ["StructureKind"], []);
    this.addImports("internal", ["StructureClassesMap"], []);
    return new CallExpressionStatementImpl({
      name: "StructureClassesMap.set",
      parameters: [
        `StructureKind.${this.#interfaceModule.structureKindName!}`,
        this.exportName
      ]
    }).writerFunction;
  }
}
