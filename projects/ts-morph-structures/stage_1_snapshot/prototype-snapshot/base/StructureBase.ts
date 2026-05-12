import {
  Structure
} from "ts-morph";

import {
  stringOrWriterFunction
} from "../types/ts-morph-native.js";

import {
  ReplaceWriterInProperties
} from "../types/ModifyWriterInTypes.js";

import {
  replaceWriterWithString,
  stringOrWriterFunctionArray,
} from "./utilities.js";

import {
  STRUCTURE_AND_TYPES_CHILDREN
} from "./symbolKeys.js";

import type {
  TypeStructures
} from "../typeStructures/TypeStructures.js";

import type {
  StructureImpls
} from "../types/StructureImplUnions.js";

export default class StructureBase
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];

  public static cloneTrivia(
    source: Structure,
    target: StructureBase
  ): void
  {
    target.leadingTrivia = stringOrWriterFunctionArray(source.leadingTrivia);
    target.trailingTrivia = stringOrWriterFunctionArray(source.trailingTrivia);
  }

  public toJSON(): ReplaceWriterInProperties<Structure>
  {
    return {
      ...this,
      leadingTrivia: this.leadingTrivia.map(replaceWriterWithString<string>),
      trailingTrivia: this.trailingTrivia.map(replaceWriterWithString<string>)
    };
  }

  /** @internal */
  public * [STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures> {
    // do nothing
  }
}
