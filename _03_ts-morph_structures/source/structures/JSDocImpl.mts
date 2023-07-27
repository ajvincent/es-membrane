import {
  JSDocStructure,
  JSDocTagStructure,
  JSDocableNodeStructure,
  OptionalKind,
  StructureKind,
} from "ts-morph";

import { stringOrWriterFunction } from "../types/ts-morph-native.mjs";
import { CloneableStructure } from "../types/CloneableStructure.mjs";
import { stringOrWriterFunctionArray } from "./utilities.mjs";
import JSDocTagImpl from "./JSDocTagImpl.mjs";

export default class JSDocImpl
implements JSDocStructure
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  description: stringOrWriterFunction | undefined = undefined;
  tags: JSDocTagStructure[] = [];
  readonly kind: StructureKind.JSDoc = StructureKind.JSDoc;

  public static clone(
    other: OptionalKind<JSDocStructure>
  ): JSDocImpl
  {
    const doc = new JSDocImpl;
    doc.leadingTrivia = stringOrWriterFunctionArray(other.leadingTrivia);
    doc.trailingTrivia = stringOrWriterFunctionArray(other.trailingTrivia);
    doc.description = other.description;
    if (other.tags) {
      doc.tags = other.tags.map(tag => JSDocTagImpl.clone(tag));
    }

    return doc;
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
