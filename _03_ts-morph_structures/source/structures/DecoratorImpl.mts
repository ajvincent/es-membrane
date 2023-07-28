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
import StructureBase from "../decorators/StructureBase.mjs";

export default class DecoratorImpl
extends StructureBase
implements DecoratorStructure
{
  name: string;
  arguments: stringOrWriterFunction[] = [];
  typeArguments: string[] = [];
  readonly kind: StructureKind.Decorator = StructureKind.Decorator;

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
    const newDecorator = new DecoratorImpl(other.name);

    StructureBase.cloneTrivia(other, newDecorator);
    newDecorator.arguments = stringOrWriterFunctionArray(other.arguments);
    newDecorator.typeArguments = other.typeArguments?.slice() ?? [];

    return newDecorator;
  }
}
DecoratorImpl satisfies CloneableStructure<DecoratorStructure>;
