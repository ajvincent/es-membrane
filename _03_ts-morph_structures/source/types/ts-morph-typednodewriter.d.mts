import type {
  WriterFunction
} from "ts-morph";

export interface TypedNodeWriter {
  readonly writerFunction: WriterFunction
}
