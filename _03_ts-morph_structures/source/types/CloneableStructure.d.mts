import type {
  Class,
} from "type-fest";

import type {
  OptionalKind,
  Structure,
} from "ts-morph"

import type {
  TypeStructure
} from "../typeStructures/TypeStructure.mjs";

export type CloneableStructure<Base extends Structure | TypeStructure> = Class<Base> & {
  clone(other: OptionalKind<Base> | Base): Base
};
