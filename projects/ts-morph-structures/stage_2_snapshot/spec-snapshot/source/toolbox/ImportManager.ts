import path from "path";

import {
  ModuleSourceDirectory,
  pathToModule
} from "#utilities/source/AsyncSpecModules.js";

import {
  ImportDeclarationImpl,
  ImportManager,
  ImportSpecifierImpl,
  SourceFileImpl,
} from "#stage_two/snapshot/source/exports.js";

const stageDir: ModuleSourceDirectory = {
  isAbsolutePath: true,
  pathToDirectory: "#stage_two/snapshot",
};

it("ImportManager can import values from submodules", () => {
  const baseDir = pathToModule(stageDir, "non-existent");
  const pathToImport = path.join(baseDir, "module.ts");
  const manager = new ImportManager(pathToImport);

  manager.addImports({
    pathToImportedModule: "mixin-decorators",
    isPackageImport: true,
    isDefaultImport: true,
    importNames: ["MultiMixinBuilder"],
    isTypeOnly: false,
  });

 manager.addImports({
    pathToImportedModule: "ts-morph",
    isPackageImport: true,
    isDefaultImport: false,
    importNames: [
      "CallSignatureDeclarationStructure",
      "OptionalKind",
      "StructureKind"
    ],
    isTypeOnly: true
  });

  // testing what happens when we later declare something isn't a type
  manager.addImports({
    pathToImportedModule: "ts-morph",
    isPackageImport: true,
    isDefaultImport: false,
    importNames: ["StructureKind"],
    isTypeOnly: false,
  });

  manager.addImports({
    pathToImportedModule: "#utilities/source/AsyncSpecModules.ts",
    isPackageImport: true,
    isDefaultImport: false,
    importNames: ["ModuleSourceDirectory"],
    isTypeOnly: true
  });

  manager.addImports({
    pathToImportedModule: path.join(baseDir, "source/foo/Foo.ts"),
    isPackageImport: false,
    isDefaultImport: true,
    importNames: ["Foo"],
    isTypeOnly: false,
  });

  manager.addImports({
    pathToImportedModule: path.join(baseDir, "source/bar/Bar.ts"),
    isPackageImport: false,
    isDefaultImport: true,
    importNames: ["Bar"],
    isTypeOnly: false,
  });

  const decls = manager.getDeclarations();
  expect(decls.map(d => d.moduleSpecifier)).toEqual([
    "./source/bar/Bar.js",
    "./source/foo/Foo.js",
    "#utilities/source/AsyncSpecModules.js",
    "mixin-decorators",
    "ts-morph",
  ]);

  const [Bar, Foo, AsyncSpecModules, MixinDecorators, TSM] = decls;
  {
    expect(Bar.isTypeOnly).toBe(false);
    expect(Bar.defaultImport).toBe("Bar");
    expect(Bar.namespaceImport).toBe(undefined);
    expect(Bar.namedImports).toEqual([]);
  }

  void(Foo); // redundant with the Bar test.

  {
    expect(AsyncSpecModules.isTypeOnly).toBe(true);
    expect(AsyncSpecModules.defaultImport).toBe(undefined);
    expect(AsyncSpecModules.namespaceImport).toBe(undefined);

    expect(AsyncSpecModules.namedImports.length).toBe(1);
    const [spec] = AsyncSpecModules.namedImports;
    expect(spec).toBeInstanceOf(ImportSpecifierImpl);
    if (spec instanceof ImportSpecifierImpl) {
      expect(spec.name).toBe("ModuleSourceDirectory");
      expect(spec.isTypeOnly).toBe(false);
      expect(spec.alias).toBe(undefined);
    }
  }

  {
    expect(MixinDecorators.isTypeOnly).toBe(false);
    expect(MixinDecorators.defaultImport).toBe("MultiMixinBuilder");
    expect(MixinDecorators.namespaceImport).toBe(undefined);
    expect(MixinDecorators.namedImports).toEqual([]);
  }

  {
    expect(TSM.isTypeOnly).toBe(false);
    expect(TSM.defaultImport).toBe(undefined);
    expect(TSM.namespaceImport).toBe(undefined);

    expect(TSM.namedImports.length).toBe(3);

    const [CallSignature, OptionalKind, StructureKind] = TSM.namedImports as ImportSpecifierImpl[];
    expect(CallSignature.name).withContext("CallSignature").toBe("CallSignatureDeclarationStructure");
    expect(CallSignature.isTypeOnly).withContext("CallSignature").toBeTrue();
    expect(CallSignature.alias).withContext("CallSignature").toBeUndefined();

    expect(OptionalKind.name).withContext("OptionalKind").toBe("OptionalKind");
    expect(OptionalKind.isTypeOnly).withContext("OptionalKind").toBeTrue();
    expect(OptionalKind.alias).withContext("OptionalKind").toBeUndefined();

    expect(StructureKind.name).withContext("StructureKind").toBe("StructureKind");
    expect(StructureKind.isTypeOnly).withContext("StructureKind").toBeFalse();
    expect(StructureKind.alias).withContext("StructureKind").toBeUndefined();
  }
});

