import {
  LiteralTypeStructureImpl,
  type TypeStructures,
  parseLiteralType
} from "#stage_two/snapshot/source/exports.js";

import tightenPropertyType from "#stage_three/generation/build/interfaces/tightenPropertyType.js";

/*
import {
  getUnionOfStructuresName
} from "#utilities/source/StructureNameTransforms.js";
*/

describe("tightenPropertyType", () => {
  const booleanType = LiteralTypeStructureImpl.get("boolean");
  const stringType = LiteralTypeStructureImpl.get("string");
  const writerType = LiteralTypeStructureImpl.get("WriterFunction");

  const ScopeType = LiteralTypeStructureImpl.get("Scope");
  const StructureKindClassType = LiteralTypeStructureImpl.get("StructureKind.Class");
  const StatementStructureImpls = LiteralTypeStructureImpl.get("StatementStructureImpls");
  const stringorWriterType = LiteralTypeStructureImpl.get("stringOrWriterFunction");

  function toRawTypeStructure(
    typeStructure: TypeStructures
  ): object
  {
    return JSON.parse(JSON.stringify(typeStructure)) as object;
  }

  function runComplexTest(
    actualTypeSource: string,
    expectedTypeSource: string,
  ): void
  {
    const expected = parseLiteralType(expectedTypeSource);
    const startType = parseLiteralType(actualTypeSource);

    const actual = tightenPropertyType(startType);

    expect(
      toRawTypeStructure(actual)
    ).toEqual(toRawTypeStructure(expected));
  }

  it("returns literals correctly", () => {
    expect(tightenPropertyType(booleanType)).toBe(booleanType);
    expect(tightenPropertyType(stringType)).toBe(stringType);
    expect(tightenPropertyType(writerType)).toBe(writerType);
  });

  it("returns types we imported from ts-morph (Scope)", () => {
    expect(tightenPropertyType(ScopeType)).toBe(ScopeType);
  });

  it("returns the kind property as-is", () => {
    expect(tightenPropertyType(StructureKindClassType)).toBe(StructureKindClassType);
  });

  it("preserves an union of literals we don't modify (EnumMemberStructure.value)", () => {
    runComplexTest(
      "string | number",
      "number | string" // sort test
    );
  });

  it("returns stringOrWriterFunction for `string | WriterFunction` (TypedNodeStructure.type)", () => {
    expect(
      tightenPropertyType(parseLiteralType("string | WriterFunction"))
    ).toBe(stringorWriterType);
  });

  it("renames an union (StatementStructures)", () => {
    expect(
      tightenPropertyType(LiteralTypeStructureImpl.get("StatementStructures"))
    ).toBe(StatementStructureImpls);
  });

  it("disposes of OptionalKind and renames a structure (ParameteredNodeStructure.parameters)", () => {
    runComplexTest(
      "OptionalKind<ParameterDeclarationStructure>[]",
      `ParameterDeclarationImpl[]`
    );
  });

  describe("prefers an array in an union", () => {
    it("(Structure.leadingTrivia)", () => {
      runComplexTest(
        `string | WriterFunction | (string | WriterFunction)[]`,
        `stringOrWriterFunction[]`
      );
    });

    it("(TypeParameteredNodeStructure.typeParameters)", () => {
      runComplexTest(
        `(OptionalKind<TypeParameterDeclarationStructure> | string)[]`,
        `(TypeParameterDeclarationImpl | string)[]`
      );
    });

    it("(StatementedNodeStructure.statements)", () => {
      runComplexTest(
        `(string | WriterFunction | StatementStructures)[] | string | WriterFunction`,
        `(StatementStructureImpls | stringOrWriterFunction)[]`
      );
    });
  });
});
