import {
  ModuleKind,
  ModuleResolutionKind,
  Project,
  ProjectOptions,
  ScriptTarget,
  TypeNode,
  VariableDeclaration,
} from "ts-morph";

import {
  ArrayTypeStructureImpl,
  ConditionalTypeStructureImpl,
  FunctionTypeStructureImpl,
  FunctionWriterStyle,
  LiteralTypeStructureImpl,
  IndexedAccessTypeStructureImpl,
  InferTypeStructureImpl,
  IntersectionTypeStructureImpl,
  MappedTypeStructureImpl,
  MemberedObjectTypeStructureImpl,
  NumberTypeStructureImpl,
  ParenthesesTypeStructureImpl,
  PrefixOperatorsTypeStructureImpl,
  QualifiedNameTypeStructureImpl,
  StringTypeStructureImpl,
  TemplateLiteralTypeStructureImpl,
  TupleTypeStructureImpl,
  TypeArgumentedTypeStructureImpl,
  TypePredicateTypeStructureImpl,
  UnionTypeStructureImpl,
  TypeStructures
} from "#stage_two/snapshot/source/exports.js";

import {
  StructureClassesMap
} from "#stage_two/snapshot/source/internal-exports.js";

import convertTypeNode from "#stage_two/snapshot/source/bootstrap/convertTypeNode.js";

import type {
  TypeNodeToTypeStructureConsole
} from "#stage_two/snapshot/source/bootstrap/types/conversions.js";

