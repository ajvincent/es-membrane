import type {
  ClassDeclaration,
} from "ts-morph";

import {
  TS_MORPH_D,
  getClassToDerivedMap,
} from "../source/ts-morph-d-file.js";

it("getDerivedClassesRecursive() covers direct and indirect derived classes", () => {
  const classToDerivedMap: ReadonlyMap<ClassDeclaration, readonly ClassDeclaration[]> = getClassToDerivedMap();
  const derivedFromTypeNode = new Set<ClassDeclaration>;
  const startClass: ClassDeclaration = TS_MORPH_D.getClassOrThrow("TypeNode");
  derivedFromTypeNode.add(startClass);

  for (const classDecl of derivedFromTypeNode) {
    const derived = classToDerivedMap.get(classDecl) ?? [];
    for (const dc of derived)
      derivedFromTypeNode.add(dc);
  }

  derivedFromTypeNode.delete(startClass);

  expect(derivedFromTypeNode.has(
    TS_MORPH_D.getClassOrThrow("LiteralTypeNode")
  )).withContext("LiteralTypeNode (direct)").toBeTrue();

  expect(derivedFromTypeNode.has(
    TS_MORPH_D.getClassOrThrow("TypeLiteralNode")
  )).withContext("TypeLiteralNode (indirect)").toBeTrue();
});
