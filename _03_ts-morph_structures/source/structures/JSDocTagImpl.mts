// #region preamble
import {
  type JSDocTagStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";

import StructureBase from "../base/StructureBase.mjs";

import StructuresClassesMap from "../base/StructuresClassesMap.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";
// #endregion preamble

export default class JSDocTagImpl
extends StructureBase
implements JSDocTagStructure
{
  readonly kind: StructureKind.JSDocTag = StructureKind.JSDocTag;
  tagName: string;
  text: stringOrWriterFunction | undefined;

  constructor(tagName: string)
  {
    super();
    this.tagName = tagName;
  }

  public static clone(
    other: OptionalKind<JSDocTagStructure>
  ): JSDocTagImpl
  {
    const clone = new JSDocTagImpl(other.tagName);
    clone.text = other.text;

    StructureBase.cloneTrivia(other, clone);

    return clone;
  }
}
JSDocTagImpl satisfies CloneableStructure<JSDocTagStructure>;

StructuresClassesMap.set(StructureKind.JSDocTag, JSDocTagImpl);
