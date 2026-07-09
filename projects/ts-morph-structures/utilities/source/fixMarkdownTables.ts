import {
  pipeline
} from "node:stream/promises";

import type {
  Readable,
  Writable,
} from "node:stream";

import markdownit from 'markdown-it';

export async function fixMarkdownTables(
  readableStream: Readable,
  writableStream: Writable
): Promise<void>
{
  await pipeline(
    readableStream,
    noPartialTableCellTags,
    tableCellToggleIterable,
    replaceMarkdownInCellsWithHTML,
    aggregateAndRenderHTML,
    writableStream
  );
}

// Make sure we don't yield partial td tags.
export async function * noPartialTableCellTags(source: AsyncIterable<string | Buffer>): AsyncIterable<string> {
  let buffer: string = "";
  for await (const chunk of source) {
    buffer += chunk.toString();
    const sizeToConsume = buffer.length - tdTagTail(buffer);
    const nextChunk = buffer.substring(0, sizeToConsume);
    buffer = buffer.substring(sizeToConsume);
    if (nextChunk.length > 0)
      yield nextChunk;
  }

  if (buffer.length > 0)
    yield buffer;
}

// yield segments inside td tags as [content, true], and everything else (including the td tags) as [content, false].
export async function * tableCellToggleIterable(source: AsyncIterable<string>): AsyncIterable<[string, boolean]> {
  let buffer: string = "";
  let inTDTag: boolean = false;

  for await (const chunk of source) {
    buffer += chunk;

    while (buffer.length) {
      if (inTDTag === false) {
        const index: number = buffer.indexOf("<td>");
        if (index === -1) {
          break; // this should force us to add the next chunk
        }
        const nextChunk = buffer.substring(0, index + 4);
        buffer = buffer.substring(index + 4);
        if (nextChunk.length > 0)
          yield [nextChunk, false];
        inTDTag = true;
      }
      else {
        const index: number = buffer.indexOf("</td>");
        if (index === -1)
          break; // this should force us to add the next chunk

        const nextChunk = buffer.substring(0, index);
        buffer = buffer.substring(index);
        if (nextChunk.length > 0)
          yield [nextChunk, true];
        inTDTag = false;
      }
    }
  }

  // inTDTag should be false
  if (buffer.length > 0)
    yield [buffer, inTDTag];
}

export async function * replaceMarkdownInCellsWithHTML(
  source: AsyncIterable<[string, boolean]>
): AsyncIterable<string>
{
  for await (const [chunk, inTDTag] of source) {
    if (inTDTag)
      yield markdownFixer.render(chunk).trim().replace(/^<p>(.*)<\/p>$/, "$1");
    else
      yield chunk;
  }
}

async function * aggregateAndRenderHTML(
  source: AsyncIterable<string>
): AsyncIterable<string>
{
  const contents = (await Array.fromAsync(source)).join("").replaceAll(".md", ".html");
  yield markdownFixer.render(contents);
}

const markdownFixer = new markdownit({
  html: true,
  typographer: true
});

function tdTagTail(buffer: string): number {
  if (buffer.endsWith("<"))
    return 1;
  if (buffer.endsWith("<t") || buffer.endsWith("</"))
    return 2;
  if (buffer.endsWith("<td") || buffer.endsWith("</t"))
    return 3;
  if (buffer.endsWith("</td"))
    return 4;
  return 0;
}
