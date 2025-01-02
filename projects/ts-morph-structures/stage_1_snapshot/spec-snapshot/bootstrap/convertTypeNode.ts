import {
  ModuleKind,
  ModuleResolutionKind,
  Project,
  ProjectOptions,
  ScriptTarget,
  TypeNode,
  VariableDeclaration,
} from "ts-morph";

import convertTypeNode from "#stage_one/prototype-snapshot/bootstrap/convertTypeNode.js";

import {
  ArrayTypedStructureImpl,
  ConditionalTypedStructureImpl,
  FunctionTypedStructureImpl,
  FunctionWriterStyle,
  ImportTypedStructureImpl,
  IndexedAccessTypedStructureImpl,
  InferTypedStructureImpl,
  IntersectionTypedStructureImpl,
  LiteralTypedStructureImpl,
  MappedTypeTypedStructureImpl,
  MemberedObjectTypeStructureImpl,
  ParenthesesTypedStructureImpl,
  PrefixOperatorsTypedStructureImpl,
  QualifiedNameTypedStructureImpl,
  StringTypedStructureImpl,
  TemplateLiteralTypedStructureImpl,
  TupleTypedStructureImpl,
  TypeArgumentedTypedStructureImpl,
  TypeStructureKind,
  TypeStructures,
  UnionTypedStructureImpl,
  createCodeBlockWriter
} from "#stage_one/prototype-snapshot/exports.js";

import {
  TypeNodeToTypeStructureConsole
} from "#stage_one/prototype-snapshot/types/TypeNodeToTypeStructure.js";

