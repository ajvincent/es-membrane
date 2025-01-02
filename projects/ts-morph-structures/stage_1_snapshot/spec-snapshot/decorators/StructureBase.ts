import StructureBase from "#stage_one/prototype-snapshot/base/StructureBase.js";

import type {
  WriterFunction
} from "ts-morph";

it("ts-morph structure decorators: StructureBase base class", () => {
  const structure = new StructureBase;
  StructureBase.cloneTrivia({}, structure);
  expect(structure.leadingTrivia).toEqual([]);
  expect(structure.trailingTrivia).toEqual([]);

  const worldWriter: WriterFunction = writer => writer.write("world");

  StructureBase.cloneTrivia({
    leadingTrivia: "hello",
    trailingTrivia: worldWriter
  }, structure);

  expect(structure.leadingTrivia).toEqual(["hello"]);
  expect(structure.trailingTrivia).toEqual([worldWriter]);

  StructureBase.cloneTrivia({
    leadingTrivia: [worldWriter],
    trailingTrivia: ["hello"],
  }, structure);

  expect(structure.leadingTrivia).toEqual([worldWriter]);
  expect(structure.trailingTrivia).toEqual(["hello"]);
});