it("ImportManager can import from declarations", () => {
  const baseDir = pathToModule(stageDir, "non-existent");
  const pathToImport = path.join(baseDir, "module.ts");
  const manager = new ImportManager(pathToImport);

  {
    const mixinDecl = new ImportDeclarationImpl(
      "mixin-decorators"
    );
    mixinDecl.defaultImport = "MultiMixinBuilder";
    manager.addFromDeclaration(mixinDecl);
  }

  {
    const decl = new ImportDeclarationImpl("ts-morph");

    const callSig = new ImportSpecifierImpl("CallSignatureDeclarationStructure");
    callSig.isTypeOnly = true;

    const optionalKind = new ImportSpecifierImpl("OptionalKind");
    optionalKind.isTypeOnly = true;

    decl.namedImports.push(
      callSig,
      optionalKind,
      new ImportSpecifierImpl("StructureKind"),
    );
    manager.addFromDeclaration(decl);
  }

  {
    const decl = new ImportDeclarationImpl("#utilities/source/AsyncSpecModules.ts");
    decl.isTypeOnly = true;
    decl.namedImports.push("ModuleSourceDirectory");
    manager.addFromDeclaration(decl);
  }

  // const baseDir = pathToModule(stageDir, "non-existent");
  // stageDir/non-existent/module.ts
  {
    const decl = new ImportDeclarationImpl("../../source/foo/Foo.ts");
    decl.defaultImport = "Foo";
    manager.addFromDeclaration(decl);
  }

  {
    // testing non-TypeScript references
    const decl = new ImportDeclarationImpl(("../../source/bar/Bar.js"));
    decl.defaultImport = "Bar";
    manager.addFromDeclaration(decl);
  }

  const decls = manager.getDeclarations();
  expect(decls.map(d => d.moduleSpecifier)).toEqual([
    "../../source/bar/Bar.js",
    "../../source/foo/Foo.js",
    "#utilities/source/AsyncSpecModules.js",
    "mixin-decorators",
    "ts-morph",
  ]);

  const [Bar, Foo, AsyncSpecModules, MixinDecorators, TSM] = decls;
  {
    expect(Bar.isTypeOnly).withContext("Bar.isTypeOnly").toBeFalse();
    expect(Bar.defaultImport).toBe("Bar");
    expect(Bar.namespaceImport).toBeUndefined();
    expect(Bar.namedImports).toEqual([]);
  }

  void(Foo); // redundant with the Bar test.

  {
    expect(AsyncSpecModules.isTypeOnly).withContext("AsyncSpecModules.isTypeOnly").toBeTrue();
    expect(AsyncSpecModules.defaultImport).withContext("AsyncSpecModules.defaultImport").toBeUndefined();
    expect(AsyncSpecModules.namespaceImport).withContext("AsyncSpecModules.namespaceImport").toBeUndefined();

    expect(AsyncSpecModules.namedImports.length).toBe(1);
    const [spec] = AsyncSpecModules.namedImports;
    expect(spec).toBeInstanceOf(ImportSpecifierImpl);
    if (spec instanceof ImportSpecifierImpl) {
      expect(spec.name).toBe("ModuleSourceDirectory");
      expect(spec.isTypeOnly).withContext("spec.isTypeOnly").toBeFalse();
      expect(spec.alias).toBeUndefined();
    }
  }

  {
    expect(MixinDecorators.isTypeOnly).withContext("MixinDecorators.isTypeOnly").toBeFalse();
    expect(MixinDecorators.defaultImport).toBe("MultiMixinBuilder");
    expect(MixinDecorators.namespaceImport).toBeUndefined();
    expect(MixinDecorators.namedImports).toEqual([]);
  }

  {
    expect(TSM.isTypeOnly).withContext("TSM.isTypeOnly").toBeFalse();
    expect(TSM.defaultImport).toBeUndefined();
    expect(TSM.namespaceImport).toBeUndefined();

    expect(TSM.namedImports.length).toBe(3);

    const [CallSignature, OptionalKind, StructureKind] = TSM.namedImports as ImportSpecifierImpl[];
    expect(CallSignature.name).withContext("CallSignature").toBe("CallSignatureDeclarationStructure");
    expect(CallSignature.isTypeOnly).withContext("CallSignature").toBeTrue();
    expect(CallSignature.alias).withContext("CallSignature").toBeUndefined();

    expect(OptionalKind.name).withContext("OptionalKind").toBe("OptionalKind");
    expect(OptionalKind.isTypeOnly).withContext("OptionalKind").toBeTrue();
    expect(OptionalKind.alias).withContext("OptionalKind").toBeUndefined();

    expect(StructureKind.name).withContext("StructureKind").toBe("StructureKind");
    expect(StructureKind.isTypeOnly).withContext("StructureKind").toBeFalse();
    expect(StructureKind.alias).withContext("StructureKind").toBeUndefined();
  }
});

