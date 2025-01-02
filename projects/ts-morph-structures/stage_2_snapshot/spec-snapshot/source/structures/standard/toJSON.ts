import {
  ClassDeclarationStructure,
  CodeBlockWriter,
  JSDocStructure,
  JSDocTagStructure,
  StructureKind,
} from "ts-morph";

import {
  ClassDeclarationImpl,
  JSDocImpl,
  JSDocTagImpl,
  LiteralTypeStructureImpl,
  WriterTypeStructureImpl,
} from "#stage_two/snapshot/source/exports.js";

it("toJSON() generally works", () => {
  const tag = new JSDocTagImpl("returns");
  tag.text = "The tag value";
  tag.leadingTrivia.push("// This is a test.")
  tag.leadingTrivia.push((writer: CodeBlockWriter): void => {
    writer.write("// this is only a test");
  });

  const doc = new JSDocImpl();
  doc.description = (writer: CodeBlockWriter): void => {
    writer.write("An internal value");
  }
  doc.tags.push(tag);

  const classDecl = new ClassDeclarationImpl;
  classDecl.docs.push(doc);
  classDecl.extendsStructure = LiteralTypeStructureImpl.get("Date");

  classDecl.implementsSet.add(LiteralTypeStructureImpl.get("NumberStringType"));
  classDecl.implementsSet.add(new WriterTypeStructureImpl((writer: CodeBlockWriter): void => {
    writer.write("Foo");
  }));
  classDecl.implementsSet.add(LiteralTypeStructureImpl.get("Bar"));

  const tagAsJSON = JSON.stringify(tag, null, 2);
  const tagReparsed = JSON.parse(tagAsJSON) as Required<JSDocTagStructure>;
  expect<JSDocTagStructure>(tagReparsed).toEqual({
    kind: StructureKind.JSDocTag,
    tagName: "returns",
    text: "The tag value",
    leadingTrivia: [
      "// This is a test.",
      "// this is only a test"
    ],
    trailingTrivia: [],
  });

  const docAsJSON = JSON.stringify(doc, null, 2);
  const docReparsed = JSON.parse(docAsJSON) as Required<JSDocStructure>;
  expect(docReparsed).toEqual({
    kind: StructureKind.JSDoc,
    description: "An internal value",
    tags: [tagReparsed],
    leadingTrivia: [],
    trailingTrivia: [],
  });

  const classAsJSON = JSON.stringify(classDecl, null, 2);
  expect(JSON.parse(classAsJSON) as ClassDeclarationStructure).toEqual({
    kind: StructureKind.Class,
    extends: "Date",
    implements: [
      "NumberStringType",
      "Foo",
      "Bar"
    ],
    typeParameters: [],
    docs: [docReparsed],
    isExported: false,
    isDefaultExport: false,
    decorators: [],
    hasDeclareKeyword: false,
    isAbstract: false,
    ctors: [],
    properties: [],
    getAccessors: [],
    setAccessors: [],
    methods: classDecl.methods,
    staticBlocks: [],
    leadingTrivia: [],
    trailingTrivia: [],
  });
});
