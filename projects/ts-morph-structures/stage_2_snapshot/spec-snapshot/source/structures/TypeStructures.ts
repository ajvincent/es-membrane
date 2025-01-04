import {
  CodeBlockWriter,
} from "ts-morph";

import type {
  Class
} from "type-fest";

import {
  ArrayTypeStructureImpl,
  ConditionalTypeStructureImpl,
  type ConditionalTypeStructureParts,
  FunctionTypeStructureImpl,
  FunctionWriterStyle,
  ImportTypeStructureImpl,
  IndexedAccessTypeStructureImpl,
  InferTypeStructureImpl,
  IntersectionTypeStructureImpl,
  LiteralTypeStructureImpl,
  MappedTypeStructureImpl,
  MemberedObjectTypeStructureImpl,
  MethodSignatureImpl,
  NumberTypeStructureImpl,
  ParameterDeclarationImpl,
  ParameterTypeStructureImpl,
  ParenthesesTypeStructureImpl,
  PrefixOperatorsTypeStructureImpl,
  type PrefixUnaryOperator,
  QualifiedNameTypeStructureImpl,
  StringTypeStructureImpl,
  TemplateLiteralTypeStructureImpl,
  TupleTypeStructureImpl,
  TypeArgumentedTypeStructureImpl,
  TypeParameterDeclarationImpl,
  TypeStructureKind,
  type TypeStructures,
  UnionTypeStructureImpl,
  WriterTypeStructureImpl,
} from "#stage_two/snapshot/source/exports.js";

import {
  TypeStructuresBase,
  TypeStructureClassesMap
} from "#stage_two/snapshot/source/internal-exports.js";

