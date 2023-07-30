import ts from "ts-morph";

import convertTypeNode from "#ts-morph_structures/source/bootstrap/convertTypeNode.mjs";
import { LiteralTypedStructureImpl, StringTypedStructureImpl, TypeStructure } from "#ts-morph_structures/exports.mjs";

describe("convertTypeNode generates correct type structures, with type", () => {
  let declaration: ts.VariableDeclaration;
  let structure: TypeStructure | null;

  beforeAll(() => {
    const TSC_CONFIG: ts.ProjectOptions = {
      "compilerOptions": {
        "lib": ["es2022"],
        "module": ts.ModuleKind.ESNext,
        "target": ts.ScriptTarget.ESNext,
        "moduleResolution": ts.ModuleResolutionKind.NodeNext,
      },
      skipAddingFilesFromTsConfig: true,
      useInMemoryFileSystem: true,
    };

    const project = new ts.Project(TSC_CONFIG);
    const sourceFile = project.createSourceFile("file.ts", `
const refSymbol = Symbol("reference symbol");
const A: string;
    `.trim() + "\n");
    declaration = sourceFile.getVariableDeclarationOrThrow("A");
  });

  afterEach(() => structure = null);

  function setTypeStructure(
    rawType: string
  ): void
  {
    declaration.setType(rawType);
    const typeNode = declaration.getTypeNodeOrThrow();
    structure = convertTypeNode(typeNode);
  }

  it("any", () => {
    setTypeStructure("any");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl) {
      expect(structure.stringValue).toBe("any");
    }
  });

  it("never", () => {
    setTypeStructure("never");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl) {
      expect(structure.stringValue).toBe("never");
    }
  });

  it("string", () => {
    setTypeStructure("string");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("string");
  });

  it("boolean", () => {
    setTypeStructure("boolean");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("boolean");
  });

  it("number", () => {
    setTypeStructure("number");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("number");
  });

  it("symbol", () => {
    setTypeStructure("symbol");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("symbol");
  });

  it("true", () => {
    setTypeStructure("true");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("true");
  });

  it("false", () => {
    setTypeStructure("false");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("false");
  });

  it("unknown", () => {
    setTypeStructure("unknown");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("unknown");
  });

  it("null", () => {
    setTypeStructure("null");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("null");
  });

  it("undefined", () => {
    setTypeStructure("undefined");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("undefined");
  });

  it("void", () => {
    setTypeStructure("void");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("void");
  });

  it("12.5", () => {
    setTypeStructure("12.5");
    expect(structure).toBeInstanceOf(LiteralTypedStructureImpl);
    if (structure instanceof LiteralTypedStructureImpl)
      expect(structure.stringValue).toBe("12.5");
  });

  it("string literal 'foo'", () => {
    setTypeStructure(`"foo"`);
    expect(structure).toBeInstanceOf(StringTypedStructureImpl)
    if (structure instanceof StringTypedStructureImpl)
      expect(structure.stringValue).toBe("foo");
  });
});
