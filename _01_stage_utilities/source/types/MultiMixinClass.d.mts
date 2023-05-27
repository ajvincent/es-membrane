import type {
  TupleToUnion,
  UnionToIntersection,
  Simplify,
} from "type-fest";

import type {
  MixinClass
} from "./MixinClass.mjs";

import type {
  StaticAndInstance
} from "./StaticAndInstance.mjs";

import MixinBase from "../MixinBase.mjs";

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
 * Build an intersection type of a sequence of static and instance interfaces, and the MixinBase class.
 *
 * @typeParam Interfaces - the sequence of static and instance interfaces.
 * @internal - this depends on MixinBase, which is internal to es-membrane.
 */
export type MultiMixinClass<
  Interfaces extends ReadonlyArray<StaticAndInstance>,
  Base extends typeof MixinBase,
> = MixinClass<
  ExtractFields<Interfaces, "staticFields">,
  ExtractFields<Interfaces, "instanceFields">,
  Base
>;
