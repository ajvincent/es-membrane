import MultiMixinBuilder from "mixin-decorators";

import StructureBase from "#stage_one/prototype-snapshot/base/StructureBase.js";

import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "#stage_one/prototype-snapshot/decorators/JSDocableNode.js";

import {
  JSDocImpl,
  JSDocTagImpl,
} from "#stage_one/prototype-snapshot/exports.js";

it("ts-morph structure decorators: JSDocableNode", () => {
  const Foo = MultiMixinBuilder<[
    JSDocableNodeStructureFields
  ], typeof StructureBase>
  (
    [JSDocableNode],
    StructureBase
  );

  const target = new Foo;
  expect(target.docs).toEqual([]);

  Foo.cloneJSDocable({}, target);
  expect(target.docs).toEqual([]);

  Foo.cloneJSDocable({
    docs: []
  }, target);
  expect(target.docs).toEqual([]);

  Foo.cloneJSDocable({
    docs: ["hello"]
  }, target);
  expect(target.docs).toEqual(["hello"]);

  const docImpl = new JSDocImpl;
  docImpl.description = "description";
  docImpl.leadingTrivia = ["hello"];
  docImpl.trailingTrivia = ["goodbye"];
  docImpl.tags.push(new JSDocTagImpl("tag"));

  Foo.cloneJSDocable({
    docs: [docImpl]
  }, target);

  expect(target.docs).toEqual([docImpl]);
});
