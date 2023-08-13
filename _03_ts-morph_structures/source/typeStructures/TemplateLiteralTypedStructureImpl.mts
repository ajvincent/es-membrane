import type {
  CodeBlockWriter,
} from "ts-morph";

import {
  TemplateLiteralTypedStructure,
  TypeStructure,
  TypeStructureClassesMap,
  TypeStructureKind,
} from "../../exports.mjs";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";

import {
  pairedWrite
} from "../base/utilities.mjs";

export default class TemplateLiteralTypedStructureImpl
implements TemplateLiteralTypedStructure
{
  readonly kind: TypeStructureKind.TemplateLiteral = TypeStructureKind.TemplateLiteral;
  elements: (string | TypeStructure)[];

  constructor(
    elements: (string | TypeStructure)[] = []
  )
  {
    this.elements = elements.slice();
    registerCallbackForTypeStructure(this);
  }

  writerFunction(
    writer: CodeBlockWriter
  ): void
  {
    pairedWrite(writer, "`", "`", false, false, () => {
      this.elements.forEach(element => {
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

  static clone(
    other: TemplateLiteralTypedStructure
  ): TemplateLiteralTypedStructureImpl
  {
    return new TemplateLiteralTypedStructureImpl(other.elements);
  }
}

TemplateLiteralTypedStructureImpl satisfies CloneableStructure<TemplateLiteralTypedStructure>;
TypeStructureClassesMap.set(TypeStructureKind.TemplateLiteral, TemplateLiteralTypedStructureImpl);
