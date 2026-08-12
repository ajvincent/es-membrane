import {
  pipeline
} from "node:stream/promises";

import type {
  Readable,
  Writable,
} from "node:stream";

export async function fixMarkdownTables(
  readableStream: Readable,
  writableStream: Writable
): Promise<void>
{
  await pipeline(
    readableStream,
    noPartialTableTags,
    HTMLTableTokenizer,
    tagToMarkdownReplacer,
    writableStream
  );
}

export async function * noPartialTableTags(
  source: AsyncIterable<string | Buffer>
): AsyncIterable<string>
{
  let buffer: string = "";
  for await (const chunk of source) {
    buffer += chunk.toString();

    const sizeToConsume = buffer.length - tdTagTail(buffer);
    if (sizeToConsume === 0)
      continue;

    const nextChunk = buffer.substring(0, sizeToConsume);
    buffer = buffer.substring(sizeToConsume);
    yield nextChunk;
  }

  if (buffer.length > 0)
    yield buffer;
}

const TABLE_TAG_RE = /<\/?(?:table|thead|tbody|tfoot|tr|th|td)>/;

export async function * HTMLTableTokenizer(
  source: AsyncIterable<string>
): AsyncIterable<[string, string]>
{
  let buffer: string = "";

  for await (const chunk of source) {
    buffer += chunk;
    while (buffer.length) {
      const nextTokenMatch: RegExpMatchArray | null = buffer.match(TABLE_TAG_RE);
      if (nextTokenMatch === null)
        break;
      const token = nextTokenMatch[0];
      const sizeToConsume = nextTokenMatch.index! + token.length;
      const contents = buffer.substring(0, nextTokenMatch.index!);
      buffer = buffer.substring(sizeToConsume);
      yield [contents, token];
    }
  }

  if (buffer.length > 0)
    yield [buffer, ""];
}

export async function * tagToMarkdownReplacer(
  source: AsyncIterable<[string, string]>
): AsyncIterable<string>
{
  const replacer = new HTMLToMarkdownReplacer();

  const results: string[] = [];
  for await (const contentsAndToken of source) {
    let contents: string = contentsAndToken[0];
    const token: string = contentsAndToken[1];

    if (contents.length > 0) {
      contents = contents.replaceAll("<!-- -->", "");
    }
    if (contents.length > 0 && contents[0] === "\n" && replacer.ignoreNextCharIfNewLine) {
      contents = contents.substring(1);
    }
    if (contents.length > 0 && replacer.isInTable) {
      contents = contents.replaceAll(/[\r\n]+/gm, " ");
    }
    if (contents.length > 0 && replacer.trimContent) {
      contents = contents.trim();
    }
    contents += replacer.processToken(token);
    if (contents.length > 0)
      results.push(contents);
  }
  yield * results;
}

class HTMLToMarkdownReplacer {
  #rowDivider: string = "";
  isInTable: boolean = false;
  isInTBody: boolean = false;
  ignoreNextCharIfNewLine: boolean = false;
  trimContent: boolean = false;

  processToken(
    token: string
  ): string
  {
    this.ignoreNextCharIfNewLine = false;
    this.trimContent = false;
    switch (token) {
      case "<table>":
        this.isInTable = true;
        return "";
      case "<thead>":
        this.#rowDivider = "|";
        return "";
      case "<tr>":
        return "|";
      case "<th>":
        return "";
      case "</th>":
        this.#rowDivider += "-|";
        return "|";
      case "<td>":
        return "";
      case "</td>":
        return "|";
      case "</tr>":
        this.ignoreNextCharIfNewLine = true;
        return "\n";
      case "</thead>": {
        this.ignoreNextCharIfNewLine = true;
        const divider = this.#rowDivider;
        this.#rowDivider = "";
        return divider + "\n";
      }
      case "<tbody>":
        this.isInTBody = true;
        return "";
      case "</tbody>":
        this.ignoreNextCharIfNewLine = true;
        return "";
      case "</table>":
        this.isInTable = false;
        this.isInTBody = false;
        this.ignoreNextCharIfNewLine = false;
        this.trimContent = false;
        return "\n";
      default:
        return "";
    }
  }
}

const tableTags: ReadonlySet<string> = new Set([
  "<table>", "</table>",
  "<thead>", "</thead>",
  "<tbody>", "</tbody>",
  "<tr>", "</tr>",
  "<th>", "</th>",
  "<td>", "</td>"
]);

const partialTags: Set<string> = new Set();
for (let key of tableTags) {
  key = key.substring(0, key.length - 1);
  partialTags.add(key);
}
for (let key of partialTags) {
  key = key.substring(0, key.length - 1);
  if (key !== "")
    partialTags.add(key);
}

function tdTagTail(buffer: string): number {
  for (const key of partialTags) {
    if (buffer.endsWith(key))
      return key.length;
  }
  return 0;
}
