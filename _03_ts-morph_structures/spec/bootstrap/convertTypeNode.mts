import ts from "ts-morph";

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

describe("convertTypeNode generates correct type structures, with type", () => {
  let declaration: ts.VariableDeclaration;
  let structure: TypeStructure | null;

  beforeAll(() => {
    const TSC_CONFIG: ts.ProjectOptions = {
      "compilerOptions": {
        "lib": ["es2022"],
        "module": ts.ModuleKind.ESNext,
        "target": ts.ScriptTarget.ESNext,
        "moduleResolution": ts.ModuleResolutionKind.NodeNext,
      },
      skipAddingFilesFromTsConfig: true,
      useInMemoryFileSystem: true,
    };

    const project = new ts.Project(TSC_CONFIG);
    const sourceFile = project.createSourceFile("file.ts", `
const refSymbol = Symbol("reference symbol");
const A: string;
    `.trim() + "\n");
    declaration = sourceFile.getVariableDeclarationOrThrow("A");
  });

  afterEach(() => structure = null);

  function setTypeStructure(
    rawType: string,
    console: Pick<Console, "log"> | null = null
  ): void
  {
    declaration.setType(rawType);
    const typeNode = declaration.getTypeNodeOrThrow();
    void(console);
    structure = convertTypeNode(typeNode);
  }

  it("any", () => {
    setTypeStructure("any");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl) {
      expect(structure.stringValue).toBe("any");
    }
  });

  it("never", () => {
    setTypeStructure("never");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl) {
      expect(structure.stringValue).toBe("never");
    }
  });

  it("string", () => {
    setTypeStructure("string");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("string");
  });

  it("boolean", () => {
    setTypeStructure("boolean");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("boolean");
  });

  it("number", () => {
    setTypeStructure("number");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("number");
  });

  it("symbol", () => {
    setTypeStructure("symbol");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("symbol");
  });

  it("true", () => {
    setTypeStructure("true");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("true");
  });

  it("false", () => {
    setTypeStructure("false");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("false");
  });

  it("unknown", () => {
    setTypeStructure("unknown");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("unknown");
  });

  it("null", () => {
    setTypeStructure("null");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("null");
  });

  it("undefined", () => {
    setTypeStructure("undefined");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("undefined");
  });

  it("void", () => {
    setTypeStructure("void");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("void");
  });

  it("12.5", () => {
    setTypeStructure("12.5");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("12.5");
  });

  it("string literal 'foo'", () => {
    setTypeStructure(`"foo"`);
    expect(structure).toBeInstanceOf(StringTypedStructureImpl)
    if (structure instanceof StringTypedStructureImpl)
      expect(structure.stringValue).toBe("foo");
  });

  it(`(foo), meaning parentheses type`, () => {
    setTypeStructure("(true)");
    expect(structure).toBeInstanceOf(ParenthesesTypedStructureImpl);
    if (!(structure instanceof ParenthesesTypedStructureImpl))
      return;
    expect(structure.childType).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure.childType instanceof LiteralTypedStructureImpl)
      expect(structure.childType.stringValue).toBe("true");
  });

  it(`NumberStringType (identifier)`, () => {
    setTypeStructure(`NumberStringType`);
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("NumberStringType");
  });

  it("union of string and number", () => {
    setTypeStructure("string | number");
    expect(structure).toBeInstanceOf(UnionTypedStructureImpl);
    if (structure instanceof UnionTypedStructureImpl) {
      expect(structure.elements.length).toBe(2);
      expect(structure.elements[0]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((structure.elements[0] as LiteralTypedStructureImpl).stringValue).toBe("string");
      expect(structure.elements[1]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((structure.elements[1] as LiteralTypedStructureImpl).stringValue).toBe("number");
    }
  });

  it("intersection of string and number", () => {
    setTypeStructure("string & number");
    expect(structure).toBeInstanceOf(IntersectionTypedStructureImpl);
    if (structure instanceof IntersectionTypedStructureImpl) {
      expect(structure.elements.length).toBe(2);
      expect(structure.elements[0]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((structure.elements[0] as LiteralTypedStructureImpl).stringValue).toBe("string");
      expect(structure.elements[1]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((structure.elements[1] as LiteralTypedStructureImpl).stringValue).toBe("number");
    }
  });

  it("[string, number]", () => {
    setTypeStructure("[string, number]");
    expect(structure).toBeInstanceOf(TupleTypedStructureImpl);
    if (structure instanceof TupleTypedStructureImpl) {
      expect(structure.elements.length).toBe(2);
      expect(structure.elements[0]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((structure.elements[0] as LiteralTypedStructureImpl).stringValue).toBe("string");
      expect(structure.elements[1]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((structure.elements[1] as LiteralTypedStructureImpl).stringValue).toBe("number");
    }
  });

  it("string[]", () => {
    setTypeStructure("string[]");
    expect(structure).toBeInstanceOf(ArrayTypedStructureImpl);
    if (!(structure instanceof ArrayTypedStructureImpl))
      return;
    expect(structure.objectType).toBeInstanceOf(LiteralTypedStructureImpl);
    expect((structure.objectType as LiteralTypedStructureImpl).stringValue).toBe("string");
  });

  it(`Pick<NumberStringType, "repeatForward">`, () => {
    setTypeStructure(`Pick<NumberStringType, "repeatForward">`);
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
  });

  it("keyof typeof NumberStringClass", () => {
    setTypeStructure(`keyof typeof NumberStringClass`);
    expect(structure).toBeInstanceOf(PrefixOperatorsTypedStructureImpl);
    if (!(structure instanceof PrefixOperatorsTypedStructureImpl))
      return;
    expect(structure.operators).toEqual(["keyof", "typeof"]);
    expect(structure.childType).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure.childType instanceof LiteralTypedStructureImpl)
      expect(structure.childType.stringValue).toBe("NumberStringClass");
  });

  it("readonly string[]", () => {
    setTypeStructure(`readonly string[]`);

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
  });

  it("readonly [string, number]", () => {
    setTypeStructure("readonly [string, number]");

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
  });

  it("true extends ReturnsModified ? BaseClassType : void", () => {
    setTypeStructure("true extends ReturnsModified ? BaseClassType : void");
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
  });

  it(`NumberStringType["repeatForward"]`, () => {
    setTypeStructure(`NumberStringType["repeatForward"]`);
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
  });

  it(
    `<StringType extends string, NumberType extends number = 1>(s: StringType, n) => boolean`,
    () => {
      setTypeStructure(
        `<StringType extends string, NumberType extends number = 1>(s: StringType, n) => boolean`
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
    }
  );
});
