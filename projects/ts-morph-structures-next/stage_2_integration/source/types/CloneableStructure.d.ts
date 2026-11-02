import type {
  Class,
} from "type-fest";

import type {
  OptionalKind,
  Structure,
} from "ts-morph";

import type {
  AugmentedStatementStructures,
  StructureImpls,
  TypeStructures,
} from "../../snapshot/source/exports.js";

export type CloneableStructure<Base extends Structure, Result extends StructureImpls> = Class<Base> & {
  clone(other: OptionalKind<Base> | Base): Result
};

export type CloneableTypeStructure<Base extends TypeStructures> = Class<Base> & {
  clone(other: Base): Base
};

export type CloneableStatementStructure<Base extends AugmentedStatementStructures> = Class<Base> & {
  clone(other: Base): Base
};
