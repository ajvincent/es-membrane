import {
  OptionalKind,
  DecoratorStructure,
  StructureKind,
} from "ts-morph";

import {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  stringOrWriterFunctionArray
} from "./utilities.mjs";
import { CloneableStructure } from "../types/CloneableStructure.mjs";

import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";
import StructureBase from "../decorators/StructureBase.mjs";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.mjs";
import NamedNode, {
  type NamedNodeStructureFields
} from "../decorators/NamedNode.mjs";
import StructuresClassesMap from "./StructuresClassesMap.mjs";

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
