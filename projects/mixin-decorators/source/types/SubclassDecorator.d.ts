/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  Class
} from "type-fest";

import type {
  ClassDecoratorFunction
} from "./ClassDecoratorFunction.js";

import type {
  MixinClass
} from "./MixinClass.js";

import type {
  StaticAndInstance,
  StaticAndInstanceArray,
} from "./StaticAndInstance.js";

/**
 * A convenience decorator type for subclass mixins.
 *
 * @typeParam Added - the static and instance fields to require.
 */
export type SubclassDecorator<
  Added extends StaticAndInstance<symbol>,
  Base extends Class<object>,
  Arguments extends any[] | false
> = ClassDecoratorFunction<
  Base,
  MixinClass<Added["staticFields"], Added["instanceFields"], Base>,
  Arguments
>;

/**
 * A type to assert a tuple of decorators matches a tuple of class field interfaces.
 * @typeParam Interfaces - the class field interfaces.
 */
export type SubclassDecoratorSequence<
  Interfaces extends readonly StaticAndInstance<symbol>[],
  Base extends Class<object>,
  Arguments extends any[] | false
> =
  StaticAndInstanceArray<Interfaces> extends never ? never :
  { [key in keyof Interfaces]: SubclassDecorator<Interfaces[key], Base, Arguments> };
