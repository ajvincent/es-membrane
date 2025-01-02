import {
  JSDocImpl,
  JSDocTagImpl,
} from "#stage_two/snapshot/source/exports.js";
import {
  type JSDocStructure,
  type OptionalKind,
  StructureKind
} from "ts-morph";

describe("JSDocImpl", () => {
  const tag = new JSDocTagImpl("param");
  tag.text = "Hi Mom";

  it("sanity check: we can create one via constructor", () => {
    const doc = new JSDocImpl;
    doc.description = "Hello World";
    doc.tags.push(tag);

    expect(doc.kind).toBe(StructureKind.JSDoc);
  });

  it("sanity check: we can create one via JSDocImpl.clone()", () => {
    const docStructure: OptionalKind<JSDocStructure> = {
      description: "Hello World",
      tags: [tag],
    }

    const doc = JSDocImpl.clone(docStructure);
    expect(doc.description).toBe("Hello World");
    expect(doc.tags.length).toBe(1);
    expect(doc.tags[0]).not.toBe(tag);
    expect(doc.tags[0].tagName).toBe(tag.tagName);
    expect(doc.tags[0].text).toBe(tag.text);
  });
});
