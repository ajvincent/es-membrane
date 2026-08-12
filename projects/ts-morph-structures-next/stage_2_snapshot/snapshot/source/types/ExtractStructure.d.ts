import type {
  KindedStructure,
  OptionalKind,
  StructureKind,
  Structures,
} from "ts-morph";

export type ExtractStructure<Kind extends StructureKind> = Extract<
  Structures,
  OptionalKind<KindedStructure<Kind>>
>;
