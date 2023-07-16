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

export default class DecoratorImpl implements OptionalKind<DecoratorStructure>
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  name: string;
  arguments: stringOrWriterFunction[] = [];
  typeArguments: string[] = [];
  readonly kind: StructureKind.Decorator = StructureKind.Decorator;

  constructor(
    name: string
  )
  {
    this.name = name;
  }

  public static clone(
    other: OptionalKind<DecoratorStructure>
  ): DecoratorImpl
  {
    const newDecorator = new DecoratorImpl(other.name);

    newDecorator.leadingTrivia = stringOrWriterFunctionArray(other.leadingTrivia);
    newDecorator.trailingTrivia = stringOrWriterFunctionArray(other.trailingTrivia);
    newDecorator.arguments = stringOrWriterFunctionArray(other.arguments);
    newDecorator.typeArguments = other.typeArguments?.slice() ?? [];

    return newDecorator;
  }
}
DecoratorImpl satisfies CloneableStructure<DecoratorStructure>;
