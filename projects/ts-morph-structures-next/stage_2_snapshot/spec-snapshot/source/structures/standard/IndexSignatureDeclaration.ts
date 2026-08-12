import {
  CodeBlockWriter
} from "ts-morph";

import {
  ArrayTypeStructureImpl,
  LiteralTypeStructureImpl,
  IndexSignatureDeclarationImpl,
  PropertySignatureImpl
} from "#stage_two/snapshot/source/exports.js";

it("IndexSignatureDeclarationImpl::keyType refuses to work with writer functions", () => {
  const propDecl = new PropertySignatureImpl("foo");
  propDecl.type = "string";

  let decl: IndexSignatureDeclarationImpl = new IndexSignatureDeclarationImpl();
  expect(decl.keyType).toBeUndefined();

  decl.keyType = propDecl.type;
  expect(decl.keyType).toBe("string");

  propDecl.type = (writer: CodeBlockWriter) => {
    writer.write("string");
  };

  // @ts-expect-error keyType rejects writer functions
  decl.keyType = (writer: CodeBlockWriter) => {
    writer.write("string");
  };

  decl.keyType = undefined;
  expect(decl.keyType).toBeUndefined();

  const stringArrayType = new ArrayTypeStructureImpl(LiteralTypeStructureImpl.get("string"));
  decl = new IndexSignatureDeclarationImpl();
  propDecl.typeStructure = stringArrayType;
  decl.keyTypeStructure = stringArrayType;
  expect(typeof propDecl.type).toBe("function");
  expect(decl.keyType).toBe("string[]");

  decl.keyTypeStructure = undefined;
  expect(decl.keyType).toBeUndefined();
});
