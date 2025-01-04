import path from "path";

import {
  ModuleSourceDirectory,
  pathToModule
} from "#utilities/source/AsyncSpecModules.js";

import {
  ImportManager,
  ImportSpecifierImpl,
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
    expect(CallSignature.name).toBe("CallSignatureDeclarationStructure");
    expect(CallSignature.isTypeOnly).toBe(true);
    expect(CallSignature.alias).toBe(undefined);

    expect(OptionalKind.name).toBe("OptionalKind");
    expect(OptionalKind.isTypeOnly).toBe(true);
    expect(OptionalKind.alias).toBe(undefined);

    expect(StructureKind.name).toBe("StructureKind");
    expect(StructureKind.isTypeOnly).toBe(false);
    expect(StructureKind.alias).toBe(undefined);
  }
});
