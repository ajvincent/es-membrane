import MixinBase from "../source/MixinBase.mjs";

import type {
  StaticAndInstance
} from "../source/types/StaticAndInstance.mjs";

import type {
  SubclassDecorator
} from "../source/types/SubclassDecorator.mjs";

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

const Mixin_XVector: SubclassDecorator<typeof MixinBase, XVector, false> = function(
  this: void,
  _class,
  context
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

const Mixin_YVector: SubclassDecorator<typeof MixinBase, YVector, false> = function(
  this: void,
  _class
)
{
  return class extends _class {
    static yCoord = 7;
    yLength = 4;
  }
}

type VectorInterfaces = [XVector, YVector];

class MarkCalledBase extends MixinBase {
  #protectedCalled = false;
  get protectedCalled(): boolean {
    return this.#protectedCalled;
  }

  protected markCalledInternal(): void {
    this.#protectedCalled = true;
  }
}

const MarkCalledKey = Symbol("mark called");

interface MarkCalledFields {
  staticFields: object,
  instanceFields: {
    markCalled(this: MarkCalledBase): void;
  },
  symbolKey: typeof MarkCalledKey
}

export {
  XVector,
  YVector,
  Mixin_XVector,
  Mixin_YVector,
  type VectorInterfaces,
  MarkCalledBase,
  MarkCalledFields,
};
