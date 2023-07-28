import {
  StructureKind,
  EnumMemberStructure,
} from "ts-morph";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  stringOrWriterFunctionArray
} from "./utilities.mjs";

import { CloneableStructure } from "../types/CloneableStructure.mjs";

import JSDocImpl from "./JSDocImpl.mjs";

export default class EnumMemberImpl implements EnumMemberStructure
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  value: string | number | undefined = undefined;
  readonly kind: StructureKind.EnumMember = StructureKind.EnumMember;
  name: string;
  docs: (string | JSDocImpl)[] = [];
  initializer: stringOrWriterFunction | undefined;

  constructor(name: string) {
    this.name = name;
  }

  public static clone(
    other: EnumMemberStructure
  ): EnumMemberImpl
  {
    const clone = new EnumMemberImpl(other.name);

    clone.leadingTrivia = stringOrWriterFunctionArray(other.leadingTrivia);
    clone.trailingTrivia = stringOrWriterFunctionArray(other.trailingTrivia);
    clone.value = other.value;
    clone.docs = JSDocImpl.cloneArray(other);
    clone.initializer = other.initializer;

    return clone;
  }
}
EnumMemberImpl satisfies CloneableStructure<EnumMemberStructure>;
