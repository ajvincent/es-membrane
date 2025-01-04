import type { WriterFunction } from "ts-morph";

import type { Writable } from "type-fest";

type OmitWriter<T> = T extends (infer A)[]
  ? OmitWriter<A>[]
  : Exclude<T, WriterFunction>;

type OmitWriterFromFields<T extends object> = {
  [key in keyof T]: OmitWriter<T[key]>;
};

export type StructureClassToJSON<T extends object> = Writable<
  Omit<
    OmitWriterFromFields<T>,
    "toJSON" | `${string}Structure` | `${string}Set`
  >
>;
