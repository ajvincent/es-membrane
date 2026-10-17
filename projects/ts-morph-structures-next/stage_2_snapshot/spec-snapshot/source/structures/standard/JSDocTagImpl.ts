import {
  type CodeBlockWriter,
  type JSDocTagStructure,
  type OptionalKind,
  StructureKind,
  type WriterFunction,
  printStructure,
} from "ts-morph";

import {
  JSDocTagImpl,
  LiteralTypeStructureImpl,
} from "#stage_two/snapshot/source/exports.js";

import {
  serializeWriter
} from "../../../support/serializeWriter.js";

describe("JSDocTagImpl", () => {
  it("sanity check: we can create one via constructor", () => {
    // warning: this really should have an argument for tagName
    const tag = new JSDocTagImpl("param");
    tag.text = "Hi Mom";

    expect(tag.kind).toBe(StructureKind.JSDocTag);
  });

  it("sanity check: we can create one via JSDocTagImpl.clone()", () => {
    const structure: OptionalKind<JSDocTagStructure> = {
      tagName: "param",
      text: "Hi Mom",

      leadingTrivia: [
        "// this is a lead"
      ],
      trailingTrivia: [
        "// this is a tail"
      ]
    };

    const tag = JSDocTagImpl.clone(structure);
    expect(tag.kind).withContext("tag.kind").toBe(StructureKind.JSDocTag);
    expect(tag.tagName).withContext("tag.tagName").toBe("param");

    expect(tag.leadingTrivia).withContext("leading trivia not identical").not.toBe(structure.leadingTrivia as readonly string[]);
    expect(tag.leadingTrivia).withContext("leading trivial equals").toEqual(structure.leadingTrivia as readonly string[]);
    expect(tag.trailingTrivia).withContext("trailing trivia not identical").not.toBe(structure.trailingTrivia as readonly string[]);
    expect(tag.trailingTrivia).withContext("trailing trivia equals").toEqual(structure.trailingTrivia as readonly string[]);

    // get text, getTypeAndDescription, set text
    expect(
      serializeWriter(tag.text as WriterFunction)
    ).withContext("constructed with text directly, get text").toBe("Hi Mom");
    expect(
      tag.getTypeAndDescription()
    ).withContext("constructed with text directly, getTypeAndDescription").toEqual([null, "Hi Mom"]);


    tag.text = `{boolean} Greetings`;
    expect(
      serializeWriter(tag.text as unknown as WriterFunction)
    ).withContext("set text with type, get text").toBe("{boolean} Greetings");
    expect(tag.getTypeAndDescription()).withContext("set text with type, getTypeAndDescription").toEqual([
      LiteralTypeStructureImpl.get("boolean"), "Greetings"
    ]);

    // test set text with writer function
    function WelcomeWriter(writer: CodeBlockWriter): void {
      writer.write("{boolean} ");
      writer.write("Welcome");
    };
    tag.text = WelcomeWriter;
    expect(serializeWriter(tag.text)).withContext("set text to writer function").toBe("{boolean} Welcome");
    expect(tag.getTypeAndDescription()).withContext("setTypeAndDescription null type, getTypeAndDescription").toEqual(undefined);

    // test setTypeAndDescription with null type
    tag.setTypeAndDescription(null, "Hello World");
    expect(serializeWriter(tag.text)).withContext("setTypeAndDescription null type, get text").toBe("Hello World");
    expect(tag.getTypeAndDescription()).withContext("setTypeAndDescription null type, getTypeAndDescription").toEqual([
      null, "Hello World"
    ]);

    // test setTypeAndDescription with non-null type
    tag.setTypeAndDescription(
      LiteralTypeStructureImpl.get("string"), "good day"
    );
    expect(serializeWriter(tag.text)).withContext("setTypeAndDescription string type, get text").toBe("{string} good day");
    expect(tag.getTypeAndDescription()).withContext("setTypeAndDescription string type, getTypeAndDescription").toEqual([
      LiteralTypeStructureImpl.get("string"), "good day"
    ]);
  });

  it("sanity check: a @see tag with a link inside is valid", () => {
    const tag = new JSDocTagImpl("see");
    tag.text = "{@link https://www.example.com}";
    expect(printStructure(tag)).toBe("@see {@link https://www.example.com}");
  });
});
