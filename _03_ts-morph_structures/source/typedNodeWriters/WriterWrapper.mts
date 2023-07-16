import type {
  TypedNodeWriter
} from "../types/ts-morph-typednodewriter.mjs";
import { WriterFunction } from "ts-morph";

export default class WriterWrapper implements TypedNodeWriter
{
  writerFunction: WriterFunction;
  constructor(writer: WriterFunction) {
    this.writerFunction = writer;
  }
}
