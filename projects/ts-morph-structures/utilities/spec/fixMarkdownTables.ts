import {
  Readable
} from "node:stream";

import {
  pipeline,
} from "node:stream/promises";

import {
  noPartialTableCellTags,
  tableCellToggleIterable,
  replaceMarkdownInCellsWithHTML,
} from "../source/fixMarkdownTables.js";

import {
  StringWritable,
} from "./support/StringWritable.js";

describe("fixMarkdownTables: ", () => {
  const source = "<table><tr><td>Hello World</td></tr></table>";

  it("noPartialTableCellTags doesn't yield partial table cells tags", async () => {
    // Array.from forces us to read one character at a time.
    const inStream: Readable = Readable.from(Array.from(source));

    const chunks: string[] = [];
    const outStream = new StringWritable(chunks);

    await pipeline(
      inStream,
      noPartialTableCellTags,
      outStream
    );
    expect(chunks).withContext("one character at a time").toEqual([
      `<ta`,
      ...Array.from(`ble>`),
      `<tr`,
      `>`,
      `<td>`,
      ...Array.from(`Hello World`),
      `</td>`,
      `</tr`,
      `>`,
      `</ta`,
      ...Array.from(`ble>`),
    ]);
  });

  it("noPartialTableCellTags is greedy", async () => {
    // this is testing that we don't just stop at every potential table cell tag, only on tail breaks.
    const starting = ["<table><tr><td>Hello World</td></t", "r></table>"];
    const expected = ["<table><tr><td>Hello World</td>", "</tr></table>"];

    const inStream: Readable = Readable.from(starting);
    const chunks: string[] = [];
    const outStream = new StringWritable(chunks);

    await pipeline(inStream, noPartialTableCellTags, outStream);
    expect(chunks).toEqual(expected);
  });

  it("tableCellToggleIterable reports contents inside and outside a table cell", async () => {
    const inStream = Readable.from(source);
    const chunks: string[] = [];
    const outStream = new StringWritable(chunks);

    await pipeline(
      inStream,
      tableCellToggleIterable,
      async function * (source: AsyncIterable<[string, boolean]>): AsyncIterable<string> {
        for await (const nextItem of source) {
          yield JSON.stringify(nextItem);
        }
      },
      outStream
    );

    expect(chunks.map((v => JSON.parse(v)))).toEqual([
      ["<table><tr><td>", false],
      ["Hello World", true],
      ["</td></tr></table>", false]
    ]);
  });

  it("replaceMarkdownInCellsWithHTML works", async () => {
    const inStream = Readable.from(`
<td>[ctors](./ts-morph-structures.classdeclarationimpl.ctors.md)</td>
<td>\`readonly\`</td>
<td>[ConstructorDeclarationImpl](./ts-morph-structures.constructordeclarationimpl.md)\\[\\]</td>
<td><a href="test.html">This is a test</a></td>
    `.trim());
    const chunks: string[] = [];
    const outStream = new StringWritable(chunks);

    await pipeline(
      inStream,
      tableCellToggleIterable,
      replaceMarkdownInCellsWithHTML,
      outStream
    );

    expect(chunks).toEqual([
      `<td>`,
      `<a href="./ts-morph-structures.classdeclarationimpl.ctors.md">ctors</a>`,
      `</td>\n<td>`,
      `<code>readonly</code>`,
      `</td>\n<td>`,
      `<a href="./ts-morph-structures.constructordeclarationimpl.md">ConstructorDeclarationImpl</a>[]`,
      `</td>\n<td>`,
      `<a href="test.html">This is a test</a>`,
      `</td>`
    ]);
  });
});
