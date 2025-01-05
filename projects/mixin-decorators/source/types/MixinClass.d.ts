import type {
	Class,
} from "type-fest";

/**
A type for mixin classes, particularly useful when applying [ECMAScript decorators](https://www.typescriptlang.org/docs/handbook/mixins.html#decorators-and-mixins-4881).

@typeParam AddedStatic - static fields for the mixin.
@typeParam AddedInstance - fields for instances of the mixin.
@typeParam BaseClass - the type of your base class.
@typeParam Arguments - arguments for your constructor.
 */
export type MixinClass<
  AddedStatic extends object,
	AddedInstance extends object,
	BaseClass extends Class<object>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Arguments extends unknown[] = ConstructorParameters<BaseClass>
> = (
	Class<InstanceType<BaseClass> & AddedInstance, Arguments> &
	Omit<BaseClass, never> &
	AddedStatic
);

/*
@example

type FirstClassInterface = {
	readonly index: number;
};
class FirstClass implements FirstClassInterface {
	static beginning = 'opening';

	readonly index: number;

	// Mixin classes often require the `...args: any[]` constructor of base classes.
	// This is the obscure "mixin class must have a constructor with a single rest parameter of type 'any[]'" (ts2545) error.
	// Especially, you'll hit this with type-parametered functions generating derived classes.
	constructor(...args: any[]) {
		this.index = 7;
	}
}

type SecondClassStaticInterface = {
	middle: string;
};
type SecondClassInterface = {
	isMiddle: boolean;
};

function buildSecondClass<
	Middle extends string,
	IsMiddle extends boolean
>(
	middle: Middle,
	isMiddle: IsMiddle
) : MixinClass<SecondClassStaticInterface, SecondClassInterface, typeof FirstClass>
{
	return class extends FirstClass {
		static middle = middle;
		isMiddle = isMiddle;
	};
}

const SecondClass = buildSecondClass<"isMiddle" | "isMedian", true>("isMedian", true);

How it works:

Class<InstanceType<BaseClass> & AddedInstance, Arguments>
This builds a new class with a new prototype, mixing the results of calling `new BaseClass` with AddedInstance.

Omit<BaseClass, never>
This imports static fields and excludes the constructor from the base class.

AddedStatic
This adds the static class fields.
*/
