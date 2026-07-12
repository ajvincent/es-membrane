import {
  StructureKind,
  type ImportDeclarationStructure
} from "ts-morph";

import {
  ImportDeclarationImpl,
  /*
  type ImportSpecifierImpl,
  */
} from "#stage_two/snapshot/source/exports.js";

describe("ImportDeclarationImpl.clone()", () => {
  const structure: ImportDeclarationStructure = {
    defaultImport: "MyDefaultExports",
    isTypeOnly: false,
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "#stage_two/snapshot/source/exports.js",
    namedImports: [
      {
        isTypeOnly: true,
        name: "ClassDeclarationImpl",
      },
      {
        isTypeOnly: false,
        name: "ImportDeclarationImpl",
      },
      {
        isTypeOnly: false,
        name: "ImportSpecifierImpl",
      },
      {
        isTypeOnly: true,
        name: "MethodDeclarationImpl",
      },
    ]
  };

  it("picks up the usual fields by default", () => {
    const decl = ImportDeclarationImpl.clone(structure);
    const expected: ImportDeclarationStructure = {
      leadingTrivia: [],
      defaultImport: "MyDefaultExports",
      isTypeOnly: false,
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: "#stage_two/snapshot/source/exports.js",
      namedImports: [
        {
          leadingTrivia: [],
          isTypeOnly: true,
          kind: StructureKind.ImportSpecifier,
          name: "ClassDeclarationImpl",
          trailingTrivia: [],
        },
        {
          leadingTrivia: [],
          isTypeOnly: false,
          kind: StructureKind.ImportSpecifier,
          name: "ImportDeclarationImpl",
          trailingTrivia: [],
        },
        {
          leadingTrivia: [],
          isTypeOnly: false,
          kind: StructureKind.ImportSpecifier,
          name: "ImportSpecifierImpl",
          trailingTrivia: [],
        },
        {
          leadingTrivia: [],
          isTypeOnly: true,
          kind: StructureKind.ImportSpecifier,
          name: "MethodDeclarationImpl",
          trailingTrivia: [],
        },
      ],
      trailingTrivia: [],
    };
    expect(JSON.parse(JSON.stringify(decl.toJSON()))).toEqual(expected);
  });

  it(`picks up the type fields only when we append withTypesArg: "typesOnly"`, () => {
    const decl = ImportDeclarationImpl.clone(structure, "typesOnly");
    const expected: ImportDeclarationStructure = {
      leadingTrivia: [],
      isTypeOnly: true,
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: "#stage_two/snapshot/source/exports.js",
      namedImports: [
        {
          leadingTrivia: [],
          isTypeOnly: false,
          kind: StructureKind.ImportSpecifier,
          name: "ClassDeclarationImpl",
          trailingTrivia: [],
        },
        {
          leadingTrivia: [],
          isTypeOnly: false,
          kind: StructureKind.ImportSpecifier,
          name: "MethodDeclarationImpl",
          trailingTrivia: [],
        },
      ],
      trailingTrivia: [],
    };
    expect(JSON.parse(JSON.stringify(decl.toJSON()))).toEqual(expected);
  });

  it(`picks up the non-type fields only when we append withTypesArg: "excludeTypes"`, () => {
    const decl = ImportDeclarationImpl.clone(structure, "excludeTypes");
    const expected: ImportDeclarationStructure = {
      leadingTrivia: [],
      defaultImport: "MyDefaultExports",
      isTypeOnly: false,
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: "#stage_two/snapshot/source/exports.js",
      namedImports: [
        {
          leadingTrivia: [],
          isTypeOnly: false,
          kind: StructureKind.ImportSpecifier,
          name: "ImportDeclarationImpl",
          trailingTrivia: [],
        },
        {
          leadingTrivia: [],
          isTypeOnly: false,
          kind: StructureKind.ImportSpecifier,
          name: "ImportSpecifierImpl",
          trailingTrivia: [],
        },
      ],
      trailingTrivia: [],
    };
    expect(JSON.parse(JSON.stringify(decl.toJSON()))).toEqual(expected);
  });
});
