import {
  ConditionalTypedStructureImpl,
  FunctionTypedStructureImpl,
  InterfaceDeclarationImpl,
  LiteralTypedStructureImpl,
  MemberedObjectTypeStructureImpl,
  ParameterTypedStructureImpl,
  SymbolKeyTypedStructureImpl,
  TupleTypedStructureImpl,
  TypeStructureKind,
  TypeStructures,
  TypeParameterDeclarationImpl,
  UnionTypedStructureImpl,
  MethodSignatureImpl,
  ParameterDeclarationImpl,
  PropertySignatureImpl,
} from "#stage_one/prototype-snapshot/exports.js";

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

  it("works with function types through to type parameters", () => {
    const FirstTypeParam = new TypeParameterDeclarationImpl("FirstParam");
    FirstTypeParam.constraintStructure = SymbolKeyTypedStructureImpl.clone(BarBaseLiteral);

    const FirstParam = new ParameterTypedStructureImpl("firstParam", SymbolKeyTypedStructureImpl.clone(BarBaseLiteral));
    const SecondParam = new ParameterTypedStructureImpl("secondParam", new LiteralTypedStructureImpl("FirstParam"));

    const functionType = new FunctionTypedStructureImpl({
      name: "clone",
      typeParameters: [
        FirstTypeParam
      ],
      parameters: [
        FirstParam,
        SecondParam,
      ],
      returnType: SymbolKeyTypedStructureImpl.clone(BarBaseLiteral)
    });

    functionType.replaceDescendantTypes(filterBar, FooBaseLiteral);

    expectFooClone(functionType.typeParameters[0].constraintStructure!);
    expectFooClone(functionType.parameters[0].typeStructure!);
    expectFooClone(functionType.returnType!);
  });

  it("passes through an object literal type to descendant type structures", () => {
    const firstMethod = new MethodSignatureImpl("firstMethod");

    const FirstTypeParam = new TypeParameterDeclarationImpl("Target");
    FirstTypeParam.constraintStructure = SymbolKeyTypedStructureImpl.clone(BarBaseLiteral);
    firstMethod.typeParameters.push(FirstTypeParam);

    const firstParam = new ParameterDeclarationImpl("firstParam");
    firstParam.typeStructure = SymbolKeyTypedStructureImpl.clone(BarBaseLiteral);
    firstMethod.parameters.push(firstParam);

    const prop = new PropertySignatureImpl("foo");
    prop.typeStructure = SymbolKeyTypedStructureImpl.clone(BarBaseLiteral);

    const objectLiteral = new MemberedObjectTypeStructureImpl({
      methods: [
        firstMethod,
      ],
      properties: [
        prop,
      ],
    });

    objectLiteral.replaceDescendantTypes(filterBar, FooBaseLiteral);
    expectFooClone(FirstTypeParam.constraintStructure);
    expectFooClone(firstParam.typeStructure);
    expectFooClone(prop.typeStructure);
  });

  it("works with an interface declaration (presumably cloned) for purposes of resolving a type parameter", () => {
    const firstMethod = new MethodSignatureImpl("firstMethod");

    const FirstTypeParam = new TypeParameterDeclarationImpl("Target");
    FirstTypeParam.constraintStructure = SymbolKeyTypedStructureImpl.clone(BarBaseLiteral);
    firstMethod.typeParameters.push(FirstTypeParam);

    const firstParam = new ParameterDeclarationImpl("firstParam");
    firstParam.typeStructure = SymbolKeyTypedStructureImpl.clone(BarBaseLiteral);
    firstMethod.parameters.push(firstParam);

    const prop = new PropertySignatureImpl("foo");
    prop.typeStructure = SymbolKeyTypedStructureImpl.clone(BarBaseLiteral);

    const interfaceDecl = new InterfaceDeclarationImpl("TestInterface");
    interfaceDecl.methods.push(firstMethod);
    interfaceDecl.properties.push(prop);

    interfaceDecl.typeParameters.push(TypeParameterDeclarationImpl.clone(FirstTypeParam));

    interfaceDecl.replaceDescendantTypes(filterBar, FooBaseLiteral);
    expectFooClone((interfaceDecl.typeParameters[0] as TypeParameterDeclarationImpl).constraintStructure!);
    expectFooClone(FirstTypeParam.constraintStructure);
    expectFooClone(firstParam.typeStructure);
    expectFooClone(prop.typeStructure);
  });
});
