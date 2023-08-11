import { ClassDeclarationImpl, FunctionDeclarationImpl, LiteralTypedStructureImpl, TypeParameterDeclarationImpl, VariableDeclarationImpl } from "#ts-morph_structures/exports.mjs";
import buildTypesForStructures from "#ts-morph_structures/source/bootstrap/buildTypesForStructures.mjs";
import { TypeNodeToTypeStructureConsole } from "#ts-morph_structures/source/types/TypeNodeToTypeStructure.mjs";
import {
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

    const failures = buildTypesForStructures(map, failCallback, (typeNode, failCallback) => {
      if (typeNode === variableWithType.getTypeNode())
        return literal;
      failCallback("uh oh", typeNode);
      return null;
    });

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

    const failures = buildTypesForStructures(map, failCallback, (typeNode, failCallback) => {
      if (typeNode === foo.getReturnTypeNodeOrThrow())
        return literal;
      failCallback("uh oh", typeNode);
      return null;
    });

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

    const failures = buildTypesForStructures(map, failCallback, (typeNode, failCallback) => {
      if (typeNode === NumberTypeNode.getConstraintOrThrow())
        return numberLiteral;
      if (typeNode === NumberTypeNode.getDefaultOrThrow())
        return oneLiteral;
      failCallback("uh oh", typeNode);
      return null;
    });

    expect(structure.constraintStructure).toBe(numberLiteral);
    expect(structure.defaultStructure).toBe(oneLiteral);
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
    expect(failures).toEqual([]);
  });

  it("having an .implements array", () => {
    sourceFile.addClass({
      name: "NumberStringClass",
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

    const NS_Type = new LiteralTypedStructureImpl("NumberStringType");
    const Foo = new LiteralTypedStructureImpl("Foo");

    const failures = buildTypesForStructures(map, failCallback, (typeNode, failCallback) => {
      if (!Node.isExpressionWithTypeArguments(typeNode)) {
        failCallback("Not an implements node?", typeNode);
        return null;
      }

      const text = typeNode.getText();
      if (text === "NumberStringType")
        return NS_Type;

      if (text === "Foo")
        return Foo;

      failCallback("uh oh", typeNode);
      return null;
    });

    expect(structure.implementsSet.size).toBe(2);
    expect(structure.implementsSet.has(NS_Type)).toBe(true);
    expect(structure.implementsSet.has(Foo)).toBe(true);
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

    const failures = buildTypesForStructures(map, failCallback, (typeNode, failCallback) => {
      failCallback("uh oh", typeNode);
      return null;
    });

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

    const failures = buildTypesForStructures(map, failCallback, (typeNode, failCallback) => {
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
    });

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
