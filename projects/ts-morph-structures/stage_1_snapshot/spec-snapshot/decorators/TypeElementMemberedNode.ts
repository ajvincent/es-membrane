import MultiMixinBuilder from "mixin-decorators";

import {
  TypeElementMemberedNodeStructure,
} from "ts-morph";

import StructureBase from "#stage_one/prototype-snapshot/base/StructureBase.js";

import TypeElementMemberedNode, {
  type TypeElementMemberedNodeStructureFields
} from "#stage_one/prototype-snapshot/decorators/TypeElementMemberedNode.js";

import {
  CallSignatureDeclarationImpl,
  ConstructSignatureDeclarationImpl,
  IndexSignatureDeclarationImpl,
  MethodSignatureImpl,
  PropertySignatureImpl
} from "#stage_one/prototype-snapshot/exports.js";

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
