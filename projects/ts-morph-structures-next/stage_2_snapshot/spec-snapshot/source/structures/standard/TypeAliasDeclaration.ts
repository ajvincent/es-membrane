import {
  TypeAliasDeclarationImpl
} from "#stage_two/snapshot/source/exports.js";

it("TypeAliasDeclarationImpl preserves its type through a clone operation", () => {
  let alias = new TypeAliasDeclarationImpl("MyBoolean", "boolean");
  expect(alias.name).toBe("MyBoolean");
  expect(alias.type).toBe("boolean");

  alias = Object.assign({}, alias);
  expect(alias.name).toBe("MyBoolean");
  expect(alias.type).toBe("boolean");
});
