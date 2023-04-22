import MixinBase from "../source/MixinBase.mjs";
import type {
  StaticAndInstance
} from "../source/types/StaticAndInstance.mjs";

import type {
  SubclassDecorator
} from "../source/types/SubclassDecorator.mjs";

interface XVector extends StaticAndInstance {
  staticFields: {
    xCoord: number;
  }
  instanceFields: {
    get xLength(): number;
    set xLength(value: number);
  }
}

interface YVector extends StaticAndInstance {
  staticFields: {
    yCoord: number;
  }
  instanceFields: {
    yLength: number;
  }
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
    #xLength = 0;

    constructor(...args: unknown[]) {
      super(...args);
    }

    get xLength(): number {
      return this.#xLength;
    }

    set xLength(value: number) {
      this.#xLength = value;
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

export {
  XVector,
  YVector,
  Mixin_XVector,
  Mixin_YVector,
  type VectorInterfaces,
};
