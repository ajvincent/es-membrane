import {
  TypeElementMemberedNodeStructure
} from "ts-morph";

import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";
import StructureBase from "#ts-morph_structures/source/base/StructureBase.mjs";

import TypeElementMemberedNode, {
  type TypeElementMemberedNodeStructureFields
} from "#ts-morph_structures/source/decorators/TypeElementMemberedNode.mjs";

import {
  CallSignatureDeclarationImpl,
  ConstructSignatureDeclarationImpl,
  IndexSignatureDeclarationImpl,
  MethodSignatureImpl,
  PropertySignatureImpl
} from "#ts-morph_structures/exports.mjs";

it("ts-morph structure decorators: TypeElementMemberedNode", () => {
  const Foo = MultiMixinBuilder<[
    TypeElementMemberedNodeStructureFields
  ], typeof StructureBase>
  (
    [TypeElementMemberedNode],
    StructureBase
  );

  const target = new Foo;
  expect(target.callSignatures).toEqual([]);
  expect(target.constructSignatures).toEqual([]);
  expect(target.indexSignatures).toEqual([]);
  expect(target.methods).toEqual([]);
  expect(target.properties).toEqual([]);

  const callSignature = new CallSignatureDeclarationImpl;
  callSignature.returnType = "callReturn";

  const constructSignature = new ConstructSignatureDeclarationImpl;
  constructSignature.returnType = "NumberStringType";

  const indexSignature = new IndexSignatureDeclarationImpl;
  indexSignature.keyName = "indexName";
  indexSignature.keyType = "indexType";

  const methodSignature = new MethodSignatureImpl("repeatForward");

  const propertySignature = new PropertySignatureImpl("isReady");

  const typeElementMembered: TypeElementMemberedNodeStructure = {
    callSignatures: [callSignature],
    constructSignatures: [constructSignature],
    indexSignatures: [indexSignature],
    methods: [methodSignature],
    properties: [propertySignature],
  };

  Foo.cloneTypeElementMembered(
    typeElementMembered,
    target
  );

  expect(target.callSignatures).toEqual([callSignature]);
  expect(target.constructSignatures).toEqual([constructSignature]);
  expect(target.indexSignatures).toEqual([indexSignature]);
  expect(target.methods).toEqual([methodSignature]);
  expect(target.properties).toEqual([propertySignature]);

  expect(target.callSignatures[0]).not.toBe(callSignature);
  expect(target.constructSignatures[0]).not.toBe(constructSignature);
  expect(target.indexSignatures[0]).not.toBe(indexSignature);
  expect(target.methods[0]).not.toBe(methodSignature);
  expect(target.properties[0]).not.toBe(propertySignature);
});
