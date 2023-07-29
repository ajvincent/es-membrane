import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";
import StructureBase from "#ts-morph_structures/source/decorators/StructureBase.mjs";

import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "#ts-morph_structures/source/decorators/JSDocableNode.mjs";

import {
  JSDocImpl,
  JSDocTagImpl,
} from "#ts-morph_structures/exports.mjs";

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
