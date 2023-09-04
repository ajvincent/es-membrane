// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type DecoratorStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";

import StructureBase from "../base/StructureBase.mjs";

import StructuresClassesMap from "../base/StructuresClassesMap.mjs";

import {
  stringOrWriterFunctionArray
} from "../base/utilities.mjs";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.mjs";
import NamedNode, {
  type NamedNodeStructureFields
} from "../decorators/NamedNode.mjs";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
// #endregion preamble

const DecoratorBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.Decorator>,
    NamedNodeStructureFields,
  ], typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.Decorator>(StructureKind.Decorator),
    NamedNode,
  ],
  StructureBase
)

export default class DecoratorImpl
extends DecoratorBase
implements DecoratorStructure
{
  arguments: stringOrWriterFunction[] = [];
  typeArguments: string[] = [];

  constructor(
    name: string
  )
  {
    super();
    this.name = name;
  }

  public static clone(
    other: OptionalKind<DecoratorStructure>
  ): DecoratorImpl
  {
    const clone = new DecoratorImpl(other.name);

    DecoratorBase.cloneTrivia(other, clone);
    DecoratorBase.cloneNamed(other, clone);

    clone.arguments = stringOrWriterFunctionArray(other.arguments);
    clone.typeArguments = other.typeArguments?.slice() ?? [];

    return clone;
  }
}
DecoratorImpl satisfies CloneableStructure<DecoratorStructure>;

StructuresClassesMap.set(StructureKind.Decorator, DecoratorImpl);
