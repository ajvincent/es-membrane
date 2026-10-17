import type {
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
  ImportAttributeImpl,
  ImportTypeStructureImpl,
  IndexedAccessTypeStructureImpl,
  InferTypeStructureImpl,
  IntersectionTypeStructureImpl,
  LiteralTypeStructureImpl,
  MappedTypeStructureImpl,
  MemberedObjectTypeStructureImpl,
  MethodSignatureImpl,
  NamedTupleMemberTypeStructureImpl,
  NumberTypeStructureImpl,
  OptionalTypeStructureImpl,
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

import {
  serializeWriter
} from "../../support/serializeWriter.js";

describe("TypeStructure for ts-morph (stage 2): ", () => {
  const fooTyped = LiteralTypeStructureImpl.get("foo");
  const nstTyped = LiteralTypeStructureImpl.get("NumberStringType");
  const typeParam = new TypeParameterDeclarationImpl("UserType");
  typeParam.constraint = "number";
  typeParam.default = "6";

  const stringBarTyped = StringTypeStructureImpl.get("bar");

  function checkCloneAndRegistration(
    typedWriter: TypeStructures,
    typeClass: Class<TypeStructures>,
  ): void
  {
    const cloneWriter = TypeStructureClassesMap.clone(typedWriter);
    expect(cloneWriter).toBeInstanceOf(typeClass);
    if (typeof cloneWriter === "object") {
      expect(
        TypeStructuresBase.getWriterStructureForCallback(cloneWriter.writerFunction)
      ).toBe(cloneWriter);
      expect(cloneWriter.kind).toBe(typedWriter.kind);
    }
    expect(
      TypeStructuresBase.getWriterStructureForCallback(typedWriter.writerFunction)
    ).toBe(typedWriter);
  }

  it("ArrayTypedStructureImpl", () => {
    const typedWriter = new ArrayTypeStructureImpl(fooTyped);
    expect(typedWriter.kind).toBe(TypeStructureKind.Array);
    expect(serializeWriter(typedWriter.writerFunction)).toBe("foo[]");

    checkCloneAndRegistration(typedWriter, ArrayTypeStructureImpl);
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

    expect(serializeWriter(typedWriter.writerFunction)).toBe(
      "true extends ReturnsModified ? BaseClassType : void"
    );

    expect(typedWriter.kind).toBe(TypeStructureKind.Conditional);
    checkCloneAndRegistration(typedWriter, ConditionalTypeStructureImpl);
  });

  it("FunctionTypeStructureImpl", () => {
    const typedWriter = new FunctionTypeStructureImpl({
      typeParameters: [typeParam],
      parameters: [new ParameterTypeStructureImpl("nst", nstTyped)],
      returnType: LiteralTypeStructureImpl.get("boolean"),
      writerStyle: FunctionWriterStyle.Method
    });

    expect(
      serializeWriter(typedWriter.writerFunction)
    ).toBe("<UserType extends number = 6>(nst: NumberStringType): boolean");

    expect(typedWriter.kind).toBe(TypeStructureKind.Function);
    checkCloneAndRegistration(typedWriter, FunctionTypeStructureImpl);
  });

  it("ImportTypeStructureImpl with no attributes", () => {
    const typedWriter = new ImportTypeStructureImpl(
      stringBarTyped, [], nstTyped, [fooTyped]
    );

    expect(
      serializeWriter(typedWriter.writerFunction)
    ).toBe(`import("bar").NumberStringType<foo>`);
    expect(typedWriter.kind).toBe(TypeStructureKind.Import);
  });

  it("ImportTypeStructureImpl with a module-resolution attribute", () => {
    const attr = new ImportAttributeImpl("resolution-mode", "import");

    const typedWriter = new ImportTypeStructureImpl(
      stringBarTyped, [attr], nstTyped, [fooTyped]
    );
    expect(serializeWriter(typedWriter.writerFunction)).toBe(`
import("bar", {
    with: {
        "resolution-mode": "import"
    }
}).NumberStringType<foo>
`.trim());

    expect(typedWriter.kind).toBe(TypeStructureKind.Import);
  });

  it("IndexedAccessTypeStructureImpl", () => {
    const typedWriter = new IndexedAccessTypeStructureImpl(fooTyped, stringBarTyped);
    expect(serializeWriter(typedWriter.writerFunction)).toBe(`foo["bar"]`);
    expect(typedWriter.kind).toBe(TypeStructureKind.IndexedAccess);
  });

  it("InferTypeStructureImpl", () => {
    const typedWriter = new InferTypeStructureImpl(typeParam);
    expect(serializeWriter(typedWriter.writerFunction)).toBe(`infer UserType extends number = 6`);
    expect(typedWriter.kind).toBe(TypeStructureKind.Infer);
  });

  it("IntersectionTypeStructureImpl", () => {
    const typedWriter = new IntersectionTypeStructureImpl;
    typedWriter.childTypes.push(fooTyped);
    typedWriter.childTypes.push(nstTyped);

    expect(serializeWriter(typedWriter.writerFunction)).toBe(`foo & NumberStringType`);
    expect(typedWriter.kind).toBe(TypeStructureKind.Intersection);
    checkCloneAndRegistration(typedWriter, IntersectionTypeStructureImpl);
  });

  it("LiteralTypeStructureImpl", () => {
    expect(serializeWriter(fooTyped.writerFunction)).toBe("foo");
    expect(fooTyped.kind).toBe(TypeStructureKind.Literal);
    checkCloneAndRegistration(fooTyped, LiteralTypeStructureImpl);
  });

  it("MappedTypeStructureImpl", () => {
    const typedWriter = new MappedTypeStructureImpl(typeParam);
    typedWriter.readonlyToken = "+readonly";
    typedWriter.type = LiteralTypeStructureImpl.get("boolean");
    expect(serializeWriter(typedWriter.writerFunction)).toBe(`{\n    +readonly [UserType in number]: boolean;\n}`);

    expect(typedWriter.kind).toBe(TypeStructureKind.Mapped);
    checkCloneAndRegistration(typedWriter, MappedTypeStructureImpl);
  });

  it("MemberedObjectTypeStructureImpl", () => {
    const typedWriter = new MemberedObjectTypeStructureImpl;

    const fooMethod = new MethodSignatureImpl("foo");
    typedWriter.methods.push(fooMethod);

    const param = new ParameterDeclarationImpl("firstArg");
    fooMethod.parameters.push(param);
    param.type = "string";

    fooMethod.returnType = "void";
    //fooMethod.returnTypeStructure = LiteralTypedStructureImpl.get("void");

    expect(serializeWriter(typedWriter.writerFunction)).toBe(`{\n    foo(firstArg: string): void;\n}`);

    expect(typedWriter.kind).toBe(TypeStructureKind.MemberedObject);
    checkCloneAndRegistration(typedWriter, MemberedObjectTypeStructureImpl);
  });

  it("NamedTupleMemberTypeStructureImpl", () => {
    const typedWriter = new NamedTupleMemberTypeStructureImpl("foo", LiteralTypeStructureImpl.get("boolean"));

    expect(serializeWriter(typedWriter.writerFunction)).toBe(`foo: boolean`);
    expect(typedWriter.kind).toBe(TypeStructureKind.NamedTupleMember);
    checkCloneAndRegistration(typedWriter, NamedTupleMemberTypeStructureImpl);

    typedWriter.hasDotDotDotToken = true;
    typedWriter.hasQuestionToken = true;
    expect(serializeWriter(typedWriter.writerFunction)).toBe("...foo?: boolean");
    checkCloneAndRegistration(typedWriter, NamedTupleMemberTypeStructureImpl);
  });

  it("NumberTypeStructureImpl", () => {
    const typedWriter = new NumberTypeStructureImpl(47);
    expect(serializeWriter(typedWriter.writerFunction)).toBe("47");
    checkCloneAndRegistration(typedWriter, NumberTypeStructureImpl);
  });

  it("OptionalTypeStructureImpl", () => {
    const typedWriter = new OptionalTypeStructureImpl(LiteralTypeStructureImpl.get("boolean"));
    expect(serializeWriter(typedWriter.writerFunction)).toBe("boolean?");
    checkCloneAndRegistration(typedWriter, OptionalTypeStructureImpl);
  });

  it("ParameterTypeStructureImpl", () => {
    const typedWriter = new ParameterTypeStructureImpl("nst", undefined);
    expect(serializeWriter(typedWriter.writerFunction)).toBe("nst");
    expect(typedWriter.kind).toBe(TypeStructureKind.Parameter);

    typedWriter.typeStructure = nstTyped;
    expect(serializeWriter(typedWriter.writerFunction)).toBe("nst: NumberStringType");
    checkCloneAndRegistration(typedWriter, ParameterTypeStructureImpl);
  });

  it("ParenthesesTypeStructureImpl", () => {
    const typedWriter = new ParenthesesTypeStructureImpl(LiteralTypeStructureImpl.get("true"));
    expect(serializeWriter(typedWriter.writerFunction)).toBe("(true)");
    expect(typedWriter.kind).toBe(TypeStructureKind.Parentheses);

    // mutability test for the child type
    typedWriter.childTypes[0] = LiteralTypeStructureImpl.get("false");
    expect(serializeWriter(typedWriter.writerFunction)).toBe("(false)");

    // mutability test: if someone puts in too many child types...
    typedWriter.childTypes.push(LiteralTypeStructureImpl.get("unknown"));
    expect(serializeWriter(typedWriter.writerFunction)).toBe("(false)");

    checkCloneAndRegistration(typedWriter, ParenthesesTypeStructureImpl);
  });

  it("PrefixOperatorsTypeStructureImpl", () => {
    const prefixes: readonly PrefixUnaryOperator[] = ["typeof", "readonly"];
    const typedWriter = new PrefixOperatorsTypeStructureImpl(
      prefixes,
      new LiteralTypeStructureImpl("NumberStringType")
    );
    expect(serializeWriter(typedWriter.writerFunction)).toBe("typeof readonly NumberStringType");
    expect(typedWriter.kind).toBe(TypeStructureKind.PrefixOperators);
    checkCloneAndRegistration(typedWriter, PrefixOperatorsTypeStructureImpl);
  });

  it("QualifiedNameTypeStructureImpl", () => {
    const typedWriter = new QualifiedNameTypeStructureImpl([
      nstTyped.stringValue,
      fooTyped.stringValue
    ]);
    expect(serializeWriter(typedWriter.writerFunction)).toBe(`NumberStringType.foo`);
    expect(typedWriter.kind).toBe(TypeStructureKind.QualifiedName);
    checkCloneAndRegistration(typedWriter, QualifiedNameTypeStructureImpl);
  });

  it("StringTypeStructureImpl", () => {
    expect(serializeWriter(stringBarTyped.writerFunction)).toBe(`"bar"`);
    expect(stringBarTyped.kind).toBe(TypeStructureKind.String);
    checkCloneAndRegistration(stringBarTyped, StringTypeStructureImpl);
  });

  it("TemplateLiteralTypeStructureImpl", () => {
    const AB = new UnionTypeStructureImpl;
    AB.childTypes = [new StringTypeStructureImpl("A"), new StringTypeStructureImpl("B")];

    const CD = new UnionTypeStructureImpl;
    CD.childTypes = [new StringTypeStructureImpl("C"), new StringTypeStructureImpl("D")];

    const typedWriter = new TemplateLiteralTypeStructureImpl(
      "one", [[AB, "two"], [CD, "three"]]
    );

    expect(serializeWriter(typedWriter.writerFunction)).toBe('`one${"A" | "B"}two${"C" | "D"}three`');

    expect(typedWriter.kind).toBe(TypeStructureKind.TemplateLiteral);
    checkCloneAndRegistration(typedWriter, TemplateLiteralTypeStructureImpl);
  });

  it("TupleTypeStructureImpl", () => {
    const typedWriter = new TupleTypeStructureImpl([fooTyped, nstTyped, nstTyped]);

    expect(serializeWriter(typedWriter.writerFunction)).toBe(`[foo, NumberStringType, NumberStringType]`);
    expect(typedWriter.kind).toBe(TypeStructureKind.Tuple);
    checkCloneAndRegistration(typedWriter, TupleTypeStructureImpl);
  });

  it("TypeArgumentedTypeStructureImpl", () => {
    const typedWriter = new TypeArgumentedTypeStructureImpl(fooTyped);
    typedWriter.childTypes.push(stringBarTyped, nstTyped);
    expect(serializeWriter(typedWriter.writerFunction)).toBe(`foo<"bar", NumberStringType>`);

    expect(typedWriter.kind).toBe(TypeStructureKind.TypeArgumented);
    checkCloneAndRegistration(typedWriter, TypeArgumentedTypeStructureImpl);
  });

  it("UnionTypeStructureImpl", () => {
    const typedWriter = new UnionTypeStructureImpl([fooTyped, nstTyped]);
    expect(serializeWriter(typedWriter.writerFunction)).toBe(`foo | NumberStringType`);
    expect(typedWriter.kind).toBe(TypeStructureKind.Union);
    checkCloneAndRegistration(typedWriter, UnionTypeStructureImpl);
  });

  it("WriterTypeStructureImpl", () => {
    const typedWriter = new WriterTypeStructureImpl(
      (writer: CodeBlockWriter) => writer.write("hi mom")
    );

    expect(serializeWriter(typedWriter.writerFunction)).toBe(`hi mom`);
    expect(typedWriter.kind).toBe(TypeStructureKind.Writer);
    checkCloneAndRegistration(typedWriter, WriterTypeStructureImpl);
  });

  it("TypeStructureClassesMap is complete", () => {
    const kinds = Object.values(TypeStructureKind).filter(
      value => typeof value === "number"
    ) as TypeStructureKind[];

    expect(TypeStructureClassesMap.size).toBe(kinds.length);
  });
});
