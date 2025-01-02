# ts-morph-structures: Structure classes for ts-morph

The [ts-morph package](https://npmjs.com/package/ts-morph) has simplified [structure API's](https://ts-morph.com/manipulation/structures) for atomic operations on TypeScript nodes.  However, ts-morph doesn't provide implementations of those structures.  This project does, as a support tool for ts-morph, in the form of "structure classes".

Also, ts-morph's structure interfaces treat types as strings or writer functions only.  This project provides "type structure classes" to offer a tree of objects representing a TypeScript type.

ts-morph-structures also has a couple of utilities for managing module imports and exports (`ImportManager` and `ExportManager`), and a set of "type-to-class" utilities.

[They're all documented here.](https://ajvincent.github.io/es-membrane/ts-morph-structures/)

## Installation

`npm install --save-dev ts-morph ts-morph-structures`

## Examples

### Building an exports file

```typescript
import path from "path";
import type {
  Project
} from "ts-morph";

import {
  type AddImportContext,
  ImportManager,
} from "ts-morph-structures";

import projectDir from "./constants.js";

function addExportsFile(project: Project): void {
  const publicExports = new ExportManager(
    path.join(projectDir, "./dist/exports.ts")
  );

  publicExports.addExports({
    pathToExportedModule: path.join(projectDir, "./source/classes/NumberStringClass.ts"),
    exportNames: ["NumberStringClass"],
    isDefaultImport: true,
    isTypeOnly: false
  });

  publicExports.addExports({
    pathToExportedModule: path.join(projectDir, "./source/classes/NumberStringClass.ts"),
    exportNames: ["NumberStringType"],
    isDefaultImport: false,
    isTypeOnly: true
  });

  const sourceFile = new SourceFileImpl();
  sourceFile.statements.push(...imports.getDeclarations());

  project.createSourceFile(imports.absolutePathToModule, sourceFile);
}
```

### Adding a method to a class

```typescript
import type {
  ClassDeclaration
} from "ts-morph";

import {
  LiteralTypeStructureImpl,
  MethodDeclarationImpl,
  ParameterDeclarationImpl,
} from "ts-morph-structures";

function addRepeatForward(classDecl: ClassDeclaration): void {
  const repeatForward = new MethodDeclarationImpl(false, "repeatForward");
  repeatForward.returnType = "string";

  {
    const param = new ParameterDeclarationImpl("s");
    param.typeStructure = LiteralTypeStructureImpl.get("string");
    repeatForward.parameters.push(param);
  }

  repeatForward.parameters.push(ParameterDeclarationImpl.clone({
    name: "n",
    type: "number",
    initializer: "1",
  }));

  repeatForward.statements.push(`return s.repeat(n);`);

  classDecl.addMethod(repeatForward);
  /*
  repeatForward(s: string, n: number): string {
    return s.repeat(n);
  }
  */
}
```

### Building a type alias

```typescript
import type {
  SourceFile
} from "ts-morph";

import {
  TypeAliasDeclarationImpl,
  TypeParameterDeclarationImpl,
  parseLiteralType
} from "ts-morph-structures";

function addPushableArrayType(sourceFile: SourceFile): void {
  const alias = new TypeAliasDeclarationImpl(
    "PushableArray", `readonly T[] & Pick<T[], "push">`
  );
  alias.typeParameters.push(new TypeParameterDeclarationImpl("T"));

  sourceFile.addTypeAlias(alias);
  /*
  type PushableArray<T> = readonly T[] & Pick<T[], "push">;
  */
}
```

### Modifying an existing type

```typescript
import type {
  SourceFile,
  TypeAliasDeclaration,
} from "ts-morph";

import {
  LiteralTypeStructureImpl,
  TypeArgumentedTypeStructureImpl,
  type TypeStructures,
  parseLiteralType
} from "ts-morph-structures";

function addTypeFestSimplify(sourceFile: SourceFile): void {
  // assuming the "Simplify" type is already in the source file
  const aliasNode: TypeAliasDeclaration = sourceFile.getTypeAliasOrThrow("PushableArray");

  let typeStructure: TypeStructures = parseLiteralType(
    aliasNode.getTypeNodeOrThrow().getText()
  );
  typeStructures = new TypeArgumentedTypeStructureImpl(
    LiteralTypeStructureImpl.get("Simplify"), [ typeStructure ]
  );
  aliasNode.setType(typeStructure.writerFunction);
}
```
