import {
  ClassDeclarationImpl,
  FunctionDeclarationImpl,
  IndexSignatureDeclarationImpl,
  InterfaceDeclarationImpl,
  LiteralTypedStructureImpl,
  TypeParameterDeclarationImpl,
  VariableDeclarationImpl
} from "#stage_one/prototype-snapshot/exports.js";

import buildTypesForStructures from "#stage_one/prototype-snapshot/bootstrap/buildTypesForStructures.js";
import { NodeWithStructures } from "#stage_one/prototype-snapshot/bootstrap/structureToNodeMap.js";
import type {
  TypeNodeToTypeStructureConsole
} from "#stage_one/prototype-snapshot/types/TypeNodeToTypeStructure.js";
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
  Structures,
  TypeNode,
} from "ts-morph";

describe("buildTypesForStructures applies a type node converter for each structure", () => {
  let sourceFile: SourceFile;

  let failMessage: string | undefined;
  let failNode: TypeNode | null
  function failCallback(message: string, typeNode: TypeNode): void {
    failMessage = message;
    failNode = typeNode;
  }
  failCallback satisfies TypeNodeToTypeStructureConsole;

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

    const map = new Map<Structures, Node>([
      [structure, variableWithType]
    ]);

    const literal = new LiteralTypedStructureImpl("string");

    const failures = buildTypesForStructures(
      map,
      failCallback,
      (node: NodeWithStructures) => node.getStructure(),
      (typeNode, failCallback) => {
        if (typeNode === variableWithType.getTypeNode())
          return literal;
        failCallback("uh oh", typeNode);
        return null;
      }
    );

    expect(structure.typeStructure).toBe(literal);
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

    const map = new Map<Structures, Node>([
      [structure, foo]
    ]);

    const literal = new LiteralTypedStructureImpl("boolean");

    const failures = buildTypesForStructures(
      map,
      failCallback,
      (node: NodeWithStructures) => node.getStructure(),
      (typeNode, failCallback) => {
        if (typeNode === foo.getReturnTypeNodeOrThrow())
          return literal;
        failCallback("uh oh", typeNode);
        return null;
      }
    );

    expect(structure.returnTypeStructure).toBe(literal);
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
    expect(failures).toEqual([]);
  });

  it("having a .constraint and a .default field", () => {
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

    const map = new Map<Structures, Node>([
      [structure, NumberTypeNode]
    ]);

    const numberLiteral = new LiteralTypedStructureImpl("number");
    const oneLiteral = new LiteralTypedStructureImpl("one");

    const failures = buildTypesForStructures(
      map,
      failCallback,
      (node: NodeWithStructures) => node.getStructure(),
      (typeNode, failCallback) => {
        if (typeNode === NumberTypeNode.getConstraintOrThrow())
          return numberLiteral;
        if (typeNode === NumberTypeNode.getDefaultOrThrow())
          return oneLiteral;
        failCallback("uh oh", typeNode);
        return null;
      }
    );

    expect(structure.constraintStructure).toBe(numberLiteral);
    expect(structure.defaultStructure).toBe(oneLiteral);
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
    expect(failures).toEqual([]);
  });

  it("having a keyType field (index signature)", () => {
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

    const map = new Map<Structures, Node>([
      [structure, keyIndex]
    ]);

    const StringType = new LiteralTypedStructureImpl("string");
    const BooleanType = new LiteralTypedStructureImpl("boolean");

    const failures = buildTypesForStructures(
      map,
      failCallback,
      (node: NodeWithStructures) => node.getStructure(),
      (typeNode, failCallback) => {
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

    const map = new Map<Structures, Node>([
      [structure, NumberStringClass]
    ]);

    const BaseClass = new LiteralTypedStructureImpl("BaseClass");
    const NS_Type = new LiteralTypedStructureImpl("NumberStringType");
    const Foo = new LiteralTypedStructureImpl("Foo");

    const failures = buildTypesForStructures(
      map,
      failCallback,
      (node: NodeWithStructures) => node.getStructure(),
      (typeNode, failCallback) => {
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

    const NumberStringClass = sourceFile.getInterfaceOrThrow("NumberStringExtendedClass");
    const structureOriginal = NumberStringClass.getStructure();
    const structure = InterfaceDeclarationImpl.clone(structureOriginal);

    const map = new Map<Structures, Node>([
      [structure, NumberStringClass]
    ]);

    const NS_Type = new LiteralTypedStructureImpl("NumberStringClass");
    const Foo = new LiteralTypedStructureImpl("Foo");

    const failures = buildTypesForStructures(
      map,
      failCallback,
      (node: NodeWithStructures) => node.getStructure(),
      (typeNode, failCallback) => {
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

    const map = new Map<Structures, Node>([
      [structure, variableWithType]
    ]);

    const failures = buildTypesForStructures(
      map,
      failCallback,
      (node: NodeWithStructures) => node.getStructure(),
      (typeNode, failCallback) => {
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

    const map = new Map<Structures, Node>([
      [structure, NumberStringClass]
    ]);

    const NS_Type = new LiteralTypedStructureImpl("NumberStringType");

    const failures = buildTypesForStructures(
      map,
      failCallback,
      (node: NodeWithStructures) => node.getStructure(),
      (typeNode, failCallback) => {
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
      expect(firstFailure.typeNode).toBe(NumberStringClass.getImplements()[0]);

      expect(secondFailure.message).toBe("fail: Bar");
      expect(secondFailure.typeNode).toBe(NumberStringClass.getImplements()[1]);
    }

    expect(failNode).not.toBe(null);
    expect(failures).not.toEqual([]);
  });
});
