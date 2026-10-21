import type {
  CodeBlockWriter,
} from "ts-morph";

import {
  ClassDeclarationImpl,
  ArrayTypeStructureImpl,
  LiteralTypeStructureImpl,
  WriterTypeStructureImpl,
  type stringOrWriterFunction,
} from "#stage_two/snapshot/source/exports.js";

import {
  serializeWriter
} from "../../../support/serializeWriter.js";

describe("Type structure sequence properties work", () => {
  let writerCount = 0;
  function writerFunction(
    writer: CodeBlockWriter
  ): void
  {
    writerCount++;
    writer.write("Record<string, boolean>");
  }

  const writerTypeStructure = new WriterTypeStructureImpl(writerFunction);
  const arrayTypeStructure = new ArrayTypeStructureImpl(LiteralTypeStructureImpl.get("boolean"));

  let classDecl: ClassDeclarationImpl;
  beforeEach(() => {
    writerCount = 0;
  });

  it("adding types directly", () => {
    classDecl = new ClassDeclarationImpl;
    classDecl.implementsSequence.push(writerTypeStructure, arrayTypeStructure);
    classDecl.implements.push("never");

    expect(Array.from(classDecl.implementsSequence)).toEqual([
      writerTypeStructure,
      arrayTypeStructure,
      LiteralTypeStructureImpl.get("never")
    ]);

    expect(writerCount).toBe(0);
  });

  describe("with static clone() taking a", () => {
    it("structure and an implements array", () => {
      classDecl = ClassDeclarationImpl.clone({
        implements: [
          "NumberStringType",
          "NumberStringInterface",
          writerFunction,
          arrayTypeStructure.writerFunction
        ]
      });

      expect(classDecl.implements[0]).toBe("NumberStringType");
      expect(classDecl.implements[1]).toBe("NumberStringInterface");
      expect(typeof classDecl.implements[2]).toBe("function");
      if (typeof classDecl.implements[2] === "function") {
        expect(serializeWriter(classDecl.implements[2])).toBe("Record<string, boolean>");
      }
      expect(typeof classDecl.implements[3]).toBe("function");
      if (typeof classDecl.implements[3] === "function") {
        expect(serializeWriter(classDecl.implements[3])).toBe("boolean[]");
      }
      expect(classDecl.implements.length).toBe(4);

      const definedSet = Array.from(classDecl.implementsSequence);
      expect(definedSet[0]).toBe(LiteralTypeStructureImpl.get("NumberStringType"));
      expect(definedSet[1]).toBe(LiteralTypeStructureImpl.get("NumberStringInterface"));
      expect(definedSet[2]).toBeInstanceOf(WriterTypeStructureImpl);
      if (definedSet[2] instanceof WriterTypeStructureImpl) {
        expect(serializeWriter(definedSet[2].writerFunction)).toBe("Record<string, boolean>");
      }
      expect(definedSet[3]).toBeInstanceOf(ArrayTypeStructureImpl);
      if (definedSet[3] instanceof ArrayTypeStructureImpl) {
        expect(definedSet[3].objectType).toBe(LiteralTypeStructureImpl.get("boolean"));
      }
      expect(definedSet.length).toBe(4);

      expect(writerCount).toBe(2);
    });

    it("structure and an implements function", () => {
      classDecl = ClassDeclarationImpl.clone({
        implements: arrayTypeStructure.writerFunction
      });
  
      expect(Array.from(classDecl.implements)).toEqual([
        arrayTypeStructure.writerFunction
      ]);
  
      expect(Array.from(classDecl.implementsSequence)).toEqual([
        arrayTypeStructure
      ]);
  
      expect(writerCount).toBe(0);
    });

    it("current structure implementation", () => {
      classDecl = new ClassDeclarationImpl;
      classDecl.implementsSequence.push(
        LiteralTypeStructureImpl.get("NumberStringType"),
        LiteralTypeStructureImpl.get("NumberStringInterface"),
        writerTypeStructure,
        arrayTypeStructure
      );

      classDecl = ClassDeclarationImpl.clone(classDecl);

      const classImplements: stringOrWriterFunction[] = classDecl.implements.slice();
      const arrayWriter: stringOrWriterFunction | undefined = classImplements.pop();

      expect(classImplements[0]).toBe("NumberStringType");
      expect(classImplements[1]).toBe("NumberStringInterface");
      expect(classImplements.length).toBe(3);

      if (typeof classImplements[2] === "function") {
        expect(serializeWriter(classImplements[2])).toBe("Record<string, boolean>");
      }

      expect(writerCount).toBe(1);

      expect(typeof arrayWriter).toBe("function");
      if (typeof arrayWriter === "function")
        expect(serializeWriter(arrayWriter)).toBe("boolean[]");
    });
  });

  it("with .toJSON()", () => {
    classDecl = new ClassDeclarationImpl;
    classDecl.implementsSequence.push(writerTypeStructure, arrayTypeStructure);

    expect(classDecl.toJSON().implements).toEqual([
      "Record<string, boolean>",
      "boolean[]"
    ]);

    expect(writerCount).toBe(1);
  });
});
