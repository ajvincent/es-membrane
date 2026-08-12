import {
  LiteralTypeStructureImpl,
  StringTypeStructureImpl,
  TypeStructureKind,
  parseLiteralType,
} from "#stage_two/snapshot/source/exports.js";

it("parseLiteralType takes a literal string of a type and returns a type structure", () => {
  let typeStructure = parseLiteralType(`Pick<[], "sort">`);
  expect(typeStructure.kind).toBe(TypeStructureKind.TypeArgumented);
  if (typeStructure.kind !== TypeStructureKind.TypeArgumented)
    return;
  expect(typeStructure.objectType).toBe(LiteralTypeStructureImpl.get("Pick"));
  expect(typeStructure.childTypes.length).toBe(2);
  if (typeStructure.childTypes.length !== 2)
    return;
  const [tuple, sortString] = typeStructure.childTypes;
  expect(tuple.kind).toBe(TypeStructureKind.Tuple);
  if (tuple.kind === TypeStructureKind.Tuple) {
    expect(tuple.childTypes.length).toBe(0);
  }
  expect(sortString).toBe(StringTypeStructureImpl.get("sort"));

  // trying multiple times to ensure reusability
  typeStructure = parseLiteralType("boolean");
  expect(typeStructure).toBe(LiteralTypeStructureImpl.get("boolean"));

  typeStructure = parseLiteralType(`"boolean"`);
  expect(typeStructure).toBe(StringTypeStructureImpl.get("boolean"));
});
