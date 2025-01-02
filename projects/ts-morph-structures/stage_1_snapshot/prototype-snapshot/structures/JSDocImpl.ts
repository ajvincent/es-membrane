// #region preamble
import {
  type JSDocStructure,
  type JSDocTagStructure,
  type JSDocableNodeStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";

import {
  JSDocTagImpl
} from "../exports.js";

import StructureBase from "../base/StructureBase.js";

import StructuresClassesMap from "../base/StructuresClassesMap.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
import { replaceWriterWithString } from "../base/utilities.js";
// #endregion preamble

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

  public toJSON(): ReplaceWriterInProperties<JSDocStructure>
  {
    const rv = super.toJSON() as ReplaceWriterInProperties<JSDocStructure>;
    if (this.description) {
      rv.description = replaceWriterWithString(this.description);
    }
    return rv;
  }
}

JSDocImpl satisfies CloneableStructure<JSDocStructure>;

StructuresClassesMap.set(StructureKind.JSDoc, JSDocImpl);
