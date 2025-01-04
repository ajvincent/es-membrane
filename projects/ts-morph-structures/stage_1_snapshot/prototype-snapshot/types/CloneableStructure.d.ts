import type {
  Class,
} from "type-fest";

import type {
  OptionalKind,
  Structure,
} from "ts-morph"

import type {
  TypeStructures
} from "../typeStructures/TypeStructures.js";

export type CloneableStructure<Base extends Structure | TypeStructures> = Class<Base> & {
  clone(other: OptionalKind<Base> | Base): Base
};