describe("TypeStructure for ts-morph (stage 2): ", () => {
  let writer: CodeBlockWriter;
  beforeEach(() => writer = new CodeBlockWriter());

  const fooTyped = LiteralTypeStructureImpl.get("foo");
  const nstTyped = LiteralTypeStructureImpl.get("NumberStringType");
  const typeParam = new TypeParameterDeclarationImpl("UserType");
  typeParam.constraint = "number";
  typeParam.default = "6";

  const stringBarTyped = StringTypeStructureImpl.get("bar");

  function checkCloneAndRegistration(
    typedWriter: TypeStructures,
    typeClass: Class<TypeStructures>,
    singletonWriter: boolean
  ): void
  {
    const cloneWriter = TypeStructureClassesMap.clone(typedWriter);
    expect(cloneWriter).toBeInstanceOf(typeClass);
    if (typeof cloneWriter === "object") {
      expect(
        TypeStructuresBase.getTypeStructureForCallback(cloneWriter.writerFunction)
      ).toBe(singletonWriter ? typedWriter : cloneWriter);
      expect(cloneWriter.kind).toBe(typedWriter.kind);
    }
    expect(
      TypeStructuresBase.getTypeStructureForCallback(typedWriter.writerFunction)
    ).toBe(typedWriter);
  }

  it("ArrayTypedStructureImpl", () => {
    const typedWriter = new ArrayTypeStructureImpl(fooTyped);
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe("foo[]");

    expect(typedWriter.kind).toBe(TypeStructureKind.Array);

    checkCloneAndRegistration(typedWriter, ArrayTypeStructureImpl, false);
  });

  it("ConditionalTypedStructureImpl", () => {
    const checkType = new LiteralTypeStructureImpl("true");
    const extendsType = LiteralTypeStructureImpl.get("ReturnsModified");
    const trueType = new LiteralTypeStructureImpl("BaseClassType");
    const falseType = LiteralTypeStructureImpl.get("void");

    const parts: ConditionalTypeStructureParts = {
      checkType,
      extendsType,
      trueType,
      falseType,
    };

    const typedWriter = new ConditionalTypeStructureImpl(parts);

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(
      "true extends ReturnsModified ? BaseClassType : void"
    );

    expect(typedWriter.kind).toBe(TypeStructureKind.Conditional);
    checkCloneAndRegistration(typedWriter, ConditionalTypeStructureImpl, false);
  });

  it("FunctionTypeStructureImpl", () => {
    const typedWriter = new FunctionTypeStructureImpl({
      typeParameters: [typeParam],
      parameters: [new ParameterTypeStructureImpl("nst", nstTyped)],
      returnType: LiteralTypeStructureImpl.get("boolean"),
      writerStyle: FunctionWriterStyle.Method
    });
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe("<UserType extends number = 6>(nst: NumberStringType): boolean");

    expect(typedWriter.kind).toBe(TypeStructureKind.Function);
    checkCloneAndRegistration(typedWriter, FunctionTypeStructureImpl, false);
  });

  it("ImportTypeStructureImpl", () => {
    const typedWriter = new ImportTypeStructureImpl(
      stringBarTyped, nstTyped, [fooTyped]
    );
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`import("bar").NumberStringType<foo>`);
    expect(typedWriter.kind).toBe(TypeStructureKind.Import);
  });

  it("IndexedAccessTypeStructureImpl", () => {
    const typedWriter = new IndexedAccessTypeStructureImpl(fooTyped, stringBarTyped);
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`foo["bar"]`);

    expect(typedWriter.kind).toBe(TypeStructureKind.IndexedAccess);
  });

  it("InferTypeStructureImpl", () => {
    const typedWriter = new InferTypeStructureImpl(typeParam);
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`infer UserType extends number = 6`);
    expect(typedWriter.kind).toBe(TypeStructureKind.Infer);
  });

  it("IntersectionTypeStructureImpl", () => {
    const typedWriter = new IntersectionTypeStructureImpl;
    typedWriter.childTypes.push(fooTyped);
    typedWriter.childTypes.push(nstTyped);

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`foo & NumberStringType`);
    expect(typedWriter.kind).toBe(TypeStructureKind.Intersection);
    checkCloneAndRegistration(typedWriter, IntersectionTypeStructureImpl, false);
  });

  it("LiteralTypeStructureImpl", () => {
    fooTyped.writerFunction(writer);
    expect<string>(writer.toString()).toBe("foo");
    expect(fooTyped.kind).toBe(TypeStructureKind.Literal);
    checkCloneAndRegistration(fooTyped, LiteralTypeStructureImpl, false);
  });

  it("MappedTypeStructureImpl", () => {
    const typedWriter = new MappedTypeStructureImpl(typeParam);
    typedWriter.readonlyToken = "+readonly";
    typedWriter.type = LiteralTypeStructureImpl.get("boolean");
    typedWriter.writerFunction(writer);

    expect<string>(writer.toString()).toBe(`{\n    +readonly [UserType in number]: boolean;\n}`);

    expect(typedWriter.kind).toBe(TypeStructureKind.Mapped);
    checkCloneAndRegistration(typedWriter, MappedTypeStructureImpl, false);
  });

  it("MemberedObjectTypeStructureImpl", () => {
    const typedWriter = new MemberedObjectTypeStructureImpl;

    const fooMethod = new MethodSignatureImpl("foo");
    typedWriter.methods.push(fooMethod);

    const param = new ParameterDeclarationImpl("firstArg");
    fooMethod.parameters.push(param);
    param.type = "string";

    fooMethod.returnType = "void";
    //fooMethod.returnTypeStructure = new LiteralTypedStructureImpl("void");

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`{\n    foo(firstArg: string): void;\n}`);

    expect(typedWriter.kind).toBe(TypeStructureKind.MemberedObject);
    checkCloneAndRegistration(typedWriter, MemberedObjectTypeStructureImpl, false);
  });

  it("NumberTypeStructureImpl", () => {
    const typedWriter = new NumberTypeStructureImpl(47);
    typedWriter.writerFunction(writer);

    expect<string>(writer.toString()).toBe("47");
    checkCloneAndRegistration(typedWriter, NumberTypeStructureImpl, false);
  });

  it("ParameterTypeStructureImpl", () => {
    const typedWriter = new ParameterTypeStructureImpl("nst", undefined);
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe("nst");
    expect(typedWriter.kind).toBe(TypeStructureKind.Parameter);

    writer = new CodeBlockWriter();
    typedWriter.typeStructure = nstTyped;
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe("nst: NumberStringType");
    checkCloneAndRegistration(typedWriter, ParameterTypeStructureImpl, false);
  });

  it("ParenthesesTypeStructureImpl", () => {
    const typedWriter = new ParenthesesTypeStructureImpl(LiteralTypeStructureImpl.get("true"));
    typedWriter.writerFunction(writer);

    expect<string>(writer.toString()).toBe("(true)");
    expect(typedWriter.kind).toBe(TypeStructureKind.Parentheses);

    // mutability test for the child type
    writer = new CodeBlockWriter();
    typedWriter.childTypes[0] = LiteralTypeStructureImpl.get("false");
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe("(false)");

    // mutability test: if someone puts in too many child types...
    writer = new CodeBlockWriter();
    typedWriter.childTypes.push(LiteralTypeStructureImpl.get("unknown"));
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe("(false)");

    checkCloneAndRegistration(typedWriter, ParenthesesTypeStructureImpl, false);
  });

  it("PrefixOperatorsTypeStructureImpl", () => {
    const prefixes: readonly PrefixUnaryOperator[] = ["typeof", "readonly"];
    const typedWriter = new PrefixOperatorsTypeStructureImpl(
      prefixes,
      new LiteralTypeStructureImpl("NumberStringType")
    );
    typedWriter.writerFunction(writer);

    expect<string>(writer.toString()).toBe("typeof readonly NumberStringType");
    expect(typedWriter.kind).toBe(TypeStructureKind.PrefixOperators);
    checkCloneAndRegistration(typedWriter, PrefixOperatorsTypeStructureImpl, false);
  });

  it("QualifiedNameTypeStructureImpl", () => {
    const typedWriter = new QualifiedNameTypeStructureImpl([
      nstTyped.stringValue,
      fooTyped.stringValue
    ]);
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`NumberStringType.foo`);
    expect(typedWriter.kind).toBe(TypeStructureKind.QualifiedName);
    checkCloneAndRegistration(typedWriter, QualifiedNameTypeStructureImpl, false);
  });

  it("StringTypeStructureImpl", () => {
    stringBarTyped.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`"bar"`);
    expect(stringBarTyped.kind).toBe(TypeStructureKind.String);
    checkCloneAndRegistration(stringBarTyped, StringTypeStructureImpl, false);
  });

  it("TemplateLiteralTypeStructureImpl", () => {
    const AB = new UnionTypeStructureImpl;
    AB.childTypes = [new StringTypeStructureImpl("A"), new StringTypeStructureImpl("B")];

    const CD = new UnionTypeStructureImpl;
    CD.childTypes = [new StringTypeStructureImpl("C"), new StringTypeStructureImpl("D")];

    const typedWriter = new TemplateLiteralTypeStructureImpl(
      "one", [[AB, "two"], [CD, "three"]]
    );

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe('`one${"A" | "B"}two${"C" | "D"}three`');

    expect(typedWriter.kind).toBe(TypeStructureKind.TemplateLiteral);
    checkCloneAndRegistration(typedWriter, TemplateLiteralTypeStructureImpl, false);
  });

  it("TupleTypeStructureImpl", () => {
    const typedWriter = new TupleTypeStructureImpl([fooTyped, nstTyped, nstTyped]);

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`[foo, NumberStringType, NumberStringType]`);
    expect(typedWriter.kind).toBe(TypeStructureKind.Tuple);
    checkCloneAndRegistration(typedWriter, TupleTypeStructureImpl, false);
  });

  it("TypeArgumentedTypeStructureImpl", () => {
    const typedWriter = new TypeArgumentedTypeStructureImpl(fooTyped);
    typedWriter.childTypes.push(stringBarTyped, nstTyped);
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`foo<"bar", NumberStringType>`);

    expect(typedWriter.kind).toBe(TypeStructureKind.TypeArgumented);
    checkCloneAndRegistration(typedWriter, TypeArgumentedTypeStructureImpl, false);
  });

  it("UnionTypeStructureImpl", () => {
    const typedWriter = new UnionTypeStructureImpl([fooTyped, nstTyped]);
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`foo | NumberStringType`);
    expect(typedWriter.kind).toBe(TypeStructureKind.Union);
    checkCloneAndRegistration(typedWriter, UnionTypeStructureImpl, false);
  });

  it("WriterTypeStructureImpl", () => {
    const typedWriter = new WriterTypeStructureImpl(
      (writer: CodeBlockWriter) => writer.write("hi mom")
    );

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`hi mom`);
    expect(typedWriter.kind).toBe(TypeStructureKind.Writer);
    checkCloneAndRegistration(typedWriter, WriterTypeStructureImpl, true);
  });

  it("TypeStructureClassesMap is complete", () => {
    const kinds = Object.values(TypeStructureKind).filter(
      value => typeof value === "number"
    ) as TypeStructureKind[];

    expect(TypeStructureClassesMap.size).toBe(kinds.length);
  });
});
