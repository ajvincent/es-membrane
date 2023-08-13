import {
  ModuleKind,
  ModuleResolutionKind,
  Project,
  ProjectOptions,
  ScriptTarget,
  TypeLiteralNode,
  TypeNode,
  VariableDeclaration,
} from "ts-morph";

import convertTypeNode from "#ts-morph_structures/source/bootstrap/convertTypeNode.mjs";
import {
  ArrayTypedStructureImpl,
  ConditionalTypedStructureImpl,
  FunctionTypedStructureImpl,
  FunctionWriterStyle,
  IndexedAccessTypedStructureImpl,
  IntersectionTypedStructureImpl,
  LiteralTypedStructureImpl,
  ParenthesesTypedStructureImpl,
  PrefixOperatorsTypedStructureImpl,
  StringTypedStructureImpl,
  TupleTypedStructureImpl,
  TypeArgumentedTypedStructureImpl,
  TypeStructure,
  UnionTypedStructureImpl
} from "#ts-morph_structures/exports.mjs";
import { TypeNodeToTypeStructureConsole } from "#ts-morph_structures/source/types/TypeNodeToTypeStructure.mjs";

describe("convertTypeNode generates correct type structures, with type", () => {
  let declaration: VariableDeclaration;
  let structure: TypeStructure | null;

  let failMessage: string | undefined;
  let failNode: TypeNode | null;
  function failCallback(message: string, typeNode: TypeNode): void {
    failMessage = message;
    failNode = typeNode;
  }
  failCallback satisfies TypeNodeToTypeStructureConsole;

  beforeAll(() => {
    failMessage = undefined;
    failNode = null;

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
    const sourceFile = project.createSourceFile("file.ts", `
const refSymbol = Symbol("reference symbol");
const A: string;
    `.trim() + "\n");
    declaration = sourceFile.getVariableDeclarationOrThrow("A");
  });
  beforeEach(() => {
    failMessage = undefined;
    failNode = null;
  });

  afterEach(() => structure = null);

  function setTypeStructure(
    rawType: string,
    console: TypeNodeToTypeStructureConsole
  ): void
  {
    declaration.setType(rawType);
    const typeNode = declaration.getTypeNodeOrThrow();
    structure = convertTypeNode(typeNode, console, node => node.getStructure());
  }

  it("any", () => {
    setTypeStructure("any", failCallback);
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl) {
      expect(structure.stringValue).toBe("any");
    }
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("never", () => {
    setTypeStructure("never", failCallback);
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl) {
      expect(structure.stringValue).toBe("never");
    }
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("string", () => {
    setTypeStructure("string", failCallback);
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("string");
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("boolean", () => {
    setTypeStructure("boolean", failCallback);
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("boolean");
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("number", () => {
    setTypeStructure("number", failCallback);
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("number");
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("symbol", () => {
    setTypeStructure("symbol", failCallback);
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("symbol");
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("true", () => {
    setTypeStructure("true", failCallback);
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("true");
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("false", () => {
    setTypeStructure("false", failCallback);
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("false");
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("unknown", () => {
    setTypeStructure("unknown", failCallback);
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("unknown");

    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("null", () => {
    setTypeStructure("null", failCallback);
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("null");

    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("undefined", () => {
    setTypeStructure("undefined", failCallback);
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("undefined");

    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("void", () => {
    setTypeStructure("void", failCallback);
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("void");

    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("12.5", () => {
    setTypeStructure("12.5", failCallback);
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("12.5");
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("string literal 'foo'", () => {
    setTypeStructure(`"foo"`, failCallback);
    expect(structure).toBeInstanceOf(StringTypedStructureImpl)
    if (structure instanceof StringTypedStructureImpl)
      expect(structure.stringValue).toBe("foo");
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it(`(foo), meaning parentheses type`, () => {
    setTypeStructure("(true)", failCallback);
    expect(structure).toBeInstanceOf(ParenthesesTypedStructureImpl);
    if (!(structure instanceof ParenthesesTypedStructureImpl))
      return;
    expect(structure.childType).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure.childType instanceof LiteralTypedStructureImpl)
      expect(structure.childType.stringValue).toBe("true");

    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it(`NumberStringType (identifier)`, () => {
    setTypeStructure(`NumberStringType`, failCallback);
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("NumberStringType");
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("union of string and number", () => {
    setTypeStructure("string | number", failCallback);
    expect(structure).toBeInstanceOf(UnionTypedStructureImpl);
    if (structure instanceof UnionTypedStructureImpl) {
      expect(structure.elements.length).toBe(2);
      expect(structure.elements[0]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((structure.elements[0] as LiteralTypedStructureImpl).stringValue).toBe("string");
      expect(structure.elements[1]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((structure.elements[1] as LiteralTypedStructureImpl).stringValue).toBe("number");
    }
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("intersection of string and number", () => {
    setTypeStructure("string & number", failCallback);
    expect(structure).toBeInstanceOf(IntersectionTypedStructureImpl);
    if (structure instanceof IntersectionTypedStructureImpl) {
      expect(structure.elements.length).toBe(2);
      expect(structure.elements[0]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((structure.elements[0] as LiteralTypedStructureImpl).stringValue).toBe("string");
      expect(structure.elements[1]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((structure.elements[1] as LiteralTypedStructureImpl).stringValue).toBe("number");
    }
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("[string, number]", () => {
    setTypeStructure("[string, number]", failCallback);
    expect(structure).toBeInstanceOf(TupleTypedStructureImpl);
    if (structure instanceof TupleTypedStructureImpl) {
      expect(structure.elements.length).toBe(2);
      expect(structure.elements[0]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((structure.elements[0] as LiteralTypedStructureImpl).stringValue).toBe("string");
      expect(structure.elements[1]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((structure.elements[1] as LiteralTypedStructureImpl).stringValue).toBe("number");
    }
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("string[]", () => {
    setTypeStructure("string[]", failCallback);
    expect(structure).toBeInstanceOf(ArrayTypedStructureImpl);
    if (!(structure instanceof ArrayTypedStructureImpl))
      return;
    expect(structure.objectType).toBeInstanceOf(LiteralTypedStructureImpl);
    expect((structure.objectType as LiteralTypedStructureImpl).stringValue).toBe("string");
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it(`Pick<NumberStringType, "repeatForward">`, () => {
    setTypeStructure(`Pick<NumberStringType, "repeatForward">`, failCallback);
    expect(structure).toBeInstanceOf(TypeArgumentedTypedStructureImpl);
    if (structure instanceof TypeArgumentedTypedStructureImpl) {
      expect(structure.objectType).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((structure.objectType as LiteralTypedStructureImpl).stringValue).toBe("Pick");
      expect(structure.elements.length).toBe(2);
      expect(structure.elements[0]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((structure.elements[0] as LiteralTypedStructureImpl).stringValue).toBe("NumberStringType");
      expect(structure.elements[1]).toBeInstanceOf(StringTypedStructureImpl);
      expect((structure.elements[1] as StringTypedStructureImpl).stringValue).toBe("repeatForward");
    }
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("keyof typeof NumberStringClass", () => {
    setTypeStructure(`keyof typeof NumberStringClass`, failCallback);
    expect(structure).toBeInstanceOf(PrefixOperatorsTypedStructureImpl);
    if (!(structure instanceof PrefixOperatorsTypedStructureImpl))
      return;
    expect(structure.operators).toEqual(["keyof", "typeof"]);
    expect(structure.childType).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure.childType instanceof LiteralTypedStructureImpl)
      expect(structure.childType.stringValue).toBe("NumberStringClass");
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("readonly string[]", () => {
    setTypeStructure(`readonly string[]`, failCallback);

    expect(structure).toBeInstanceOf(PrefixOperatorsTypedStructureImpl);
    if (!(structure instanceof PrefixOperatorsTypedStructureImpl))
      return;
    expect(structure.operators).toEqual(["readonly"]);

    const childStructure = structure.childType;
    expect(childStructure).toBeInstanceOf(ArrayTypedStructureImpl);
    if (childStructure instanceof ArrayTypedStructureImpl) {
      expect(childStructure.objectType).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((childStructure.objectType as LiteralTypedStructureImpl).stringValue).toBe("string");
    }
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("readonly [string, number]", () => {
    setTypeStructure("readonly [string, number]", failCallback);

    expect(structure).toBeInstanceOf(PrefixOperatorsTypedStructureImpl);
    if (!(structure instanceof PrefixOperatorsTypedStructureImpl))
      return;
    expect(structure.operators).toEqual(["readonly"]);

    const childStructure = structure.childType;
    expect(childStructure).toBeInstanceOf(TupleTypedStructureImpl);
    if (childStructure instanceof TupleTypedStructureImpl) {
      expect(childStructure.elements.length).toBe(2);
      expect(childStructure.elements[0]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((childStructure.elements[0] as LiteralTypedStructureImpl).stringValue).toBe("string");
      expect(childStructure.elements[1]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((childStructure.elements[1] as LiteralTypedStructureImpl).stringValue).toBe("number");
    }
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("true extends ReturnsModified ? BaseClassType : void", () => {
    setTypeStructure("true extends ReturnsModified ? BaseClassType : void", failCallback);
    expect(structure).toBeInstanceOf(ConditionalTypedStructureImpl);
    if (!(structure instanceof ConditionalTypedStructureImpl))
      return;

    const { checkType, extendsType, trueType, falseType } = structure;
    const types = [ checkType, extendsType, trueType, falseType ];
    const areAllLiterals = types.every(childType => childType instanceof LiteralTypedStructureImpl);
    expect(areAllLiterals).toBe(true);
    if (!areAllLiterals)
      return;

    expect(
      types.map(type => (type as LiteralTypedStructureImpl).stringValue)
    ).toEqual(["true", "ReturnsModified", "BaseClassType", "void"]);
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it(`NumberStringType["repeatForward"]`, () => {
    setTypeStructure(`NumberStringType["repeatForward"]`, failCallback);
    expect(structure).toBeInstanceOf(IndexedAccessTypedStructureImpl);
    if (!(structure instanceof IndexedAccessTypedStructureImpl))
      return;
    expect(structure.objectType).toBeInstanceOf(LiteralTypedStructureImpl);
    expect(
      (structure.objectType as LiteralTypedStructureImpl).stringValue
    ).toBe("NumberStringType");

    expect(structure.indexType).toBeInstanceOf(StringTypedStructureImpl);
    expect(
      (structure.indexType as StringTypedStructureImpl).stringValue
    ).toBe("repeatForward");
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it(
    `<StringType extends string, NumberType extends number = 1>(s: StringType, n) => boolean`,
    () => {
      setTypeStructure(
        `<StringType extends string, NumberType extends number = 1>(s: StringType, n) => boolean`,
        failCallback
      );
      expect(structure).toBeInstanceOf(FunctionTypedStructureImpl);
      if (!(structure instanceof FunctionTypedStructureImpl))
        return;

      expect(structure.name).toBe("");
      expect(structure.isConstructor).toBe(false);

      expect(structure.typeParameters.length).toBe(2);
      {
        const typeParam = structure.typeParameters[0];
        expect(typeParam.name).toBe("StringType");
        expect(typeParam.constraint).toBe("string");
        expect(typeParam.default).toBe(undefined);
      }

      {
        const typeParam = structure.typeParameters[1];
        expect(typeParam.name).toBe("NumberType");
        expect(typeParam.constraint).toBe("number");
        expect(typeParam.default).toBe("1");
      }

      expect(structure.parameters.length).toBe(2);
      {
        const param = structure.parameters[0];
        expect(param.name.stringValue).toBe("s");
        expect(param.typeStructure).toBeInstanceOf(LiteralTypedStructureImpl);
        expect((param.typeStructure as LiteralTypedStructureImpl).stringValue).toBe("StringType");
      }
      {
        const param = structure.parameters[1];
        expect(param.name.stringValue).toBe("n");
        expect(param.typeStructure).toBe(undefined);
      }

      expect(structure.restParameter).toBe(undefined);
      expect(structure.returnType).not.toBe(undefined);
      if (structure.returnType) {
        expect((structure.returnType as LiteralTypedStructureImpl).stringValue).toBe("boolean");
      }

      expect(structure.writerStyle).toBe(FunctionWriterStyle.Arrow);
      expect(failMessage).toBe(undefined);
      expect(failNode).toBe(null);
    }
  );

  it(
    `new <StringType extends string, NumberType extends number = 1>(s: StringType, n) => boolean`,
    () => {
      setTypeStructure(
        `new <StringType extends string, NumberType extends number = 1>(s: StringType, n) => boolean`,
        failCallback
      );
      expect(structure).toBeInstanceOf(FunctionTypedStructureImpl);
      if (!(structure instanceof FunctionTypedStructureImpl))
        return;

      expect(structure.name).toBe("");
      expect(structure.isConstructor).toBe(true);

      expect(structure.typeParameters.length).toBe(2);
      {
        const typeParam = structure.typeParameters[0];
        expect(typeParam.name).toBe("StringType");
        expect(typeParam.constraint).toBe("string");
        expect(typeParam.default).toBe(undefined);
      }

      {
        const typeParam = structure.typeParameters[1];
        expect(typeParam.name).toBe("NumberType");
        expect(typeParam.constraint).toBe("number");
        expect(typeParam.default).toBe("1");
      }

      expect(structure.parameters.length).toBe(2);
      {
        const param = structure.parameters[0];
        expect(param.name.stringValue).toBe("s");
        expect(param.typeStructure).toBeInstanceOf(LiteralTypedStructureImpl);
        expect((param.typeStructure as LiteralTypedStructureImpl).stringValue).toBe("StringType");
      }
      {
        const param = structure.parameters[1];
        expect(param.name.stringValue).toBe("n");
        expect(param.typeStructure).toBe(undefined);
      }

      expect(structure.restParameter).toBe(undefined);
      expect(structure.returnType).not.toBe(undefined);
      if (structure.returnType) {
        expect((structure.returnType as LiteralTypedStructureImpl).stringValue).toBe("boolean");
      }

      expect(structure.writerStyle).toBe(FunctionWriterStyle.Arrow);
      expect(failMessage).toBe(undefined);
      expect(failNode).toBe(null);
    }
  );

  it(`{ foo: true } (object literal)`, () => {
    setTypeStructure(`{ foo: true }`, failCallback);
    expect(structure).toBe(null);

    expect<string>(
      failMessage as unknown as string
    ).toBe(`unsupported type node "TypeLiteral" at line 2, column 9`);
    expect(failNode).toBeInstanceOf(TypeLiteralNode);
  });
});
