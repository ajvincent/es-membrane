import {
  ConditionalTypedStructureImpl,
  LiteralTypedStructureImpl,
  SymbolKeyTypedStructureImpl,
  TupleTypedStructureImpl,
  TypeStructureKind,
  TypeStructures,
  /*
  TypeParameterDeclarationImpl,
  */
  UnionTypedStructureImpl,
} from "#ts-morph_structures/exports.mjs";

describe("replaceDescendantTypes", () => {
  const FooBaseLiteral = new LiteralTypedStructureImpl("foo");
  function expectFooClone(clone: TypeStructures): void {
    expect(clone.kind).toBe(TypeStructureKind.Literal);
    expect(clone).not.toBe(FooBaseLiteral);
    if (clone.kind === TypeStructureKind.Literal)
      expect(clone.stringValue).toBe(FooBaseLiteral.stringValue);
  }

  const BarBaseLiteral = new SymbolKeyTypedStructureImpl("bar");
  function filterBar(typeStructure: TypeStructures): boolean {
    return typeStructure.kind === TypeStructureKind.SymbolKey && typeStructure.stringValue === "bar";
  }

  it("ignores atomic type structures", () => {
    BarBaseLiteral.replaceDescendantTypes(filterBar, FooBaseLiteral);
    expect(BarBaseLiteral.stringValue).toBe("bar");

    const OtherBaseLiteral = new LiteralTypedStructureImpl("Other");
    OtherBaseLiteral.replaceDescendantTypes(filterBar, FooBaseLiteral);
    expect(OtherBaseLiteral.stringValue).toBe("Other");
  });

  it("works recursively", () => {
    const condition = new ConditionalTypedStructureImpl({});
    condition.checkType = BarBaseLiteral;
    condition.extendsType = new LiteralTypedStructureImpl("boolean");

    condition.trueType = new TupleTypedStructureImpl([BarBaseLiteral]);
    condition.falseType = new TupleTypedStructureImpl([SymbolKeyTypedStructureImpl.clone(BarBaseLiteral)]);

    condition.replaceDescendantTypes(filterBar, FooBaseLiteral);

    expectFooClone(condition.checkType);
    expect(condition.extendsType.kind).toBe(TypeStructureKind.Literal);
    expect(condition.extendsType.stringValue).toBe("boolean");
    expect(condition.trueType.kind).toBe(TypeStructureKind.Tuple);
    expectFooClone(condition.trueType.childTypes[0]);
    expect(condition.falseType.kind).toBe(TypeStructureKind.Tuple);
    expectFooClone(condition.falseType.childTypes[0]);
  });

  it("works on an array of type structures", () => {
    const unionType = new UnionTypedStructureImpl([
      new LiteralTypedStructureImpl("oops"),
      BarBaseLiteral,
      SymbolKeyTypedStructureImpl.clone(BarBaseLiteral),
      new LiteralTypedStructureImpl("what")
    ]);

    unionType.replaceDescendantTypes(filterBar, FooBaseLiteral);

    expectFooClone(unionType.childTypes[1]);
    expectFooClone(unionType.childTypes[2]);
  });

  xit("works with function types through to type parameters", () => {
    // not yet written
  });

  xit("passes through an object literal type to descendant type structures", () => {
    // not yet written
  });

  xit("works with an interface declaration (presumably cloned) for purposes of resolving a type parameter", () => {
    // not yet written
  });
});