describe("convertTypeNode generates correct type structures, with type", () => {
  //#region set-up, tear-down
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

let A: string;
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
    structure = convertTypeNode(
      typeNode,
      console,
      node => StructureClassesMap.clone(node.getStructure())
    );
  }
  //#endregion set-up, teardown

  //#region literals

  describe("string keyword", () => {
    function stringSpec(s: string): void {
      it(s, () => {
        setTypeStructure(s, failCallback);
        expect(structure).toBe(LiteralTypeStructureImpl.get(s));
        expect(failMessage).toBeUndefined();
        expect(failNode).toBeNull();
      });
    }

    stringSpec("any");
    stringSpec("boolean");
    stringSpec("false");
    stringSpec("never");
    stringSpec("number");
    stringSpec("null");
    stringSpec("object");
    stringSpec("string");
    stringSpec("symbol");
    stringSpec("true");
    stringSpec("undefined");
    stringSpec("unknown");
    stringSpec("void");
  });

  it("number literal", () => {
    setTypeStructure("12.5", failCallback);
    expect(structure).toBe(NumberTypeStructureImpl.get(12.5));
    expect(failMessage).toBeUndefined()
    expect(failNode).toBeNull();
  });

  it(`identifier (NumberStringType)`, () => {
    setTypeStructure(`NumberStringType`, failCallback);
    expect(structure).toBe(LiteralTypeStructureImpl.get("NumberStringType"));
    expect(failMessage).toBeUndefined();
    expect(failNode).toBeNull();
  });

  //#endregion literals

  //#region complex types
  it("Array: of string", () => {
    setTypeStructure("string[]", failCallback);
    expect(structure).toBeInstanceOf(ArrayTypeStructureImpl);
    if (!(structure instanceof ArrayTypeStructureImpl))
      return;
    expect(structure.objectType).toBe(LiteralTypeStructureImpl.get("string"));
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("Conditional: true extends ReturnsModified ? BaseClassType : void", () => {
    setTypeStructure("true extends ReturnsModified ? BaseClassType : void", failCallback);
    expect(structure).toBeInstanceOf(ConditionalTypeStructureImpl);
    if (!(structure instanceof ConditionalTypeStructureImpl))
      return;

    const { checkType, extendsType, trueType, falseType } = structure;
    const types = [ checkType, extendsType, trueType, falseType ];

    expect(types).toEqual([
      LiteralTypeStructureImpl.get("true"),
      LiteralTypeStructureImpl.get("ReturnsModified"),
      LiteralTypeStructureImpl.get("BaseClassType"),
      LiteralTypeStructureImpl.get("void")
    ]);
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it(
    `Function: <StringType extends string, NumberType extends number = 1>(s: StringType, n) => boolean`,
    () => {
      setTypeStructure(
        `<StringType extends string, NumberType extends number = 1>(s: StringType, n) => boolean`,
        failCallback
      );
      expect(structure).toBeInstanceOf(FunctionTypeStructureImpl);
      if (!(structure instanceof FunctionTypeStructureImpl))
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
        expect(param.name).toBe("s");
        expect(param.typeStructure).toBe(LiteralTypeStructureImpl.get("StringType"));
      }
      {
        const param = structure.parameters[1];
        expect(param.name).toBe("n");
        expect(param.typeStructure).toBe(undefined);
      }

      expect(structure.restParameter).toBe(undefined);
      expect(structure.returnType).toBe(LiteralTypeStructureImpl.get("boolean"));

      expect(structure.writerStyle).toBe(FunctionWriterStyle.Arrow);
      expect(failMessage).toBe(undefined);
      expect(failNode).toBe(null);
    }
  );

  it(
    `Function: new <StringType extends string, NumberType extends number = 1>(s: StringType, n) => boolean`,
    () => {
      setTypeStructure(
        `new <StringType extends string, NumberType extends number = 1>(s: StringType, n) => boolean`,
        failCallback
      );
      expect(structure).toBeInstanceOf(FunctionTypeStructureImpl);
      if (!(structure instanceof FunctionTypeStructureImpl))
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
        expect(param.name).toBe("s");
        expect(param.typeStructure).toBe(LiteralTypeStructureImpl.get("StringType"));
      }
      {
        const param = structure.parameters[1];
        expect(param.name).toBe("n");
        expect(param.typeStructure).toBe(undefined);
      }

      expect(structure.restParameter).toBe(undefined);
      expect(structure.returnType).toBe(LiteralTypeStructureImpl.get("boolean"));

      expect(structure.writerStyle).toBe(FunctionWriterStyle.Arrow);
      expect(failMessage).toBe(undefined);
      expect(failNode).toBe(null);
    }
  );

  it(`Function: (value: object | boolean) => value is object`, () => {
    setTypeStructure(`(value: object | boolean) => value is object`, failCallback);
    expect(structure).toBeInstanceOf(FunctionTypeStructureImpl);
    if (!(structure instanceof FunctionTypeStructureImpl))
      return;

    expect(structure.name).toBe("");
    expect(structure.isConstructor).toBe(false);

    expect(structure.typeParameters.length).toBe(0);
    expect(structure.parameters.length).toBe(1);
    {
      const param = structure.parameters[0];
      expect(param.name).toBe("value");
      expect(param.typeStructure).toBeInstanceOf(UnionTypeStructureImpl);

      if (param.typeStructure instanceof UnionTypeStructureImpl) {
        expect(param.typeStructure.childTypes).toEqual([
          LiteralTypeStructureImpl.get("object"),
          LiteralTypeStructureImpl.get("boolean")
        ]);
      }
    }

    expect(structure.restParameter).toBe(undefined);
    const { returnType } = structure;
    expect(returnType).not.toBeUndefined();
    if (returnType) {
      expect(returnType).toBeInstanceOf(TypePredicateTypeStructureImpl);
      if (returnType instanceof TypePredicateTypeStructureImpl) {
        expect(returnType.hasAssertsKeyword).toBe(false);
        expect(returnType.parameterName).toBe(LiteralTypeStructureImpl.get("value"));
        expect(returnType.isType).toBe(LiteralTypeStructureImpl.get("object"));
      }
    }

    expect(structure.writerStyle).toBe(FunctionWriterStyle.Arrow);
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it(`IndexedAccess: NumberStringType["repeatForward"]`, () => {
    setTypeStructure(`NumberStringType["repeatForward"]`, failCallback);
    expect(structure).toBeInstanceOf(IndexedAccessTypeStructureImpl);
    if (!(structure instanceof IndexedAccessTypeStructureImpl))
      return;
    expect(structure.objectType).toBe(LiteralTypeStructureImpl.get("NumberStringType"));

    const indexType = structure.childTypes[0];
    expect(indexType).toBeInstanceOf(StringTypeStructureImpl);
    if (indexType instanceof StringTypeStructureImpl) {
      expect(indexType.stringValue).toBe("repeatForward");
    }
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("Infer: infer Tail", () => {
    setTypeStructure(
      `[] extends readonly symbol[] ? [] extends [ infer Head, ...infer Tail] ? Head : never : never`,
      failCallback
    );

    expect(structure).toBeInstanceOf(ConditionalTypeStructureImpl);
    if (!(structure instanceof ConditionalTypeStructureImpl))
      return;

    structure = structure.trueType;
    expect(structure).toBeInstanceOf(ConditionalTypeStructureImpl);
    if (!(structure instanceof ConditionalTypeStructureImpl))
      return;

    structure = structure.extendsType;
    expect(structure).toBeInstanceOf(TupleTypeStructureImpl);
    if (!(structure instanceof TupleTypeStructureImpl))
      return;

    structure = structure.childTypes[1];
    expect(structure).toBeInstanceOf(PrefixOperatorsTypeStructureImpl);
    if (!(structure instanceof PrefixOperatorsTypeStructureImpl))
      return;

    // now the real test
    structure = structure.objectType;
    expect(structure).toBeInstanceOf(InferTypeStructureImpl);
    if (!(structure instanceof InferTypeStructureImpl))
      return;

    expect(structure.typeParameter.name).toBe("Tail");

    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("Intersection: of string and number", () => {
    setTypeStructure("string & number", failCallback);
    expect(structure).toBeInstanceOf(IntersectionTypeStructureImpl);
    if (structure instanceof IntersectionTypeStructureImpl) {
      expect(structure.childTypes.length).toBe(2);
      expect(structure.childTypes[0]).toBe(LiteralTypeStructureImpl.get("string"));
      expect(structure.childTypes[1]).toBe(LiteralTypeStructureImpl.get("number"));
    }
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it('Mapped: { [key in "one" | "two" as `${key}Index`]: boolean; } (mapped type)', () => {
    setTypeStructure('{ -readonly [key in "one" | "two" as `${key}Index`]+?: boolean; }', failCallback);
    expect(structure).toBeInstanceOf(MappedTypeStructureImpl);
    if (!(structure instanceof MappedTypeStructureImpl))
      return;

    expect(structure.readonlyToken).toBe("-readonly");

    expect(structure.parameter?.name).toBe("key");
    expect(structure.parameter?.constraint).toBe(`"one" | "two"`);
    expect(structure.asName).toBeInstanceOf(TemplateLiteralTypeStructureImpl);
    if (structure.asName instanceof TemplateLiteralTypeStructureImpl) {
      expect(structure.asName.head).toBe("");
      expect(structure.asName.spans).toEqual([[LiteralTypeStructureImpl.get("key"), "Index"]]);
    }

    expect(structure.questionToken).toBe("+?");

    expect(structure.type).toBe(LiteralTypeStructureImpl.get("boolean"));

    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it(`MemberedObject: { foo(): this } (object literal)`, () => {
    setTypeStructure(`{ foo(): this }`, failCallback);
    expect(structure).toBeInstanceOf(MemberedObjectTypeStructureImpl);

    if (!(structure instanceof MemberedObjectTypeStructureImpl))
      return;
    expect(structure.callSignatures.length).toBe(0);
    expect(structure.constructSignatures.length).toBe(0);
    expect(structure.getAccessors.length).toBe(0);
    expect(structure.indexSignatures.length).toBe(0);
    expect(structure.methods.length).toBe(1);
    expect(structure.properties.length).toBe(0);
    expect(structure.setAccessors.length).toBe(0);

    const methodStructure = structure.methods[0];
    if (!methodStructure)
      return;

    expect(methodStructure.name).toBe("foo");
    expect(methodStructure.returnType).toBe("this");

    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it(`Parentheses: (true), meaning parentheses type`, () => {
    setTypeStructure(`(true)`, failCallback);
    expect(structure).toBeInstanceOf(ParenthesesTypeStructureImpl);
    if (!(structure instanceof ParenthesesTypeStructureImpl))
      return;
    expect(structure.childTypes.length).toBe(1);
    expect(structure.childTypes[0]).toBe(LiteralTypeStructureImpl.get("true"));
    expect(failMessage).toBeUndefined();
    expect(failNode).toBeNull();
  });

  it("PrefixOperators: keyof typeof NumberStringClass", () => {
    setTypeStructure(`keyof typeof NumberStringClass`, failCallback);
    expect(structure).toBeInstanceOf(PrefixOperatorsTypeStructureImpl);
    if (!(structure instanceof PrefixOperatorsTypeStructureImpl))
      return;
    expect(structure.operators).toEqual(["keyof", "typeof"]);
    expect(structure.objectType).toBe(LiteralTypeStructureImpl.get("NumberStringClass"));
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it(`QualifiedName: NumberEnum.one`, () => {
    setTypeStructure(`NumberEnum.one`, failCallback);
    expect(structure).toBeInstanceOf(QualifiedNameTypeStructureImpl);

    if (structure instanceof QualifiedNameTypeStructureImpl) {
      expect(structure.childTypes.length).toBe(2);
      expect(structure.childTypes[0]).toBe("NumberEnum");
      expect(structure.childTypes[1]).toBe("one");
    }
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it(`String: string literal "foo"`, () => {
    setTypeStructure(`"foo"`, failCallback);
    expect(structure).toBeInstanceOf(StringTypeStructureImpl);
    if (structure instanceof StringTypeStructureImpl) {
      expect(structure.stringValue).toBe("foo");
    }
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it('TemplateLiteral: `one${"A" | "B"}two${"C" | "D"}three${"E" | "F"}` (template literal)', () => {
    setTypeStructure('`one${"A" | "B"}two${"C" | "D"}three${"E" | "F"}`', failCallback);
    expect(structure).toBeInstanceOf(TemplateLiteralTypeStructureImpl);
    if (!(structure instanceof TemplateLiteralTypeStructureImpl))
      return;

    function checkUnionType(unionType: UnionTypeStructureImpl, index: number, expected: string[]): void {
      expect(unionType.childTypes.length).withContext("at index " + index + ", " + expected.join(", ")).toBe(expected.length);
      for (let i = 0; i < expected.length; i++) {
        const childType: TypeStructures = unionType.childTypes[i];
        expect(childType).withContext("expecting string type at index: " + index + ", " + expected[i]).toBeInstanceOf(StringTypeStructureImpl);
        if (childType instanceof StringTypeStructureImpl) {
          expect(childType.stringValue).withContext("at index: " + index + ", subindex " + i).toBe(expected[i]);
        }
      }
    }

    expect(structure.head).toBe("one");
    expect(structure.spans.length).toBe(3);
    {
      const [unionType, two] = structure.spans[0];
      expect(unionType).toBeInstanceOf(UnionTypeStructureImpl);
      if (unionType instanceof UnionTypeStructureImpl) {
        checkUnionType(unionType, 0, ["A", "B"]);
      }
      expect(two).toBe("two");
    }

    {
      const [unionType, three] = structure.spans[1];
      expect(unionType).toBeInstanceOf(UnionTypeStructureImpl);
      if (unionType instanceof UnionTypeStructureImpl) {
        checkUnionType(unionType, 1, ["C", "D"]);
      }
      expect(three).toBe("three");
    }

    {
      const [unionType, four] = structure.spans[2];
      expect(unionType).toBeInstanceOf(UnionTypeStructureImpl);
      if (unionType instanceof UnionTypeStructureImpl) {
        checkUnionType(unionType, 2, ["E", "F"]);
      }
      expect(four).toBe("");
    }

    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it("Tuple: [string, number]", () => {
    setTypeStructure("[string, number]", failCallback);
    expect(structure).toBeInstanceOf(TupleTypeStructureImpl);
    if (structure instanceof TupleTypeStructureImpl) {
      expect(structure.childTypes.length).toBe(2);
      expect(structure.childTypes[0]).toBe(LiteralTypeStructureImpl.get("string"));
      expect(structure.childTypes[1]).toBe(LiteralTypeStructureImpl.get("number"));
    }
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it(`TypeArgumented: Pick<NumberStringType, "repeatForward">`, () => {
    setTypeStructure(`Pick<NumberStringType, "repeatForward">`, failCallback);
    expect(structure).toBeInstanceOf(TypeArgumentedTypeStructureImpl);
    if (structure instanceof TypeArgumentedTypeStructureImpl) {
      expect(structure.objectType).toBe(LiteralTypeStructureImpl.get("Pick"));
      expect(structure.childTypes.length).toBe(2);
      expect(structure.childTypes[0]).toBe(LiteralTypeStructureImpl.get("NumberStringType"));
      expect(structure.childTypes[1]).toBeInstanceOf(StringTypeStructureImpl);
      expect((structure.childTypes[1] as StringTypeStructureImpl).stringValue).toBe("repeatForward");
    }
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });

  it(`Union: of string and number`, () => {
    setTypeStructure("string | number", failCallback);
    expect(structure).toBeInstanceOf(UnionTypeStructureImpl);
    if (structure instanceof UnionTypeStructureImpl) {
      expect(structure.childTypes.length).toBe(2);
      expect(structure.childTypes[0]).toBe(LiteralTypeStructureImpl.get("string"));
      expect(structure.childTypes[1]).toBe(LiteralTypeStructureImpl.get("number"));
    }
    expect(failMessage).toBe(undefined);
    expect(failNode).toBe(null);
  });
  //#region complex types
});
