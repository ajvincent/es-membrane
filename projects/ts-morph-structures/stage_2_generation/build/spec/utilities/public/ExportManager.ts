import path from "path";

import {
  pathToModule
} from "#utilities/source/AsyncSpecModules.js";

import ExportManager from "#stage_two/generation/build/utilities/public/ExportManager.js";

import {
  stageDir,
} from "#stage_two/generation/build/constants.js";

import {
  ExportDeclarationImpl,
  ExportSpecifierImpl,
} from "#stage_one/prototype-snapshot/exports.js";

it("ExportManager can export values from submodules", () => {
  const baseDir = pathToModule(stageDir, "non-existent");
  const pathToExport = path.join(baseDir, "foo.js");
  const manager = new ExportManager(pathToExport);

  manager.addExports({
    absolutePathToModule: path.join(baseDir, "source/foo.ts"),
    exportNames: ["Foo"],
    isDefaultExport: true,
    isType: false,
  });

  manager.addExports({
    absolutePathToModule: path.join(baseDir, "source/foo.ts"),
    exportNames: ["FooInterface", "FooType"],
    isDefaultExport: false,
    isType: true,
  });

  manager.addExports({
    absolutePathToModule: path.join(baseDir, "source/foo.ts"),
    exportNames: ["LittleFoo"],
    isDefaultExport: false,
    isType: false
  });

  manager.addExports({
    absolutePathToModule: path.join(baseDir, "source/bar.ts"),
    exportNames: ["BarType", "BarInterface"],
    isDefaultExport: false,
    isType: true
  });

  const declarations: ExportDeclarationImpl[] = manager.getDeclarations();
  expect(declarations.length).toBe(2);

  const [firstDecl, secondDecl] = declarations;
  {
    expect(firstDecl.moduleSpecifier).toBe("./source/bar.js");
    expect(firstDecl.isTypeOnly).toBe(true);
    expect(firstDecl.namedExports.length).toBe(2);
    const [firstExport, secondExport] = firstDecl.namedExports;
    expect(firstExport).toBeInstanceOf(ExportSpecifierImpl);
    if (firstExport instanceof ExportSpecifierImpl) {
      expect(firstExport.name).toBe("BarInterface");
      expect(firstExport.alias).toBe(undefined);
      expect(firstExport.isTypeOnly).toBe(false);
    }

    expect(secondExport).toBeInstanceOf(ExportSpecifierImpl);
    if (secondExport instanceof ExportSpecifierImpl) {
      expect(secondExport.name).toBe("BarType");
      expect(secondExport.alias).toBe(undefined);
      expect(secondExport.isTypeOnly).toBe(false);
    }
  }

  {
    expect(secondDecl.moduleSpecifier).toBe("./source/foo.js");
    expect(secondDecl.isTypeOnly).toBe(false);
    expect(secondDecl.namedExports.length).toBe(4);
    const [Foo, FooInterface, FooType, LittleFoo] = secondDecl.namedExports;
    expect(Foo).toBeInstanceOf(ExportSpecifierImpl);
    if (Foo instanceof ExportSpecifierImpl) {
      expect(Foo.name).toBe("default");
      expect(Foo.alias).toBe("Foo");
      expect(Foo.isTypeOnly).toBe(false);
    }

    expect(FooInterface).toBeInstanceOf(ExportSpecifierImpl);
    if (FooInterface instanceof ExportSpecifierImpl) {
      expect(FooInterface.name).toBe("FooInterface");
      expect(FooInterface.alias).toBe(undefined);
      expect(FooInterface.isTypeOnly).toBe(true);
    }

    expect(FooType).toBeInstanceOf(ExportSpecifierImpl);
    if (FooType instanceof ExportSpecifierImpl) {
      expect(FooType.name).toBe("FooType");
      expect(FooType.alias).toBe(undefined);
      expect(FooType.isTypeOnly).toBe(true);
    }

    expect(LittleFoo).toBeInstanceOf(ExportSpecifierImpl);
    if(LittleFoo instanceof ExportSpecifierImpl) {
      expect(LittleFoo.name).toBe("LittleFoo");
      expect(LittleFoo.alias).toBe(undefined);
      expect(LittleFoo.isTypeOnly).toBe(false);
    }
  }
});
