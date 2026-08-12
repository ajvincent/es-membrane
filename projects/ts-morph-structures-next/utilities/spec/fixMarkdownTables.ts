import {
  Readable
} from "node:stream";

import {
  pipeline,
} from "node:stream/promises";

import {
  noPartialTableTags,
  HTMLTableTokenizer,
  tagToMarkdownReplacer,
  fixMarkdownTables,
} from "../source/fixMarkdownTables.js";

import {
  StringWritable,
} from "./support/StringWritable.js";

describe("fixMarkdownTables:", () => {
  const source = "<table><tr><td>Hello World</td></tr></table>";

  it("noPartialTableTags doesn't yield partial table cells tags", async () => {
    // Array.from forces us to read one character at a time.
    const inStream: Readable = Readable.from(Array.from(source));

    const chunks: string[] = [];
    const outStream = new StringWritable(chunks);

    await pipeline(
      inStream,
      noPartialTableTags,
      outStream
    );
    expect(chunks).withContext("one character at a time").toEqual([
      `<table>`,
      `<tr>`,
      `<td>`,
      ...Array.from(`Hello World`),
      `</td>`,
      `</tr>`,
      `</table>`,
    ]);
  });

  it("noPartialTableTags is greedy", async () => {
    // this is testing that we don't just stop at every potential table cell tag, only on tail breaks.
    const starting = ["<table><tr><td>Hello World</td></t", "r></table>"];
    const expected = ["<table><tr><td>Hello World</td>", "</tr></table>"];

    const inStream: Readable = Readable.from(starting);
    const chunks: string[] = [];
    const outStream = new StringWritable(chunks);

    await pipeline(inStream, noPartialTableTags, outStream);
    expect(chunks).toEqual(expected);
  });

  it("HTMLTableTokenizer reports contents before each table tag and the table tag", async () => {
    const inStream = Readable.from(source);
    const chunks: string[] = [];
    const outStream = new StringWritable(chunks);

    await pipeline(
      inStream,
      HTMLTableTokenizer,
      async function * (source: AsyncIterable<[string, boolean]>): AsyncIterable<string> {
        for await (const nextItem of source) {
          yield JSON.stringify(nextItem);
        }
      },
      outStream
    );

    expect(chunks.map((v => JSON.parse(v)))).toEqual([
      ["", "<table>"],
      ["", "<tr>"],
      ["", "<td>"],
      ["Hello World", "</td>"],
      ["", "</tr>"],
      ["", "</table>"],
    ]);
  });

  const CLASS_MARKUP = `
## Properties

<table><thead><tr><th>

Property


</th><th>

Modifiers


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

[ctors](./ts-morph-structures.classdeclarationimpl.ctors.md)


</td><td>

\`readonly\`


</td><td>

[ConstructorDeclarationImpl](./ts-morph-structures.constructordeclarationimpl.md)<!-- -->[]


</td><td>


</td></tr>
<tr><td>

[decorators](./ts-morph-structures.classdeclarationimpl.decorators.md)


</td><td>

\`readonly\`


</td><td>

[DecoratorImpl](./ts-morph-structures.decoratorimpl.md)<!-- -->[]


</td><td>


</td></tr>
</tbody></table>

## Methods
  `.trim();

  it("tagToMarkdownReplacer generates good Markdown chunks", async () => {
    const inStream = Readable.from(CLASS_MARKUP);

    const chunks: string[] = [];
    const outStream = new StringWritable(chunks);

    await pipeline(
      inStream,
      noPartialTableTags,
      HTMLTableTokenizer,
      tagToMarkdownReplacer,
      outStream
    );

    expect(chunks).toEqual([
      `## Properties\n\n`, // no leading newline because of the trim
      // <thead> establishes the row divider
      `|`, // <tr>
      ` Property |`, // </th>, newlines replaced by spaces
      ` Modifiers |`, // </th>
      ` Type |`, // </th>
      ` Description |`, // </th>
      `\n`, // </tr>
      `|-|-|-|-|\n`, // </thead>
      `|`, // <tr>

      // text segment with newlines replaced by spaces, then a trailing space and pipe
      ` [ctors](./ts-morph-structures.classdeclarationimpl.ctors.md) |`, // </td>
      ` \`readonly\` |`, // </td>
      ` [ConstructorDeclarationImpl](./ts-morph-structures.constructordeclarationimpl.md)[] |`,
      ` |`, // </td>,
      `\n`, // </tr>

      `|`, // <tr>
      ` [decorators](./ts-morph-structures.classdeclarationimpl.decorators.md) |`, // </td>
      ` \`readonly\` |`, // </td>
      ` [DecoratorImpl](./ts-morph-structures.decoratorimpl.md)[] |`,
      ` |`, // </td>,
      `\n`, // </tr>

      `\n`, // </table>
      `\n\n## Methods`, // no trailing newline because of the trim
    ]);
  });

  it("fixMarkdownTables concatenates everything into one readable Markdown", async () => {
    const inStream = Readable.from(CLASS_MARKUP);

    const chunks: string[] = [];
    const outStream = new StringWritable(chunks);

    await fixMarkdownTables(inStream, outStream);

    expect(chunks).toEqual([
      `## Properties\n\n`, // no leading newline because of the trim
      // <thead> establishes the row divider
      `|`, // <tr>
      ` Property |`, // </th>, newlines replaced by spaces
      ` Modifiers |`, // </th>
      ` Type |`, // </th>
      ` Description |`, // </th>
      `\n`, // </tr>
      `|-|-|-|-|\n`, // </thead>
      `|`, // <tr>

      // text segment with newlines replaced by spaces, then a trailing space and pipe
      ` [ctors](./ts-morph-structures.classdeclarationimpl.ctors.md) |`, // </td>
      ` \`readonly\` |`, // </td>
      ` [ConstructorDeclarationImpl](./ts-morph-structures.constructordeclarationimpl.md)[] |`,
      ` |`, // </td>,
      `\n`, // </tr>

      `|`, // <tr>
      ` [decorators](./ts-morph-structures.classdeclarationimpl.decorators.md) |`, // </td>
      ` \`readonly\` |`, // </td>
      ` [DecoratorImpl](./ts-morph-structures.decoratorimpl.md)[] |`,
      ` |`, // </td>,
      `\n`, // </tr>

      `\n`, // </table>
      `\n\n## Methods`, // no trailing newline because of the trim
    ]);
  });
});
