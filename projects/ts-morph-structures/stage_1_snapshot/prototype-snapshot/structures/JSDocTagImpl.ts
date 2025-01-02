// #region preamble
import {
  type JSDocTagStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";

import StructureBase from "../base/StructureBase.js";

import StructuresClassesMap from "../base/StructuresClassesMap.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
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

  public toJSON(): ReplaceWriterInProperties<JSDocTagStructure>
  {
    return super.toJSON() as ReplaceWriterInProperties<JSDocTagStructure>;
  }
}
JSDocTagImpl satisfies CloneableStructure<JSDocTagStructure>;

StructuresClassesMap.set(StructureKind.JSDocTag, JSDocTagImpl);
