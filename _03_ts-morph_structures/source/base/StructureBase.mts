import { stringOrWriterFunction } from "#ts-morph_structures/source/types/ts-morph-native.mjs";
import { Structure } from "ts-morph";
import { stringOrWriterFunctionArray } from "./utilities.mjs";

export default class StructureBase {
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];

  public static cloneTrivia(
    source: Structure,
    target: StructureBase
  ): void
  {
    target.leadingTrivia = stringOrWriterFunctionArray(source.leadingTrivia);
    target.trailingTrivia = stringOrWriterFunctionArray(source.trailingTrivia);
  }
}
