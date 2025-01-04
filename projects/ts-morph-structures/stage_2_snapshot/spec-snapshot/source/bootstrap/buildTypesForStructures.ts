import {
  IndexSignatureDeclaration,
  ModuleKind,
  ModuleResolutionKind,
  Node,
  Project,
  ProjectOptions,
  ScriptTarget,
  SourceFile,
  StructureKind,
  TypeNode,
} from "ts-morph";

import {
  ClassDeclarationImpl,
  FunctionDeclarationImpl,
  IndexSignatureDeclarationImpl,
  InterfaceDeclarationImpl,
  StringTypeStructureImpl,
  StructureImpls,
  TypeParameterDeclarationImpl,
  VariableDeclarationImpl,
} from "#stage_two/snapshot/source/exports.js";

import type {
  NodeWithStructures
} from "#stage_two/snapshot/source/bootstrap/types/conversions.js";

import buildTypesForStructures from "#stage_two/snapshot/source/bootstrap/buildTypesForStructures.js";

describe("buildTypesForStructures applies a type node converter for each structure", () => {
  let sourceFile: SourceFile;

  let failMessage: string | undefined;
  let failNode: TypeNode | null
  function failCallback(message: string, typeNode: TypeNode): void {
    failMessage = message;
    failNode = typeNode;
  }

  function invalidResolver(node: NodeWithStructures): never {
    void(node);
    throw new Error("unsupported");
  }

  beforeAll(() => {
    const TSC_CONFIG: ProjectOptions = {
      "compilerOptions": {
        "lib": ["es2022"],
        "module": ModuleKind.ESNext,
        "target": ScriptTarget.ESNext,
        "moduleResolution": ModuleResolutionKind.NodeNext,
      },
      skipAddingFilesFromTsConfig: true,
      useInMemoryFileSystem: true,
    };

    const project = new Project(TSC_CONFIG);
    sourceFile = project.createSourceFile("file.ts");
  });

  beforeEach(() => {
    failMessage = undefined;
    failNode = null;
  });

  afterEach(() => {
    sourceFile.removeStatements([0, sourceFile.getStatements().length]);
  });

  it("having a .type field", () => {
    sourceFile.addStatements([
      "const variableWithType: string = 'Hello';"
    ]);
    const variableWithType = sourceFile.getVariableDeclarationOrThrow("variableWithType");

    const structureOriginal = variableWithType.getStructure();
    const structure = VariableDeclarationImpl.clone(structureOriginal);

    const map = new Map<StructureImpls, Node>([
      [structure, variableWithType]
    ]);

    const stringType = new StringTypeStructureImpl("string");

    const failures = buildTypesForStructures(
      map,
      failCallback,
      invalidResolver,
      (typeNode, failCallback, subStructureResolver) => {
        void(subStructureResolver);
        if (typeNode === variableWithType.getTypeNode())
          return stringType;
        failCallback("uh oh", typeNode);
        return null;
      }
    );

    expect(structure.typeStructure).toBe(stringType);
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
    expect(failures).toEqual([]);
  });

  it("having a .returnType field", () => {
    sourceFile.addFunction({
      name: "foo",
      parameters: [
        {
          name: "first",
          type: "never"
        }
      ],
      returnType: "boolean"
    });

    const foo = sourceFile.getFunctionOrThrow("foo");

    const structureOriginal = foo.getStructure();
    let structure: FunctionDeclarationImpl;
    if (structureOriginal.kind === StructureKind.Function) {
      structure = FunctionDeclarationImpl.clone(structureOriginal);
    }
    else {
      throw new Error("unreachable");
    }

    const map = new Map<StructureImpls, Node>([
      [structure, foo]
    ]);

    const stringType = new StringTypeStructureImpl("string");

    const failures = buildTypesForStructures(
      map,
      failCallback,
      invalidResolver,
      (typeNode, failCallback, subStructureResolver) => {
        void(subStructureResolver);
        if (typeNode === foo.getReturnTypeNodeOrThrow())
          return stringType;
        failCallback("uh oh", typeNode);
        return null;
      }
    );


    expect(structure.returnTypeStructure).toBe(stringType);
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
    expect(failures).toEqual([]);
  });

  it("having a .constraint and a .default field (TypeParameterDeclaration)", () => {
    sourceFile.addFunction({
      name: "foo",
      typeParameters: [
        {
          name: "NumberType",
          constraint: "number",
          default: "1",
        }
      ],
      returnType: "boolean",
    });

    const foo = sourceFile.getFunctionOrThrow("foo");
    const NumberTypeNode = foo.getTypeParameterOrThrow("NumberType");
    const structureOriginal = NumberTypeNode.getStructure();
    const structure = TypeParameterDeclarationImpl.clone(structureOriginal);

    const map = new Map<StructureImpls, Node>([
      [structure, NumberTypeNode]
    ]);

    const numberString = new StringTypeStructureImpl("number");
    const oneString = new StringTypeStructureImpl("one");

    const failures = buildTypesForStructures(
      map,
      failCallback,
      invalidResolver,
      (typeNode, failCallback, subStructureResolver) => {
        void(subStructureResolver);
        if (typeNode === NumberTypeNode.getConstraintOrThrow())
          return numberString;
        if (typeNode === NumberTypeNode.getDefaultOrThrow())
          return oneString;
        failCallback("uh oh", typeNode);
        return null;
      }
    );

    expect(structure.constraintStructure).toBe(numberString);
    expect(structure.defaultStructure).toBe(oneString);
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
    expect(failures).toEqual([]);
  });

  it("having a keyType field (IndexSignatureDeclaration)", () => {
    sourceFile.addInterface({
      name: "Foo",
      indexSignatures: [
        {
          keyName: "key",
          keyType: "string",
          returnType: "boolean",
        },
      ],
    });

    const FooInterface = sourceFile.getInterfaceOrThrow("Foo");
    const keyIndex: IndexSignatureDeclaration = FooInterface.getIndexSignatureOrThrow(member => Boolean(member));

    const structureOriginal = keyIndex.getStructure();
    const structure = IndexSignatureDeclarationImpl.clone(structureOriginal);

    const map = new Map<StructureImpls, Node>([
      [structure, keyIndex]
    ]);

    const StringType = new StringTypeStructureImpl("string");
    const BooleanType = new StringTypeStructureImpl("boolean");

    const failures = buildTypesForStructures(
      map,
      failCallback,
      invalidResolver,
      (typeNode, failCallback, subStructureResolver) => {
        void(subStructureResolver);
        if (typeNode === keyIndex.getReturnTypeNode())
          return BooleanType;
        if (typeNode === keyIndex.getKeyTypeNode())
          return StringType;

        failCallback("Not a key type or return type node?", typeNode);
        return null;
      }
    );

    expect(structure.keyName).toBe("key");
    expect(structure.keyTypeStructure).toBe(StringType);
    expect(structure.returnTypeStructure).toBe(BooleanType);
    expect(failNode).toBe(null);
    expect(failures).toEqual([]);
  });

  it("having an .implements array and an extends type (ClassDeclaration)", () => {
    sourceFile.addClass({
      name: "NumberStringClass",
      extends: "BaseClass",
      implements: [
        "NumberStringType",
        "Foo"
      ],
    });

    const NumberStringClass = sourceFile.getClassOrThrow("NumberStringClass");
    const structureOriginal = NumberStringClass.getStructure();
    const structure = ClassDeclarationImpl.clone(structureOriginal);

    const map = new Map<StructureImpls, Node>([
      [structure, NumberStringClass]
    ]);

    const BaseClass = new StringTypeStructureImpl("BaseClass");
    const NS_Type = new StringTypeStructureImpl("NumberStringType");
    const Foo = new StringTypeStructureImpl("Foo");

    const failures = buildTypesForStructures(
      map,
      failCallback,
      invalidResolver,
      (typeNode, failCallback, subStructureResolver) => {
        void(subStructureResolver);
        if (!Node.isExpressionWithTypeArguments(typeNode)) {
          failCallback("Not an extends or implements node?", typeNode);
          return null;
        }

        const text = typeNode.getText();

        if (text === "BaseClass")
          return BaseClass;

        if (text === "NumberStringType")
          return NS_Type;

        if (text === "Foo")
          return Foo;

        failCallback("uh oh", typeNode);
        return null;
      }
    );

    expect(structure.extendsStructure).toBe(BaseClass);

    expect(structure.implementsSet.size).toBe(2);
    expect(structure.implementsSet.has(NS_Type)).toBe(true);
    expect(structure.implementsSet.has(Foo)).toBe(true);

    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
    expect(failures).toEqual([]);
  });

  it("having an .extends array (InterfaceDeclaration)", () => {
    sourceFile.addInterface({
      name: "NumberStringExtendedClass",
      extends: [
        "NumberStringClass",
        "Foo"
      ],
    });

    const NumberStringIfc = sourceFile.getInterfaceOrThrow("NumberStringExtendedClass");
    const structureOriginal = NumberStringIfc.getStructure();
    const structure = InterfaceDeclarationImpl.clone(structureOriginal);

    const map = new Map<StructureImpls, Node>([
      [structure, NumberStringIfc]
    ]);

    const NS_Type = new StringTypeStructureImpl("NumberStringClass");
    const Foo = new StringTypeStructureImpl("Foo");

    const failures = buildTypesForStructures(
      map,
      failCallback,
      invalidResolver,
      (typeNode, failCallback, subStructureResolver) => {
        void(subStructureResolver);
        if (!Node.isExpressionWithTypeArguments(typeNode)) {
          failCallback("Not an extends or implements node?", typeNode);
          return null;
        }

        const text = typeNode.getText();

        if (text === "NumberStringClass")
          return NS_Type;

        if (text === "Foo")
          return Foo;

        failCallback("uh oh", typeNode);
        return null;
      }
    );

    expect(structure.extendsSet.size).toBe(2);
    expect(structure.extendsSet.has(NS_Type)).toBe(true);
    expect(structure.extendsSet.has(Foo)).toBe(true);

    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
    expect(failures).toEqual([]);
  });

  it("having no type node", () => {
    sourceFile.addStatements([
      "const variableWithType = 'Hello';"
    ]);
    const variableWithType = sourceFile.getVariableDeclarationOrThrow("variableWithType");

    const structureOriginal = variableWithType.getStructure();
    const structure = VariableDeclarationImpl.clone(structureOriginal);
    expect(structure.type).toBe(undefined);

    const map = new Map<StructureImpls, Node>([
      [structure, variableWithType]
    ]);

    const failures = buildTypesForStructures(
      map,
      failCallback,
      invalidResolver,
      (typeNode, failCallback, subStructureResolver) => {
        void(subStructureResolver);
        failCallback("uh oh", typeNode);
        return null;
      }
    );

    expect(structure.typeStructure).toBe(undefined);
    expect(structure.type).toBe(undefined);
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
    expect(failures).toEqual([]);
  });

  it("reports failures but does not stop on them", () => {
    sourceFile.addClass({
      name: "NumberStringClass",
      implements: [
        "Foo",
        "Bar",
        "NumberStringType",
      ],
    });

    const NumberStringClass = sourceFile.getClassOrThrow("NumberStringClass");
    const structureOriginal = NumberStringClass.getStructure();
    const structure = ClassDeclarationImpl.clone(structureOriginal);

    const map = new Map<StructureImpls, Node>([
      [structure, NumberStringClass]
    ]);

    const NS_Type = new StringTypeStructureImpl("NumberStringType");

    const failures = buildTypesForStructures(
      map,
      failCallback,
      invalidResolver,
      (typeNode, failCallback, subStructureResolver) => {
        void(subStructureResolver);
        if (!Node.isExpressionWithTypeArguments(typeNode)) {
          failCallback("Not an implements node?", typeNode);
          return null;
        }

        const text = typeNode.getText();
        if (text === "NumberStringType")
          return NS_Type;

        if (text === "Foo") {
          failCallback("fail: Foo", typeNode);
          return null;
        }

        if (text === "Bar") {
          failCallback("fail: Bar", typeNode);
          return null;
        }

        failCallback("uh oh", typeNode);
        return null;
      }
    );

    expect(structure.implementsSet.size).toBe(1);
    expect(structure.implementsSet.has(NS_Type)).toBe(true);

    expect(failures.length).toBe(2);
    if (failures.length === 2) {
      const [firstFailure, secondFailure] = failures;
      expect(firstFailure.message).toBe("fail: Foo");
      expect(firstFailure.failingTypeNode).toBe(NumberStringClass.getImplements()[0]);

      expect(secondFailure.message).toBe("fail: Bar");
      expect(secondFailure.failingTypeNode).toBe(NumberStringClass.getImplements()[1]);
    }

    expect(failNode).not.toBe(null);
    expect(failures).not.toEqual([]);
  });
});
