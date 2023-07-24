import type {
  WriterFunction
} from "ts-morph";

import type {
  TypeStructure
} from "./TypeStructure.mjs";

const callbackToTypeStructureImpl = new WeakMap<WriterFunction, TypeStructure>;

export function registerCallbackForTypeStructure(
  structure: TypeStructure
): void
{
  callbackToTypeStructureImpl.set(structure.writerFunction, structure);
}

export function getTypeStructureForCallback(
  callback: WriterFunction
): TypeStructure | undefined
{
  return callbackToTypeStructureImpl.get(callback);
}