it("ImportManager.fromSourceFile() works", () => {
  const baseDir = pathToModule(stageDir, "non-existent");
  const pathToImport = path.join(baseDir, "module.ts");
  //const manager = new ImportManager(pathToImport);
  const sourceFile = new SourceFileImpl();

  {
    const mixinDecl = new ImportDeclarationImpl(
      "mixin-decorators"
    );
    mixinDecl.defaultImport = "MultiMixinBuilder";
    sourceFile.statements.push(mixinDecl);
  }

  {
    const decl = new ImportDeclarationImpl("ts-morph");

    const callSig = new ImportSpecifierImpl("CallSignatureDeclarationStructure");
    callSig.isTypeOnly = true;

    const optionalKind = new ImportSpecifierImpl("OptionalKind");
    optionalKind.isTypeOnly = true;

    decl.namedImports.push(
      callSig,
      optionalKind,
      new ImportSpecifierImpl("StructureKind"),
    );
    sourceFile.statements.push(decl);
  }

  {
    const decl = new ImportDeclarationImpl("#utilities/source/AsyncSpecModules.ts");
    decl.isTypeOnly = true;
    decl.namedImports.push("ModuleSourceDirectory");
    sourceFile.statements.push(decl);
  }

  // const baseDir = pathToModule(stageDir, "non-existent");
  // stageDir/non-existent/module.ts
  {
    const decl = new ImportDeclarationImpl("../../source/foo/Foo.ts");
    decl.defaultImport = "Foo";
    sourceFile.statements.push(decl);
  }

  {
    // testing non-TypeScript references
    const decl = new ImportDeclarationImpl(("../../source/bar/Bar.js"));
    decl.defaultImport = "Bar";
    sourceFile.statements.push(decl);
  }

  const manager = ImportManager.fromSourceFile(pathToImport, sourceFile);

  const decls = manager.getDeclarations();
  expect(decls.map(d => d.moduleSpecifier)).toEqual([
    "../../source/bar/Bar.js",
    "../../source/foo/Foo.js",
    "#utilities/source/AsyncSpecModules.js",
    "mixin-decorators",
    "ts-morph",
  ]);

  const [Bar, Foo, AsyncSpecModules, MixinDecorators, TSM] = decls;
  {
    expect(Bar.isTypeOnly).withContext("Bar.isTypeOnly").toBeFalse();
    expect(Bar.defaultImport).toBe("Bar");
    expect(Bar.namespaceImport).toBeUndefined();
    expect(Bar.namedImports).toEqual([]);
  }

  void(Foo); // redundant with the Bar test.

  {
    expect(AsyncSpecModules.isTypeOnly).withContext("AsyncSpecModules.isTypeOnly").toBeTrue();
    expect(AsyncSpecModules.defaultImport).withContext("AsyncSpecModules.defaultImport").toBeUndefined();
    expect(AsyncSpecModules.namespaceImport).withContext("AsyncSpecModules.namespaceImport").toBeUndefined();

    expect(AsyncSpecModules.namedImports.length).toBe(1);
    const [spec] = AsyncSpecModules.namedImports;
    expect(spec).toBeInstanceOf(ImportSpecifierImpl);
    if (spec instanceof ImportSpecifierImpl) {
      expect(spec.name).toBe("ModuleSourceDirectory");
      expect(spec.isTypeOnly).withContext("spec.isTypeOnly").toBeFalse();
      expect(spec.alias).toBeUndefined();
    }
  }

  {
    expect(MixinDecorators.isTypeOnly).withContext("MixinDecorators.isTypeOnly").toBeFalse();
    expect(MixinDecorators.defaultImport).toBe("MultiMixinBuilder");
    expect(MixinDecorators.namespaceImport).toBeUndefined();
    expect(MixinDecorators.namedImports).toEqual([]);
  }

  {
    expect(TSM.isTypeOnly).withContext("TSM.isTypeOnly").toBeFalse();
    expect(TSM.defaultImport).toBeUndefined();
    expect(TSM.namespaceImport).toBeUndefined();

    expect(TSM.namedImports.length).toBe(3);

    const [CallSignature, OptionalKind, StructureKind] = TSM.namedImports as ImportSpecifierImpl[];
    expect(CallSignature.name).withContext("CallSignature").toBe("CallSignatureDeclarationStructure");
    expect(CallSignature.isTypeOnly).withContext("CallSignature").toBeTrue();
    expect(CallSignature.alias).withContext("CallSignature").toBeUndefined();

    expect(OptionalKind.name).withContext("OptionalKind").toBe("OptionalKind");
    expect(OptionalKind.isTypeOnly).withContext("OptionalKind").toBeTrue();
    expect(OptionalKind.alias).withContext("OptionalKind").toBeUndefined();

    expect(StructureKind.name).withContext("StructureKind").toBe("StructureKind");
    expect(StructureKind.isTypeOnly).withContext("StructureKind").toBeFalse();
    expect(StructureKind.alias).withContext("StructureKind").toBeUndefined();
  }
});