describe("convertTypeNode generates correct type structures, with type", () => {
  let declaration: VariableDeclaration;
  let structure: TypeStructures | null;

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
enum NumberEnum {
  one = 1,
  two,
  three,
}

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
    expect(structure.childTypes[0]).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure.childTypes[0] instanceof LiteralTypedStructureImpl)
      expect(structure.childTypes[0].stringValue).toBe("true");

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
      expect(structure.childTypes.length).toBe(2);
      expect(structure.childTypes[0]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((structure.childTypes[0] as LiteralTypedStructureImpl).stringValue).toBe("string");
      expect(structure.childTypes[1]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((structure.childTypes[1] as LiteralTypedStructureImpl).stringValue).toBe("number");
    }
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("intersection of string and number", () => {
    setTypeStructure("string & number", failCallback);
    expect(structure).toBeInstanceOf(IntersectionTypedStructureImpl);
    if (structure instanceof IntersectionTypedStructureImpl) {
      expect(structure.childTypes.length).toBe(2);
      expect(structure.childTypes[0]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((structure.childTypes[0] as LiteralTypedStructureImpl).stringValue).toBe("string");
      expect(structure.childTypes[1]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((structure.childTypes[1] as LiteralTypedStructureImpl).stringValue).toBe("number");
    }
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("[string, number]", () => {
    setTypeStructure("[string, number]", failCallback);
    expect(structure).toBeInstanceOf(TupleTypedStructureImpl);
    if (structure instanceof TupleTypedStructureImpl) {
      expect(structure.childTypes.length).toBe(2);
      expect(structure.childTypes[0]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((structure.childTypes[0] as LiteralTypedStructureImpl).stringValue).toBe("string");
      expect(structure.childTypes[1]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((structure.childTypes[1] as LiteralTypedStructureImpl).stringValue).toBe("number");
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
      expect(structure.childTypes.length).toBe(2);
      expect(structure.childTypes[0]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((structure.childTypes[0] as LiteralTypedStructureImpl).stringValue).toBe("NumberStringType");
      expect(structure.childTypes[1]).toBeInstanceOf(StringTypedStructureImpl);
      expect((structure.childTypes[1] as StringTypedStructureImpl).stringValue).toBe("repeatForward");
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
    expect(structure.childTypes[0]).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure.childTypes[0] instanceof LiteralTypedStructureImpl)
      expect(structure.childTypes[0].stringValue).toBe("NumberStringClass");
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("readonly string[]", () => {
    setTypeStructure(`readonly string[]`, failCallback);

    expect(structure).toBeInstanceOf(PrefixOperatorsTypedStructureImpl);
    if (!(structure instanceof PrefixOperatorsTypedStructureImpl))
      return;
    expect(structure.operators).toEqual(["readonly"]);

    const childStructure = structure.childTypes[0];
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

    const childStructure = structure.childTypes[0];
    expect(childStructure).toBeInstanceOf(TupleTypedStructureImpl);
    if (childStructure instanceof TupleTypedStructureImpl) {
      expect(childStructure.childTypes.length).toBe(2);
      expect(childStructure.childTypes[0]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((childStructure.childTypes[0] as LiteralTypedStructureImpl).stringValue).toBe("string");
      expect(childStructure.childTypes[1]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((childStructure.childTypes[1] as LiteralTypedStructureImpl).stringValue).toBe("number");
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
      types.map(type => type.stringValue)
    ).toEqual(["true", "ReturnsModified", "BaseClassType", "void"]);
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it(`NumberEnum.one (qualified name)`, () => {
    setTypeStructure(`NumberEnum.one`, failCallback);
    expect(structure).toBeInstanceOf(QualifiedNameTypedStructureImpl);

    if (structure instanceof QualifiedNameTypedStructureImpl) {
      expect(structure.childTypes.length).toBe(2);
      expect(structure.childTypes[0]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((structure.childTypes[0] as LiteralTypedStructureImpl).stringValue).toBe("NumberEnum");
      expect(structure.childTypes[1]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((structure.childTypes[1] as LiteralTypedStructureImpl).stringValue).toBe("one");
    }
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

  it('{ [key in "one" | "two" as `${key}Index`]: boolean; } (mapped type)', () => {
    setTypeStructure('{ -readonly [key in "one" | "two" as `${key}Index`]+?: boolean; }', failCallback);
    expect(structure).toBeInstanceOf(MappedTypeTypedStructureImpl);
    if (!(structure instanceof MappedTypeTypedStructureImpl))
      return;

    expect(structure.readonlyToken).toBe("-readonly");

    expect(structure.parameter?.name).toBe("key");
    expect(structure.parameter?.constraint).toBe(`"one" | "two"`);

    const nameWriter = createCodeBlockWriter();
    if (structure.asName) {
      structure.asName.writerFunction(nameWriter);
    }
    expect<string>(nameWriter.toString()).toBe('`${key}Index`');

    expect(structure.questionToken).toBe("+?");

    expect((structure.type as LiteralTypedStructureImpl)?.stringValue).toBe("boolean");

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

  it('`one${"A" | "B"}two${"C" | "D"}three${"E" | "F"}` (template literal)', () => {
    setTypeStructure('`one${"A" | "B"}two${"C" | "D"}three${"E" | "F"}`', failCallback);
    expect(structure).toBeInstanceOf(TemplateLiteralTypedStructureImpl);
    if (!(structure instanceof TemplateLiteralTypedStructureImpl))
      return;

    expect(structure.childTypes.length).toBe(6);
    expect(structure.childTypes[0]).toBe("one");

    expect(structure.childTypes[1]).toBeInstanceOf(UnionTypedStructureImpl);
    if (structure.childTypes[1] instanceof UnionTypedStructureImpl) {
      const unionElements = structure.childTypes[1].childTypes;
      expect(unionElements.length).toBe(2);
      expect((unionElements[0] as StringTypedStructureImpl)?.stringValue).toBe("A");
      expect((unionElements[1] as StringTypedStructureImpl)?.stringValue).toBe("B");
    }

    expect(structure.childTypes[2]).toBe("two");

    expect(structure.childTypes[3]).toBeInstanceOf(UnionTypedStructureImpl);
    if (structure.childTypes[3] instanceof UnionTypedStructureImpl) {
      const unionElements = structure.childTypes[3].childTypes;
      expect(unionElements.length).toBe(2);
      expect((unionElements[0] as StringTypedStructureImpl)?.stringValue).toBe("C");
      expect((unionElements[1] as StringTypedStructureImpl)?.stringValue).toBe("D");
    }

    expect(structure.childTypes[4]).toBe("three");

    expect(structure.childTypes[5]).toBeInstanceOf(UnionTypedStructureImpl);
    if (structure.childTypes[5] instanceof UnionTypedStructureImpl) {
      const unionElements = structure.childTypes[5].childTypes;
      expect(unionElements.length).toBe(2);
      expect((unionElements[0] as StringTypedStructureImpl)?.stringValue).toBe("E");
      expect((unionElements[1] as StringTypedStructureImpl)?.stringValue).toBe("F");
    }

    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it('`${string}${Postfix}` (template literal)', () => {
    setTypeStructure('`${string}${Postfix}`', failCallback);
    expect(structure).toBeInstanceOf(TemplateLiteralTypedStructureImpl);
    if (!(structure instanceof TemplateLiteralTypedStructureImpl))
      return;

    expect(structure.childTypes.length).toBe(2);
    const [ stringLiteral, postfixLiteral ] = structure.childTypes;
    expect(typeof stringLiteral).toBe("object");
    if (typeof stringLiteral === "object") {
      expect(stringLiteral.kind).toBe(TypeStructureKind.Literal);
      expect((stringLiteral as LiteralTypedStructureImpl).stringValue).toBe("string");
    }

    expect(typeof postfixLiteral).toBe("object");
    if (typeof postfixLiteral === "object") {
      expect(postfixLiteral.kind).toBe(TypeStructureKind.Literal);
      expect((postfixLiteral as LiteralTypedStructureImpl).stringValue).toBe("Postfix");
    }

    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it(`{ foo: true } (object literal)`, () => {
    setTypeStructure(`{ foo: true }`, failCallback);
    expect(structure).toBeInstanceOf(MemberedObjectTypeStructureImpl);

    if (!(structure instanceof MemberedObjectTypeStructureImpl))
      return;
    expect(structure.callSignatures.length).toBe(0);
    expect(structure.constructSignatures.length).toBe(0);
    expect(structure.indexSignatures.length).toBe(0);
    expect(structure.methods.length).toBe(0);
    expect(structure.properties.length).toBe(1);

    const propertyStructure = structure.properties[0];
    if (!propertyStructure)
      return;

    expect(propertyStructure.name).toBe("foo");
    expect(propertyStructure.type).toBe("true");

    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("...infer Type", () => {
    setTypeStructure(
      `Elements extends readonly symbol[] ? Elements extends [ infer Head, ...infer Tail] ? Head : never : never`,
      failCallback
    );

    expect(structure).toBeInstanceOf(ConditionalTypedStructureImpl);
    if (!(structure instanceof ConditionalTypedStructureImpl))
      return;

    structure = structure.trueType;
    expect(structure).toBeInstanceOf(ConditionalTypedStructureImpl);
    if (!(structure instanceof ConditionalTypedStructureImpl))
      return;

    structure = structure.extendsType;
    expect(structure).toBeInstanceOf(TupleTypedStructureImpl);
    if (!(structure instanceof TupleTypedStructureImpl))
      return;

    structure = structure.childTypes[1];
    expect(structure).toBeInstanceOf(PrefixOperatorsTypedStructureImpl);
    if (!(structure instanceof PrefixOperatorsTypedStructureImpl))
      return;

    // now the real test
    structure = structure.childTypes[0];
    expect(structure).toBeInstanceOf(InferTypedStructureImpl);
    if (!(structure instanceof InferTypedStructureImpl))
      return;

    expect(structure.typeParameter.name).toBe("Tail");

    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it(`import("bar").NumberStringType<foo> (import type)`, () => {
    setTypeStructure(`import("bar").NumberStringType<foo>`, failCallback);

    expect(structure).toBeInstanceOf(ImportTypedStructureImpl);
    if (!(structure instanceof ImportTypedStructureImpl))
      return;

    expect(structure.argument.stringValue).toBe("bar");
    expect(structure.qualifier!.kind).toBe(TypeStructureKind.Literal);
    expect((structure.qualifier as LiteralTypedStructureImpl).stringValue).toBe("NumberStringType");
    expect(structure.childTypes.length).toBe(1);
    const typeArg = structure.childTypes[0];
    expect(typeArg.kind).toBe(TypeStructureKind.Literal);
    if (typeArg.kind === TypeStructureKind.Literal) {
      expect(typeArg.stringValue).toBe("foo");
    }
  });
});
