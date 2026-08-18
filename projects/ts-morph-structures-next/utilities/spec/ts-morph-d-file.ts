import type {
  ClassDeclaration,
} from "ts-morph";

import {
  TS_MORPH_D,
  getDerivedClassesRecursive
} from "../source/ts-morph-d-file.js";

it("getDerivedClassesRecursive() covers direct and indirect derived classes", () => {
  const derivedFromTypeNode: ReadonlySet<ClassDeclaration> = getDerivedClassesRecursive("TypeNode");
  expect(derivedFromTypeNode.has(
    TS_MORPH_D.getClassOrThrow("LiteralTypeNode")
  )).withContext("LiteralTypeNode (direct)").toBeTrue();

  expect(derivedFromTypeNode.has(
    TS_MORPH_D.getClassOrThrow("TypeLiteralNode")
  )).withContext("TypeLiteralNode (indirect)").toBeTrue();
});
