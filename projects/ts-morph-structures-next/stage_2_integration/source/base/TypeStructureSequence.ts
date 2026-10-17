import {
  BUILD_ARRAY_WRAPPER,
  CONVERT_OUTER_TO_INNER,
  ShadowArrayImpl,
} from "../array-utilities/ShadowArrayImpl.js";

import parseLiteralType from "../bootstrap/parseLiteralType.js";

import {
  TypeStructures
} from "../structures/type/TypeStructures.js";

import type {
  stringOrWriterFunction
} from "../types/stringOrWriterFunction.js";

import {
  WriterStructuresBase
} from "../structures/WriterStructuresBase.js";

import {
  WriterTypeStructureImpl
} from "../structures/type/WriterTypeStructureImpl.js";

export class TypeStructureSequence extends ShadowArrayImpl<stringOrWriterFunction, TypeStructures>
{
  public static createProxy(
    innerElements: TypeStructures[]
  ): stringOrWriterFunction[]
  {
    return new TypeStructureSequence(innerElements).proxy;
  }

  protected [BUILD_ARRAY_WRAPPER](
    ...innerElements: TypeStructures[]
  ): stringOrWriterFunction[]
  {
    return TypeStructureSequence.createProxy(innerElements);
  }

  protected [CONVERT_OUTER_TO_INNER](
    outerType: stringOrWriterFunction
  ): TypeStructures
  {
    // FIXME: writer functions often come from known type structures.
    if (typeof outerType === "function") {
      const structure = WriterStructuresBase.getWriterStructureForCallback(outerType);
      if (structure)
        return structure as unknown as TypeStructures;
      return new WriterTypeStructureImpl(outerType);
    }

    return parseLiteralType(outerType);
  }
}