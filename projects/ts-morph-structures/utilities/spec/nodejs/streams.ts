import fs from "node:fs";
import path from "node:path";
import {
  pipeline
} from "node:stream/promises";

import {
  Readable,
} from "node:stream";

import {
  stageDir
} from "../../source/constants.js";

import {
  StringWritable
} from "../support/StringWritable.js";

const classdeclarationimpl_md = path.join(stageDir, "fixtures/ts-morph-structures.classdeclarationimpl.md");

it("fs.ReadStream produces string chunks", async () => {
  const chunks: string[] = [];

  const outStream = new StringWritable(chunks);
  const inStream: Readable = fs.createReadStream(
    classdeclarationimpl_md,
    { encoding: "utf-8" }
  );

  await pipeline(
    inStream,
    typeofChunk,
    outStream
  );

  expect(chunks.length).toBeGreaterThan(0);
  expect(chunks.every(c => c === "string")).toBeTrue();
});

async function * typeofChunk(source: AsyncIterable<unknown>): AsyncIterable<string> {
  for await (const chunk of source) {
    yield typeof chunk;
  }
}
