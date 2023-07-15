/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  Class
} from "type-fest";

import type {
  ClassDecoratorFunction
} from "./ClassDecoratorFunction.mjs";

import type {
  MixinClass
} from "./MixinClass.mjs";

import type {
  StaticAndInstance,
  StaticAndInstanceArray,
} from "./StaticAndInstance.mjs";

/**
 * A convenience decorator type for subclass mixins.
 *
 * @typeParam Added - the static and instance fields to require.
 */
export type SubclassDecorator<
  Base extends Class<object>,
  Added extends StaticAndInstance<symbol>,
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
  Base extends Class<object>,
  Interfaces extends ReadonlyArray<StaticAndInstance<symbol>>,
  Arguments extends any[] | false
> =
  StaticAndInstanceArray<Interfaces> extends never ? never :
  { [key in keyof Interfaces]: SubclassDecorator<Base, Interfaces[key], Arguments> };
