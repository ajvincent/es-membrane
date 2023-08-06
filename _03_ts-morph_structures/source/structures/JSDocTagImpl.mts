import {
  JSDocTagStructure,
  OptionalKind,
  StructureKind,
} from "ts-morph";

import { stringOrWriterFunction } from "../types/ts-morph-native.mjs";
import { CloneableStructure } from "../types/CloneableStructure.mjs";
import StructureBase from "../decorators/StructureBase.mjs";
import StructuresClassesMap from "./StructuresClassesMap.mjs";

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
