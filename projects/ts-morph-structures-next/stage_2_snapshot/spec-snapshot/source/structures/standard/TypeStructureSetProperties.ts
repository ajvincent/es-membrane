import {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import {
  ClassDeclarationImpl,
  ArrayTypeStructureImpl,
  LiteralTypeStructureImpl,
  WriterTypeStructureImpl,
  type stringOrWriterFunction,
} from "#stage_two/snapshot/source/exports.js";

describe("Type structure set properties work", () => {
  let writerCount = 0;
  function writerFunction(
    writer: CodeBlockWriter
  ): void {
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
    classDecl.implementsSet.add(writerTypeStructure);
    classDecl.implementsSet.add(arrayTypeStructure);

    expect(
      () => classDecl.implements.push("never")
    ).toThrow();

    expect(Array.from(classDecl.implementsSet.values())).toEqual([
      writerTypeStructure,
      arrayTypeStructure
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
        const actualWriter = new CodeBlockWriter();
        classDecl.implements[2](actualWriter);
        expect(actualWriter.toString()).toBe("Record<string, boolean>");
      }
      expect(typeof classDecl.implements[3]).toBe("function");
      if (typeof classDecl.implements[3] === "function") {
        const actualWriter = new CodeBlockWriter();
        classDecl.implements[3](actualWriter);
        expect(actualWriter.toString()).toBe("boolean[]");
      }
      expect(classDecl.implements.length).toBe(4);

      const definedSet = Array.from(classDecl.implementsSet.values());
      expect(definedSet[0]).toBe(LiteralTypeStructureImpl.get("NumberStringType"));
      expect(definedSet[1]).toBe(LiteralTypeStructureImpl.get("NumberStringInterface"));
      expect(definedSet[2]).toBeInstanceOf(WriterTypeStructureImpl);
      if (definedSet[2] instanceof WriterTypeStructureImpl) {
        const actualWriter = new CodeBlockWriter();
        definedSet[2].writerFunction(actualWriter);
        expect(actualWriter.toString()).toBe("Record<string, boolean>");
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
  
      expect(classDecl.implements).toEqual([
        arrayTypeStructure.writerFunction
      ]);
  
      expect(Array.from(classDecl.implementsSet.values())).toEqual([
        arrayTypeStructure
      ]);
  
      expect(writerCount).toBe(0);
    });

    it("current structure implementation", () => {
      classDecl = new ClassDeclarationImpl;
      classDecl.implementsSet.add(LiteralTypeStructureImpl.get("NumberStringType"));
      classDecl.implementsSet.add(LiteralTypeStructureImpl.get("NumberStringInterface"));
      classDecl.implementsSet.add(writerTypeStructure);
      classDecl.implementsSet.add(arrayTypeStructure);

      classDecl = ClassDeclarationImpl.clone(classDecl);

      const classImplements: stringOrWriterFunction[] = classDecl.implements.slice();
      const arrayWriter: stringOrWriterFunction | undefined = classImplements.pop();

      expect(classImplements[0]).toBe("NumberStringType");
      expect(classImplements[1]).toBe("NumberStringInterface");
      expect(classImplements.length).toBe(3);

      if (typeof classImplements[2] === "function") {
        const actualWriter = new CodeBlockWriter();
        classImplements[2](actualWriter);
        expect(actualWriter.toString()).toBe("Record<string, boolean>");
      }

      expect(writerCount).toBe(1);

      const writer = new CodeBlockWriter();
      (arrayWriter as WriterFunction)(writer);
      expect(writer.toString()).toBe("boolean[]");
    });
  });

  it("with .toJSON()", () => {
    classDecl = new ClassDeclarationImpl;
    classDecl.implementsSet.add(writerTypeStructure);
    classDecl.implementsSet.add(arrayTypeStructure);

    expect(classDecl.toJSON().implements).toEqual([
      "Record<string, boolean>",
      "boolean[]"
    ]);

    expect(writerCount).toBe(1);
  });
});
