/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ClassDecoratorFunction
} from "./ClassDecoratorTypes.mjs";

import type {
  MixinClass
} from "./MixinClass.mjs";

import type {
  StaticAndInstance
} from "./StaticAndInstance.mjs";

import MixinBase from "../MixinBase.mjs";

/**
 * A convenience decorator type for subclass mixins.
 *
 * @typeParam Added - the static and instance fields to require.
 * @internal - this depends on MixinBase, which is internal to es-membrane.
 */
export type SubclassDecorator<
  Added extends StaticAndInstance,
  Arguments extends any[] | false
> = ClassDecoratorFunction<
  typeof MixinBase,
  MixinClass<Added["staticFields"], Added["instanceFields"], typeof MixinBase>,
  Arguments
>;

/**
 * A type to assert a tuple of decorators matches a tuple of class field interfaces.
 * @typeParam Interfaces - the class field interfaces.
 * @internal - this depends on MixinBase, which is internal to es-membrane.
 */
export type SubclassDecoratorSequence<
  Interfaces extends ReadonlyArray<StaticAndInstance>,
  Arguments extends any[] | false
> = { [key in keyof Interfaces]: SubclassDecorator<Interfaces[key], Arguments> };
