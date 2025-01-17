# Mixin classes via decorators

TypeScript 5.0 introduces us to [ECMAScript decorators](https://github.com/tc39/proposal-decorators), which are quite different from the experimental decorators of the past.  With a little bit of wiring, and some _very_ specific constraints, we can build a new kind of [mix-in class](https://www.typescriptlang.org/docs/handbook/mixins.html).

`MultiMixinBuilder` and its helper types (`SubclassDecorator`, `StaticAndInstance` most notably) provide everything you need to build out your mix-in.  The main benefit of `MultiMixinBuilder` is it returns a `Class` with an aggregate type, combining all the static and instance fields you defined.  Built-in TypeScript 5 decorators don't provide the aggregate type.

## Example

```typescript
import MultiMixinBuilder, {
  type StaticAndInstance,
  type SubclassDecorator,
} from "mixin-decorators";

class MixinBase {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(...args: any[])
  {
    // do nothing
  }
}

// #region XVector
declare const XVectorKey: unique symbol;

interface XVector extends StaticAndInstance<typeof XVectorKey> {
  staticFields: {
    xCoord: number;
  }
  instanceFields: {
    get xLength(): number;
    set xLength(value: number);
  }
  symbolKey: typeof XVectorKey;
}

const Mixin_XVector: SubclassDecorator<XVector, typeof MixinBase, false> = function(
  this: void,
  _class: typeof MixinBase,
  context: ClassDecoratorContext<typeof MixinBase>,
)
{
  if (context.kind !== "class") {
    throw new Error("what's happening?")
  }

  return class extends _class {
    static xCoord = 12;
    xLength = 0;

    constructor(...args: unknown[]) {
      super(...args);
    }
  }
}
// #endregion XVector

// #region YVector
declare const YVectorKey: unique symbol;

interface YVector extends StaticAndInstance<typeof YVectorKey> {
  staticFields: {
    yCoord: number;
  }
  instanceFields: {
    yLength: number;
  }
  symbolKey: typeof YVectorKey;
}

const Mixin_YVector: SubclassDecorator<YVector, typeof MixinBase, [number]> = function(
  yCoordStatic: number
)
{
  return function(
    this: void,
    _class: typeof MixinBase,
  )
  {
    return class extends _class {
      static yCoord = yCoordStatic;
      yLength = 4;
    }
  }
}
// #endregion YVector

/*
const XYVector =
@Mixin_XVector
@Mixin_YVector(7)
class extends MixinBase {
};
*/

const XYVector = MultiMixinBuilder<[
  XVector, YVector
], typeof MixinBase>
(
  [
    Mixin_XVector, Mixin_YVector(7)
  ], MixinBase
);

const xy = new XYVector;

it("xy", () => {
  expect(xy.xLength).toBe(0);
  expect(xy.yLength).toBe(4);
});

it("XYVector", () => {
  expect(XYVector.xCoord).toBe(12);
  expect(XYVector.yCoord).toBe(7);
});
```

Without `MultiMixinBuilder`. the `xLength` and `yLength` properties of `xy` would be unknown to TypeScript.  Likewise, TypeScript wouldn't know about `XYVector.xCoord` or `XYVector.yCoord`.

## Installation

`npm install --save-dev mixin-decorators`

## Under the hood

### Type definitions

1. A class decorator type which is aware of the new context argument.  [TypeScript 5.0's built-in `ClassDecorator` type won't work.](https://github.com/microsoft/TypeScript/issues/53790).  [`ClassDecoratorFunction`](./source/types/ClassDecoratorFunction.d.ts) fills the bill.
1. Classes have [static fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static), which means a special type to define the static and instance fields of a subclass.  [`StaticAndInstance`](./source/types/StaticAndInstance.d.ts) defines this.
1. Without depending on `StaticAndInstance`, we need a type to define how a mix-in class joins the base class and its subclass's static and instance fields.  [`MixinClass`](./source/types/MixinClass.d.ts) is a little convoluted, but works well.
1. Combining a base class with `StaticAndInstance` and `ClassDecoratorFunction` offers a [`SubclassDecorator`](./source/types/SubclassDecorator.d.ts) type.  An array of `StaticAndInstance` types gives rise to a `SubclassDecoratorSequence` type in the same file.
1. [MultiMixinClass](./source/types/MultiMixinClass.d.ts) defines a `MixinClass` type from an array of `StaticAndInstance` objects.

How do I use these types?

### Classes

- [`MultiMixinBuilder`](./source/MultiMixinBuilder.ts) combines all of the above:
  - It takes a type parameter, `Interfaces`, which is an ordered array of `StaticAndInstance` types.
  - It takes a parameter, `decorators`, which is a `SubclassDecoratorSequence` mapping the `Interfaces` to `SubclassDecorator` instances.
  - It also takes a parameter, `baseClass`, which must be an subclass of `MixinBase`.
  - It returns a `MultiMixinClass` from the base class and invoking all the `SubclassDecorator` functions.

### Rules to follow

- The ordering of decorators in `MultiMixinBuilder` determines the chain of derived-to-base classes.
