import {
  Writable,
  type WritableOptions,
} from "node:stream";

export class StringWritable extends Writable {
  readonly #chunks: string[];
  constructor(chunks: string[], options?: WritableOptions) {
    super(options);
    this.#chunks = chunks;
  }
  _write(
    data: Buffer,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ): void
  {
    void encoding;
    this.#chunks.push(data.toString());
    callback(null);
  }
}
