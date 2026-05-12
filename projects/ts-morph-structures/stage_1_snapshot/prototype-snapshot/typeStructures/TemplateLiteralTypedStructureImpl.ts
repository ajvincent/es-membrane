// #region preamble
import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import {
  type TemplateLiteralTypedStructure,
  type TypeStructures,
  TypeStructureClassesMap,
  TypeStructureKind,
  TypePrinterSettingsBase,
} from "../exports.js";

import TypeStructuresBase from "../base/TypeStructuresBase.js";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.js";

import replaceDescendantTypeStructures from "../base/replaceDescendantTypeStructures.js";

import {
  pairedWrite,
} from "../base/utilities.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";

import {
  STRUCTURE_AND_TYPES_CHILDREN
} from "../base/symbolKeys.js";

import type {
  StructureImpls
} from "../types/StructureImplUnions.js";
// #endregion

/** `one${"A" | "B"}two${"C" | "D"}three` */
export default class TemplateLiteralTypedStructureImpl
extends TypeStructuresBase
implements TemplateLiteralTypedStructure
{
  readonly kind: TypeStructureKind.TemplateLiteral = TypeStructureKind.TemplateLiteral;
  childTypes: (string | TypeStructures)[];

  readonly printSettings = new TypePrinterSettingsBase;

  constructor(
    childTypes: (string | TypeStructures)[] = []
  )
  {
    super();
    this.childTypes = childTypes;
    registerCallbackForTypeStructure(this);
  }

  public replaceDescendantTypes(
    filter: (typeStructure: TypeStructures) => boolean,
    replacement: TypeStructures
  ): void
  {
    for (let i = 0; i < this.childTypes.length; i++) {
      if (typeof this.childTypes[i] === "string")
        continue;
      replaceDescendantTypeStructures(this.childTypes as TypeStructures[], i, filter, replacement);
    }
  }

  #writerFunction(
    writer: CodeBlockWriter
  ): void
  {
    pairedWrite(writer, "`", "`", false, false, () => {
      this.childTypes.forEach(element => {
        if (typeof element === "string")
          writer.write(element);
        else {
          pairedWrite(
            writer, "${", "}", false, false, () => element.writerFunction(writer)
          );
        }
      });
    });
  }

  writerFunction: WriterFunction = this.#writerFunction.bind(this);

  static clone(
    other: TemplateLiteralTypedStructure
  ): TemplateLiteralTypedStructureImpl
  {
    const childTypes: (string | TypeStructures)[] = other.childTypes.map(child => {
      if (typeof child === "string")
        return child;
      return TypeStructureClassesMap.clone(child);
    });
    return new TemplateLiteralTypedStructureImpl(childTypes);
  }

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>
  {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();
    for (const type of this.childTypes) {
      if (typeof type === "object")
        yield type;
    }
  }
}

TemplateLiteralTypedStructureImpl satisfies CloneableStructure<TemplateLiteralTypedStructure>;
TypeStructureClassesMap.set(TypeStructureKind.TemplateLiteral, TemplateLiteralTypedStructureImpl);
