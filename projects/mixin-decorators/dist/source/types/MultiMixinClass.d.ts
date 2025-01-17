import type {
  Class,
  TupleToUnion,
  UnionToIntersection,
  Simplify,
} from "type-fest";

import type {
  MixinClass,
} from "./MixinClass.js";

import type {
  StaticAndInstance,
  StaticAndInstanceArray,
} from "./StaticAndInstance.js";

/**
 * Build an intersection of either the static interfaces or the instance interfaces from a sequence.
 *
 * @typeParam Interfaces - the sequence of static and instance interfaces.
 * @typeParam Field - the field to extract.
 */
type ExtractFields<
  Interfaces extends readonly StaticAndInstance<symbol>[],
  Field extends keyof StaticAndInstance<symbol>
> = Simplify<UnionToIntersection<TupleToUnion<
  { [key in keyof Interfaces]: Interfaces[key][Field] }
>>>;

/**
 * Build an intersection type of a sequence of static and instance interfaces, and an underlying class.
 *
 * @typeParam Interfaces - the sequence of static and instance interfaces.
 */
export type MultiMixinClass<
  Interfaces extends readonly StaticAndInstance<symbol>[],
  Base extends Class<object>,
> =
  StaticAndInstanceArray<Interfaces> extends never ? never :
  MixinClass<
    ExtractFields<Interfaces, "staticFields">,
    ExtractFields<Interfaces, "instanceFields">,
    Base
  >
;
