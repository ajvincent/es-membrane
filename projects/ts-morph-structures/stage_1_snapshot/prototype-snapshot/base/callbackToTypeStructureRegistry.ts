import type {
  WriterFunction
} from "ts-morph";

import type {
  TypeStructures
} from "../typeStructures/TypeStructures.js";

const callbackToTypeStructureImpl = new WeakMap<WriterFunction, TypeStructures>;

export function registerCallbackForTypeStructure(
  structure: TypeStructures
): void
{
  callbackToTypeStructureImpl.set(structure.writerFunction, structure);
}

export function getTypeStructureForCallback(
  callback: WriterFunction
): TypeStructures | undefined
{
  return callbackToTypeStructureImpl.get(callback);
}

export function deregisterCallbackForTypeStructure(
  structure: TypeStructures
): void {
  callbackToTypeStructureImpl.delete(structure.writerFunction);
}
