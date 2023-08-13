import {
  JSDocStructure,
  JSDocTagStructure,
  JSDocableNodeStructure,
  OptionalKind,
  StructureKind,
} from "ts-morph";

import { stringOrWriterFunction } from "../types/ts-morph-native.mjs";
import { CloneableStructure } from "../types/CloneableStructure.mjs";
import JSDocTagImpl from "./JSDocTagImpl.mjs";
import StructureBase from "../base/StructureBase.mjs";
import StructuresClassesMap from "../base/StructuresClassesMap.mjs";

export default class JSDocImpl
extends StructureBase
implements JSDocStructure
{
  description: stringOrWriterFunction | undefined = undefined;
  tags: JSDocTagStructure[] = [];
  readonly kind: StructureKind.JSDoc = StructureKind.JSDoc;

  public static clone(
    other: OptionalKind<JSDocStructure>
  ): JSDocImpl
  {
    const clone = new JSDocImpl;
    clone.description = other.description;
    if (other.tags) {
      clone.tags = other.tags.map(tag => JSDocTagImpl.clone(tag));
    }

    StructureBase.cloneTrivia(other, clone);

    return clone;
  }

  public static cloneArray(
    other: JSDocableNodeStructure
  ): (string | JSDocImpl)[]
  {
    if (!other.docs)
      return [];
    return other.docs.map(doc => {
      if (typeof doc === "string")
        return doc;
      return JSDocImpl.clone(doc);
    });
  }
}

JSDocImpl satisfies CloneableStructure<JSDocStructure>;

StructuresClassesMap.set(StructureKind.JSDoc, JSDocImpl);
