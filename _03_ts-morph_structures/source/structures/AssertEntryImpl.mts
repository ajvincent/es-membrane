import {
  AssertEntryStructure,
  OptionalKind,
  StructureKind,
} from "ts-morph";
import { CloneableStructure } from "../types/CloneableStructure.mjs";
import { stringOrWriterFunction } from "../types/ts-morph-native.mjs";
import {
  stringOrWriterFunctionArray
} from "./utilities.mjs";

export default class AssertEntryImpl implements AssertEntryStructure
{
  readonly kind: StructureKind.AssertEntry = StructureKind.AssertEntry;
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  name: string;
  value: string;

  constructor(
    name: string,
    value: string
  )
  {
    this.name = name;
    this.value = value;
  }

  public static clone(
    other: OptionalKind<AssertEntryStructure>
  ): AssertEntryImpl
  {
    const clone = new AssertEntryImpl(other.name, other.value);
    clone.leadingTrivia = stringOrWriterFunctionArray(other.leadingTrivia);
    clone.trailingTrivia = stringOrWriterFunctionArray(other.trailingTrivia);
    return clone;
  }
}
AssertEntryImpl satisfies CloneableStructure<AssertEntryStructure>;
