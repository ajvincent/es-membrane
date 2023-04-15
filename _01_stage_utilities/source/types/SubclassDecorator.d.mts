import type {
  ClassDecoratorReplaces
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
  Added extends StaticAndInstance
> = ClassDecoratorReplaces<
  typeof MixinBase,
  MixinClass<Added["staticFields"], Added["instanceFields"], typeof MixinBase>
>;

/**
 * A type to assert a tuple of decorators matches a tuple of class field interfaces.
 * @typeParam Interfaces - the class field interfaces.
 * @internal - this depends on MixinBase, which is internal to es-membrane.
 */
export type SubclassDecoratorSequence<
  Interfaces extends ReadonlyArray<StaticAndInstance>
> = { [key in keyof Interfaces]: SubclassDecorator<Interfaces[key]> };
