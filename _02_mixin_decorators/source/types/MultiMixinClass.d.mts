import type {
  TupleToUnion,
  UnionToIntersection,
  Simplify,
} from "type-fest";

import type {
  Class,
} from "./Class.mjs";

import type {
  MixinClass,
} from "./MixinClass.mjs";

import type {
  StaticAndInstance,
  StaticAndInstanceArray,
} from "./StaticAndInstance.mjs";

/**
 * Build an intersection of either the static interfaces or the instance interfaces from a sequence.
 *
 * @typeParam Interfaces - the sequence of static and instance interfaces.
 * @typeParam Field - the field to extract.
 */
type ExtractFields<
  Interfaces extends ReadonlyArray<StaticAndInstance>,
  Field extends keyof StaticAndInstance
> = Simplify<UnionToIntersection<TupleToUnion<
  { [key in keyof Interfaces]: Interfaces[key][Field] }
>>>;

/**
 * Build an intersection type of a sequence of static and instance interfaces, and an underlying class.
 *
 * @typeParam Interfaces - the sequence of static and instance interfaces.
 */
export type MultiMixinClass<
  Interfaces extends ReadonlyArray<StaticAndInstance>,
  Base extends Class<object>,
> =
  StaticAndInstanceArray<Interfaces> extends never ? never :
  MixinClass<
    ExtractFields<Interfaces, "staticFields">,
    ExtractFields<Interfaces, "instanceFields">,
    Base
  >
;