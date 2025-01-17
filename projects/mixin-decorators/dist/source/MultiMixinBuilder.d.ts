import type { Class } from "type-fest";
import type { StaticAndInstance } from "./types/StaticAndInstance.js";
import type { SubclassDecoratorSequence } from "./types/SubclassDecorator.js";
import type { MultiMixinClass } from "./types/MultiMixinClass.js";
/**
 * Build a mixin class inheriting from `MixinBase`.
 *
 * @typeParam Interfaces - the sequence of static and instance interfaces.
 * @param decorators - a sequence which creates and returns subclasses of MixinBase.  This must match the ordering of Interfaces.
 */
declare function MultiMixinBuilder<Interfaces extends readonly StaticAndInstance<symbol>[], Base extends Class<object>>(decorators: SubclassDecoratorSequence<Interfaces, Base, false>, baseClass: Base): MultiMixinClass<Interfaces, Base>;
export default MultiMixinBuilder;
export { type MultiMixinClass };
