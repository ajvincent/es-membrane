# Import and Export Managers

At least one of my experiments has the following code:

```typescript
import path from "path";

import {
  ModuleKind,
  ModuleResolutionKind,
  Project,
  type ProjectOptions,
  ScriptTarget,
  SourceFile,
  TypeNode,
  StructureKind,
} from "ts-morph";
```

[`ImportDeclarationImpl`](../api/ts-morph-structures.importdeclarationimpl.md) works to support this, but it can be messy to organize several of these.  This is especially true with the `namedImports` property, which uses [`ImportSpecifierImpl`](../api/ts-morph-structures.importspecifierimpl.md) instances.

To make this _much_ easier to deal with, I provide an [`ImportManager`](../api/ts-morph-structures.importmanager.md) class.  There's also an equivalent for export declarations in the [`ExportManager`](../api/ts-morph-structures.exportmanager.md) class.

## Import Manager

At its heart, the `ImportManager` class has three key parts:

1. The absolute path to the source file it lives in, as the constructor's sole argument.
    - Pass in files ending in `.ts` or `.mts`.
    - I may support `.js` and `.mjs` if someone asks for it.
2. The `addImports(context: AddImportContext)` method, which allows you to define what you're importing.
3. The `getDeclarations()` method, which returns `ImportDeclarationImpl[]` for you to add as statements to a [`SourceFileImpl`](../api/ts-morph-structures.sourcefileimpl.md) for your source file.

The [`AddImportContext`](../api/ts-morph-structures.addimportcontext.md) interface is very simple:

- `pathToImportedModule`, an absolute path to the module you're importing from.
  - Packages (as opposed to modules) you can pass in, with `isPackageImport` set to true.
  - Otherwise, pass in files ending in `.ts` or `.mts`.
  - I may support `.js` and `.mjs` if someone asks for it.
- `isPackageImport`
  - true if `pathToImportedModule` is a package like `"path"`.
  - false if it's an actual module file to create a relative path to
- `importNames`, the actual names you want to import from the module.  (If you want `import *`, pass in an empty array.)
- `isDefaultImport`
  - true if `importNames` represents a default import alias, in which case it must be an array of one string
- `isTypeOnly`
  - true if `importNames` represents only types

### Example Code

```typescript
import path from "path";

import {
  type AddImportContext,
  ImportManager,
  SourceFileImpl,
} from "./source/exports.js";

import projectDir from "./constants.js";

const imports = new ImportManager(
  path.join(projectDir, "./dist/myFile.ts")
);

imports.addImports({
  pathToImportedModule: "path",
  isPackageImport: true,
  importNames: ["path"],
  isDefaultImport: true,
  isTypeOnly: false
});

imports.addImports({
  pathToImportedModule: path.join(projectDir, "./source/exports.ts"),
  isPackageImport: false,
  importNames: [
    "ImportManager",
    "SourceFileImpl",
  ],
  isDefaultImport: false,
  isTypeOnly: false
});

imports.addImports({
  pathToImportedModule: path.join(projectDir, "./source/exports.ts"),
  isPackageImport: false,
  importNames: [
    "AddImportContext",
  ],
  isDefaultImport: false,
  isTypeOnly: true
});

imports.addImports({
  pathToImportedModule: path.join(projectDir, "./constants.ts"),
  isPackageImport: false,
  importNames: [
    "projectDir",
  ],
  isDefaultImport: true,
  isTypeOnly: true
});

const sourceFile = new SourceFileImpl();
sourceFile.statements.push(...imports.getDeclarations());
```

## Export Manager

The `ExportManager` class has a very similar design, and is for creating an _exports_ file.  Its three main components are:

1. An absolute path to the exported module it lives in, as the constructor's sole argument.
2. The `addExports(context: AddExportContext)` method, which allows you to define what you're importing.
3. The `getDeclarations()` method, which returns `ExportDeclarationImpl[]` for you to add as statements to a `SourceFileImpl` for your source file.

I use `ExportManager` heavily to create an `exports.ts` file, which then [Rollup](https://www.rollupjs.org) can use to create a bundle of the `ts-morph-structures` code.  This also allows me to declare what is publicly available, versus what is internal code.

The `AddExportContext` interface is also simple:

- `pathToExportedModule`, an absolute path to the module you're importing from.
- `exportNames`, the actual names you want to import from the module. (If you want `export *`, pass in an empty array.)
- `isDefaultImport`
  - true if `importNames` represents a default import alias, in which case it must be an array of one string
- `isTypeOnly`
  - true if `importNames` represents only types

The API is similar enough to `ImportManager` that I shouldn't need to go into any more detail.

## ExportManager can feed ImportManager

One useful aspect during development, I found, was passing in `publicExports.absolutePathToExportFile` in as the `pathToImportedModule` of the `AddImportContext`.  In other words, once I have an `ExportManager` instance, I can use the absolute path as a starting point for imports.

Similarly, you could pass an import manager's absolute path in to an export manager's `AddExportContext` to define a value you export.
