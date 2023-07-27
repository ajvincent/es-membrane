import {
  OptionalKind,
  PropertySignatureStructure,
  StructureKind,
} from "ts-morph";

import {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
import { stringOrWriterFunctionArray } from "./utilities.mjs";
import TypeWriterManager from "./TypeWriterManager.mjs";
import JSDocImpl from "./JSDocImpl.mjs";

export default class PropertySignatureImpl
extends TypeWriterManager
implements PropertySignatureStructure
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  readonly kind: StructureKind.PropertySignature = StructureKind.PropertySignature
  name: string;
  hasQuestionToken = false;
  docs: (string | JSDocImpl)[] = [];
  isReadonly = false;
  initializer: stringOrWriterFunction | undefined;

  constructor(name: string)
  {
    super();
    this.name = name;
  }

  public static clone(
    other: OptionalKind<PropertySignatureStructure>
  ): PropertySignatureImpl
  {
    const signature = new PropertySignatureImpl(other.name);

    signature.leadingTrivia = stringOrWriterFunctionArray(other.leadingTrivia);
    signature.trailingTrivia = stringOrWriterFunctionArray(other.trailingTrivia);

    signature.hasQuestionToken = other.hasQuestionToken ?? false;
    signature.docs = JSDocImpl.cloneArray(other);
    signature.isReadonly = other.isReadonly ?? false;
    signature.initializer = other.initializer;

    return signature;
  }
}
PropertySignatureImpl satisfies CloneableStructure<PropertySignatureStructure>;

