import {
  ClassFieldStatementsMap
} from "#stage_two/snapshot/source/exports.js";

it("ClassFieldStatementsMap works", () => {
  const map = new ClassFieldStatementsMap;
  map.set("second", "constructor", ["this.second = second;"]);
  map.set("first", "constructor", ["this.first = first;"]);
  map.set("first", "toJSON", ["rv.first = this.first;"]);

  map.set(ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL, "toJSON", ["const rv: Record<string, unknown> = {};"]);
  map.set(ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN, "toJSON", ["return rv;"]);

  // s/\b[gs]et // for initializers
  map.set("get first", ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY, [`"one"`]);

  expect(map.groupKeys()).toEqual([
    "constructor",
    "toJSON",
    ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY,
  ]);

  expect(Array.from(
    map.groupStatementsMap(ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY)!.entries()
  )).toEqual([
    ["first", [`"one"`]]
  ]);

  expect(Array.from(map.groupStatementsMap("toJSON")!.entries())).toEqual([
    [ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL, ["const rv: Record<string, unknown> = {};"]],
    ["first", ["rv.first = this.first;"]],
    [ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN, ["return rv;"]],
  ]);

  expect(Array.from(map.groupStatementsMap("constructor")!.entries())).toEqual([
    ["first", ["this.first = first;"]],
    ["second", ["this.second = second;"]],
  ]);
});
