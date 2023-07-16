import type {
  Class,
} from "type-fest";

import type {
  OptionalKind,
  Structure,
} from "ts-morph"

export type CloneableStructure<Base extends Structure> = Class<Base> & {
  clone(other: OptionalKind<Base>): Base
};
