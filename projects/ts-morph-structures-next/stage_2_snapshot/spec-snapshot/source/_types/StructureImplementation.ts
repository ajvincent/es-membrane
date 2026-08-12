import  {
  JSDocTag,
  type JSDocTagStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";

import type {
  StructureImplementation,
  StructureImplementationStatic
} from "#stage_two/snapshot/source/types/StructureImplementation.js";

import type {
  stringOrWriterFunction,
} from "#stage_two/snapshot/source/types/stringOrWriterFunction.js";

class ImplStub implements StructureImplementation<
  StructureKind.JSDocTag,
  JSDocTagStructure
>
{
  readonly kind: StructureKind.JSDocTag = StructureKind.JSDocTag;
  readonly leadingTrivia: stringOrWriterFunction[] = [];
  readonly trailingTrivia: stringOrWriterFunction[] = [];

  static fromStructure(
    source: OptionalKind<JSDocTagStructure>
  ): ImplStub
  {
    void(source);
    throw new Error("not yet implemented");
  }

  static fromNode(
    source: JSDocTag
  ): StructureImplementation<StructureKind.JSDocTag, JSDocTagStructure> {
    void(source);
    throw new Error("foo");
  }

  toJSON(): JSDocTagStructure
  {
    throw new Error("Method not implemented.");
  }
}
ImplStub satisfies StructureImplementationStatic<
  StructureKind.JSDocTag,
  JSDocTagStructure,
  JSDocTag
>;

it("StructureImplementation compiles and is a good base for building structure classes", () => {
  expect(ImplStub).toBeTruthy();
});
