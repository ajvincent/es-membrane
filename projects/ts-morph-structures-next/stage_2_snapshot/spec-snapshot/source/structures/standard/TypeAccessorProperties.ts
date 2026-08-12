import {
  CodeBlockWriter
} from "ts-morph";

import {
  ClassDeclarationImpl,
  LiteralTypeStructureImpl,
  TypeStructureKind,
  WriterTypeStructureImpl,
} from "#stage_two/snapshot/source/exports.js";

import {
  TypeStructuresBase
} from "#stage_two/snapshot/source/internal-exports.js";

describe("Type accessor properties work", () => {
  let writerCount = 0;
  function writerFunction(
    writer: CodeBlockWriter
  ): void {
    writerCount++;
    writer.write("hello");
  }

  const writerTypeStructure = new WriterTypeStructureImpl(writerFunction);

  let classDecl: ClassDeclarationImpl;
  beforeEach(() => {
    classDecl = new ClassDeclarationImpl;
    writerCount = 0;
  });

  it("starting out undefined", () => {
    expect(classDecl.extends).toBe(undefined);
    expect(classDecl.extendsStructure).toBe(undefined);
  });

  describe("with direct type access", () => {
    it("setting a literal", () => {
      classDecl.extends = "boolean";
      expect(classDecl.extendsStructure).toBe(LiteralTypeStructureImpl.get("boolean"));
      expect(classDecl.extends).toBe("boolean");
    });

    it("setting a writer function", () => {
      classDecl.extends = writerFunction;
      expect(classDecl.extendsStructure).toBe(writerTypeStructure);
      expect(classDecl.extends).toBe(writerFunction);
      expect(writerCount).toBe(0);
    });

    it("setting back to undefined after setting the type", () => {
      classDecl.extends = "never";
      classDecl.extends = undefined;
      expect(classDecl.extends).toBe(undefined);
      expect(classDecl.extendsStructure).toBe(undefined);

      classDecl.extends = writerFunction;
      classDecl.extends = undefined;
      expect(classDecl.extends).toBe(undefined);
      expect(classDecl.extendsStructure).toBe(undefined);
    });

    it("setting back to undefined after setting the type structure", () => {
      classDecl.extendsStructure = LiteralTypeStructureImpl.get("never");
      classDecl.extends = undefined;
      expect(classDecl.extends).toBe(undefined);
      expect(classDecl.extendsStructure as unknown).toBe(undefined);

      classDecl.extendsStructure = writerTypeStructure;
      classDecl.extends = undefined;
      expect(classDecl.extends).toBe(undefined);
      expect(classDecl.extendsStructure as unknown).toBe(undefined);
    });
  });

  describe("with type structure access", () => {
    it("setting a literal", () => {
      classDecl.extendsStructure = LiteralTypeStructureImpl.get("boolean");
      expect(classDecl.extends).toBe("boolean");
      expect(classDecl.extendsStructure).toBe(LiteralTypeStructureImpl.get("boolean"));
    });

    it("setting a type structure", () => {
      classDecl.extendsStructure = writerTypeStructure;
      expect(classDecl.extends).toBe(writerFunction);
      expect(classDecl.extendsStructure).toBe(writerTypeStructure);
      expect(writerCount).toBe(0);
    });

    it("setting back to undefined after setting the type", () => {
      classDecl.extends = "never";
      classDecl.extendsStructure = undefined;
      expect(classDecl.extends as unknown).toBe(undefined);
      expect(classDecl.extendsStructure).toBe(undefined);

      classDecl.extends = writerFunction;
      classDecl.extendsStructure = undefined;
      expect(classDecl.extends as unknown).toBe(undefined);
      expect(classDecl.extendsStructure).toBe(undefined);
    });

    it("setting back to undefined after setting the type structure", () => {
      classDecl.extendsStructure = LiteralTypeStructureImpl.get("never");
      classDecl.extendsStructure = undefined;
      expect(classDecl.extends).toBe(undefined);
      expect(classDecl.extendsStructure).toBe(undefined);

      classDecl.extendsStructure = writerTypeStructure;
      classDecl.extendsStructure = undefined;
      expect(classDecl.extends).toBe(undefined);
      expect(classDecl.extendsStructure).toBe(undefined);
    });
  });

  describe("with static clone()", () => {
    let cloneDecl: ClassDeclarationImpl;
    it("starting from undefined", () => {
      cloneDecl = ClassDeclarationImpl.clone(classDecl);
      expect(cloneDecl.extends).toBe(undefined);
      expect(cloneDecl.extendsStructure).toBe(undefined);
    });

    it("with a string type", () => {
      classDecl.extends = "boolean";
      cloneDecl = ClassDeclarationImpl.clone(classDecl);
      expect(cloneDecl.extends).toBe("boolean");
      expect(cloneDecl.extendsStructure).toBe(LiteralTypeStructureImpl.get("boolean"));
    });

    it("with a writer function", () => {
      classDecl.extends = writerFunction;
      cloneDecl = ClassDeclarationImpl.clone(classDecl);
      expect(cloneDecl.extends).toBe(writerFunction);
      expect(cloneDecl.extendsStructure).not.toBe(writerTypeStructure);
      expect(typeof classDecl.extendsStructure).toBe("object");
      if (typeof classDecl.extendsStructure === "object") {
        expect(classDecl.extendsStructure.kind).toBe(TypeStructureKind.Writer);
        expect(classDecl.extendsStructure.writerFunction).toBe(writerFunction);
      }

      expect(
        TypeStructuresBase.getTypeStructureForCallback(writerFunction)
      ).toBe(writerTypeStructure);
      expect(writerCount).toBe(0);
    });

    it("with a string type structure", () => {
      classDecl.extendsStructure = LiteralTypeStructureImpl.get("boolean");
      cloneDecl = ClassDeclarationImpl.clone(classDecl);
      expect(cloneDecl.extends).toBe("boolean");
      expect(cloneDecl.extendsStructure).toBe(LiteralTypeStructureImpl.get("boolean"));
    });

    it("with a writer type structure", () => {
      classDecl.extendsStructure = writerTypeStructure;
      cloneDecl = ClassDeclarationImpl.clone(classDecl);
      expect(cloneDecl.extends).toBe(writerFunction);
      expect(cloneDecl.extendsStructure).not.toBe(writerTypeStructure);
      expect(typeof classDecl.extendsStructure).toBe("object");
      if (typeof classDecl.extendsStructure === "object") {
        expect(classDecl.extendsStructure.kind).toBe(TypeStructureKind.Writer);
        expect(classDecl.extendsStructure.writerFunction).toBe(writerFunction);
      }

      expect(
        TypeStructuresBase.getTypeStructureForCallback(writerFunction)
      ).toBe(writerTypeStructure);
      expect(writerCount).toBe(0);
    });
  });

  describe("with .toJSON()", () => {
    it("starting out undefined", () => {
      expect(classDecl.toJSON().extends).toBe(undefined);
    });

    it("and a string type field", () => {
      classDecl.extends = "boolean";
      expect(classDecl.toJSON().extends).toBe("boolean");
    });

    it("and a writer function type field", () => {
      classDecl.extends = writerFunction;
      expect(classDecl.toJSON().extends).toBe("hello");
      expect(writerCount).toBe(1);
    });

    it("and a string typeStructure field", () => {
      classDecl.extendsStructure = LiteralTypeStructureImpl.get("boolean");
      expect(classDecl.toJSON().extends).toBe("boolean");
    });

    it("and an object typeStructure field", () => {
      classDecl.extendsStructure = writerTypeStructure;
      expect(classDecl.toJSON().extends).toBe("hello");
      expect(writerCount).toBe(1);
    });
  });
});
