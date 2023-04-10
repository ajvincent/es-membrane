// XXX ajvincent This is very much a scratchpad file, and I may throw it away soon!  Don't rely on it! */

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import type {
  CtorParamsAndArgs,
} from "./UtilityTypes.mjs";
// #region
class MixinBase {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(...args: any[])
  {
    // do nothing
  }
}

type MixinBaseType = typeof MixinBase;

type AnyCtor = (new (...args: any[]) => any);

type A = AnyCtor extends typeof MixinBase ? true : false;
//   ^?

type B = CtorParamsAndArgs<MixinBaseType>;
//   ^?

type C = Constructor<{ hasTrue: true}, []>;
//   ^?

type D = CtorParamsAndArgs<C>;
//   ^?
// #endregion

// #region Can we simulate this with a symbol?

const PROTOTYPE_SYMBOL = Symbol("Prototype simulator");

interface Foo {
    readonly x: 3;
}

type Q1 = unknown extends any ? true : false;
//   ^?
type Q2 = unknown extends object ? true : false;
//   ^?
type Q3 = unknown extends Foo ? true : false;
//   ^?

// https://github.com/sindresorhus/type-fest/blob/main/source/basic.d.ts
type Constructor<
  T, Arguments extends unknown[] = any[]
> = new(...arguments_: Arguments) => T;

type ConstructorWithSymbol<
  T, Arguments extends unknown[] = any[]
> = new(...arguments_: Arguments) => T & { [PROTOTYPE_SYMBOL]: T};

type Q4 = ConstructorWithSymbol<Foo>;
//   ^?
type Q5 = CtorParamsAndArgs<Q4>;
//   ^?

type ImpliedPrototype<Maybe> =
  Maybe extends (new (...args: any[]) => { [PROTOTYPE_SYMBOL]: infer S }) ? S :
  Maybe extends (new (...args: any[]) => infer T) ? T :
  never;

type Q7 = ImpliedPrototype<typeof MixinBase>; // MixinBase
//   ^?
type Q8 = ImpliedPrototype<Q4>; // Foo
//   ^?

class MixinTest extends MixinBase {
  static build<Maybe extends Constructor<object>>() : ImpliedPrototype<Maybe>
  {
    return (new MixinTest() as ImpliedPrototype<Maybe>);
  }
}
void(MixinTest);
