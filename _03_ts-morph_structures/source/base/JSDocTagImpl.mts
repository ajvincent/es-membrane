import {
  JSDocTagStructure,
  OptionalKind,
  StructureKind,
} from "ts-morph";

import { stringOrWriterFunction } from "../types/ts-morph-native.mjs";
import { CloneableStructure } from "../types/CloneableStructure.mjs";
import { stringOrWriterFunctionArray } from "./utilities.mjs";

export default class JSDocTagImpl
implements JSDocTagStructure
{
  readonly kind: StructureKind.JSDocTag = StructureKind.JSDocTag;
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  tagName: string;
  text: stringOrWriterFunction | undefined;

  constructor(tagName: string)
  {
    this.tagName = tagName;
  }

  public static clone(
    other: OptionalKind<JSDocTagStructure>
  ): JSDocTagImpl
  {
    const tag = new JSDocTagImpl(other.tagName);

    tag.leadingTrivia = stringOrWriterFunctionArray(other.leadingTrivia);
    tag.trailingTrivia = stringOrWriterFunctionArray(other.trailingTrivia);
    tag.text = other.text;

    return tag;
  }
}
JSDocTagImpl satisfies CloneableStructure<JSDocTagStructure>;
