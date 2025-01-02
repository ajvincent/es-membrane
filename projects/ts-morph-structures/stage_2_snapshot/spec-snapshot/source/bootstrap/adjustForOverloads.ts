import {
  type ConstructorDeclaration,
  type FunctionDeclaration,
  type MethodDeclaration,
  ModuleKind,
  ModuleDeclarationKind,
  ModuleResolutionKind,
  Project,
  type ProjectOptions,
  ScriptTarget,
  type SourceFile,
  type SourceFileStructure,
  StructureKind,
  type StatementStructures,
  SyntaxKind,
  type WriterFunction,
} from "ts-morph";

import {
  fixFunctionOverloads,
  getOverloadIndex,
} from "#stage_two/snapshot/source/bootstrap/adjustForOverloads.js";

type OverloadableDeclaration = ConstructorDeclaration | FunctionDeclaration | MethodDeclaration;

describe("adjustForOverloads:", () => {
  let sourceFile: SourceFile;

  beforeAll(() => {
    const TSC_CONFIG: ProjectOptions = {
      "compilerOptions": {
        "lib": ["es2022"],
        "module": ModuleKind.ESNext,
        "target": ScriptTarget.ESNext,
        "moduleResolution": ModuleResolutionKind.NodeNext,
        "noEmit": true,
        "declaration": true,
      },
      skipAddingFilesFromTsConfig: true,
      useInMemoryFileSystem: true,
    };

    const project = new Project(TSC_CONFIG);
    sourceFile = project.createSourceFile("file.ts");
  });

  afterEach(() => {
    sourceFile.removeStatements([0, sourceFile.getStatements().length]);
  });

  describe("fixFunctionOverloads works with", () => {
    function compareSourceToStructure(
      source: string,
      expected: StatementStructures[]
    ): void
    {
      sourceFile.addStatements(source.trim());
      const structure: SourceFileStructure = sourceFile.getStructure();
      fixFunctionOverloads(structure);

      expect<
        (string | WriterFunction | StatementStructures)[] | string | WriterFunction
      >(structure.statements!).toEqual(expected);

      sourceFile.set(structure);

      const actualSourceTrimmed   = sourceFile.print().replace(/\n/g, " ").replace(/\s\s+/gm, " ").trim();
      const expectedSourceTrimmed = source.replace(/\n/g, " ").replace(/\s\s+/gm, " ").trim();

      if (actualSourceTrimmed !== expectedSourceTrimmed) {
        console.error("\n");
        console.error(actualSourceTrimmed);
        console.error(expectedSourceTrimmed);
        const minLength = Math.min(actualSourceTrimmed.length, expectedSourceTrimmed.length);
        let matchIndex: number;
        for (matchIndex = 0; matchIndex < minLength; matchIndex++) {
          if (actualSourceTrimmed[matchIndex] !== expectedSourceTrimmed[matchIndex])
            break;
        }
        console.error(" ".repeat(matchIndex) + "^");
      }

      expect(actualSourceTrimmed).toEqual(expectedSourceTrimmed);
    }

    it("functions having no overloads", () => {
      compareSourceToStructure(
        `
function foo(x: number): void {
  void (x);
}
        `,
        [
          {
            "name": "foo",
            "statements": [
              "void (x);"
            ],
            "parameters": [
              {
                "name": "x",
                "type": "number",
                "isReadonly": false,
                "decorators": [],
                "hasQuestionToken": false,
                "hasOverrideKeyword": false,
                "kind": StructureKind.Parameter,
                "isRestParameter": false,
                "initializer": undefined,
                "scope": undefined,
              }
            ],
            "returnType": "void",
            "typeParameters": [],
            "docs": [],
            "isExported": false,
            "isDefaultExport": false,
            "hasDeclareKeyword": false,
            "isGenerator": false,
            "isAsync": false,
            "kind": StructureKind.Function,
            "overloads": []
          }
        ],
      );
    });

    it("functions having an overload", () => {
      compareSourceToStructure(
        `
function foo(x: number, y: string): void;
function foo(x: number): void {
  void (x);
}
        `,
        [
          {
            "name": "foo",
            "statements": [
              "void (x);"
            ],
            "parameters": [
              {
                "name": "x",
                "type": "number",
                "isReadonly": false,
                "decorators": [],
                "hasQuestionToken": false,
                "hasOverrideKeyword": false,
                "kind": StructureKind.Parameter,
                "isRestParameter": false,
                "initializer": undefined,
                "scope": undefined,
              }
            ],
            "returnType": "void",
            "typeParameters": [],
            "docs": [],
            "isExported": false,
            "isDefaultExport": false,
            "hasDeclareKeyword": false,
            "isGenerator": false,
            "isAsync": false,
            "kind": StructureKind.Function,
            "overloads": [
              {
                "isExported": false,
                "isDefaultExport": false,
                "typeParameters": [],
                "docs": [],
                "hasDeclareKeyword": false,
                "parameters": [
                  {
                    "name": "x",
                    "type": "number",
                    "isReadonly": false,
                    "decorators": [],
                    "hasQuestionToken": false,
                    "hasOverrideKeyword": false,
                    "kind": StructureKind.Parameter,
                    "isRestParameter": false,
                    "initializer": undefined,
                    "scope": undefined,
                  },
                  {
                    "name": "y",
                    "type": "string",
                    "isReadonly": false,
                    "decorators": [],
                    "hasQuestionToken": false,
                    "hasOverrideKeyword": false,
                    "kind": StructureKind.Parameter,
                    "isRestParameter": false,
                    "initializer": undefined,
                    "scope": undefined,
                  }
                ],
                "returnType": "void",
                "isGenerator": false,
                "isAsync": false,
                "kind": StructureKind.FunctionOverload
              }
            ]
          }
        ]
      );
    });

    it("classes with constructor overloads", () => {
      compareSourceToStructure(
        `
class Bar {
  constructor(x: number, y: string, z: boolean);
  constructor(x: number, y: string);
  constructor(x: number)
  {
    void (x);
    void (y);
    void (z);
  }
}
        `,
        [
          {
            "kind": StructureKind.Class,
            "name": "Bar",
            "ctors": [
              {
                "kind": StructureKind.Constructor,
                "overloads": [
                  {
                    "kind": StructureKind.ConstructorOverload,
                    "parameters": [
                      {
                        "name": "x",
                        "type": "number",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                      {
                        "name": "y",
                        "type": "string",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                      {
                        "name": "z",
                        "type": "boolean",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                    ],
                    "docs": [],
                    "returnType": undefined,
                    "scope": undefined,
                    "typeParameters": [],
                  },
                  {
                    "kind": StructureKind.ConstructorOverload,
                    "parameters": [
                      {
                        "name": "x",
                        "type": "number",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                      {
                        "name": "y",
                        "type": "string",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                    ],
                    "docs": [],
                    "returnType": undefined,
                    "scope": undefined,
                    "typeParameters": [],
                  },
                ],
                "parameters": [
                  {
                    "name": "x",
                    "type": "number",
                    "isReadonly": false,
                    "decorators": [],
                    "hasQuestionToken": false,
                    "hasOverrideKeyword": false,
                    "kind": StructureKind.Parameter,
                    "isRestParameter": false,
                    "initializer": undefined,
                    "scope": undefined,
                  },
                ],
                "statements": [
                  "void (x);",
                  "void (y);",
                  "void (z);"
                ],
                "docs": [],
                "typeParameters": [],
                "scope": undefined,
                "returnType": undefined,
              }
            ],
            "decorators": [],
            typeParameters: [],
            docs: [],
            isAbstract: false,
            isExported: false,
            implements: [],
            isDefaultExport: false,
            hasDeclareKeyword: false,
            staticBlocks: [],
            methods: [],
            properties: [],
            extends: undefined,
            getAccessors: [],
            setAccessors: [],
          }
        ]
      )
    });

    it("classes with method overloads (static and non-static)", () => {
      compareSourceToStructure(
        `
class Bar {
  static foo(x: number, y: string): boolean;
  static foo(x: number): boolean
  {
    return Boolean(x);
  }

  foo(x: number, y: string, z: boolean): boolean;
  foo(x: number, y: string): boolean;
  foo(x: number): boolean
  {
    return Boolean(x);
  }
}
        `,
        [
          {
            "kind": StructureKind.Class,
            "docs": [],
            "decorators": [],
            "isAbstract": false,
            "hasDeclareKeyword": false,
            "isDefaultExport": false,
            "isExported": false,
            "name": "Bar",
            "typeParameters": [],
            "extends": undefined,
            "implements": [],

            "ctors": [],
            "properties": [],
            "getAccessors": [],
            "setAccessors": [],
            "staticBlocks": [],

            "methods": [
              {
                "kind": StructureKind.Method,
                "name": "foo",
                "isStatic": true,
                "typeParameters": [],
                "parameters": [
                  {
                    "name": "x",
                    "type": "number",
                    "isReadonly": false,
                    "decorators": [],
                    "hasQuestionToken": false,
                    "hasOverrideKeyword": false,
                    "kind": StructureKind.Parameter,
                    "isRestParameter": false,
                    "initializer": undefined,
                    "scope": undefined,
                  },
                ],
                "returnType": "boolean",
                "overloads": [
                  {
                    "kind": StructureKind.MethodOverload,
                    "isStatic": true,
                    "typeParameters": [],
                    "parameters": [
                      {
                        "name": "x",
                        "type": "number",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                      {
                        "name": "y",
                        "type": "string",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                    ],
                    "returnType": "boolean",
                    "docs": [],
                    "hasOverrideKeyword": false,
                    "hasQuestionToken": false,
                    "isAbstract": false,
                    "isAsync": false,
                    "isGenerator": false,
                    "scope": undefined,
                  },
                ],
                "decorators": [],
                "docs": [],
                "hasOverrideKeyword": false,
                "hasQuestionToken": false,
                "isAbstract": false,
                "isAsync": false,
                "isGenerator": false,
                "scope": undefined,
                "statements": [
                  "return Boolean(x);"
                ]
              },
              {
                "kind": StructureKind.Method,
                "name": "foo",
                "isStatic": false,
                "typeParameters": [],
                "parameters": [
                  {
                    "name": "x",
                    "type": "number",
                    "isReadonly": false,
                    "decorators": [],
                    "hasQuestionToken": false,
                    "hasOverrideKeyword": false,
                    "kind": StructureKind.Parameter,
                    "isRestParameter": false,
                    "initializer": undefined,
                    "scope": undefined,
                  },
                ],
                "returnType": "boolean",
                "overloads": [
                  {
                    "kind": StructureKind.MethodOverload,
                    "isStatic": false,
                    "isAsync": false,
                    "isGenerator": false,
                    "typeParameters": [],
                    "parameters": [
                      {
                        "name": "x",
                        "type": "number",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                      {
                        "name": "y",
                        "type": "string",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                      {
                        "name": "z",
                        "type": "boolean",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                    ],
                    "returnType": "boolean",
                    "docs": [],
                    "hasOverrideKeyword": false,
                    "hasQuestionToken": false,
                    "isAbstract": false,
                    "scope": undefined,
                  },
                  {
                    "kind": StructureKind.MethodOverload,
                    "isStatic": false,
                    "isAsync": false,
                    "isGenerator": false,
                    "typeParameters": [],
                    "parameters": [
                      {
                        "name": "x",
                        "type": "number",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                      {
                        "name": "y",
                        "type": "string",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                    ],
                    "returnType": "boolean",
                    "docs": [],
                    "hasOverrideKeyword": false,
                    "hasQuestionToken": false,
                    "isAbstract": false,
                    "scope": undefined,
                  },
                ],
                "decorators": [],
                "docs": [],
                "hasOverrideKeyword": false,
                "hasQuestionToken": false,
                "isAbstract": false,
                "isAsync": false,
                "isGenerator": false,
                "scope": undefined,
                "statements": [
                  "return Boolean(x);"
                ]
              }
            ]
          },
        ],
      );
    });

    it("declared classes with overloaded constructors (no body)", () => {
      compareSourceToStructure(
        `
declare class Base<NType extends number> {
  constructor(x: number, y: string, z: boolean);
  constructor(x: number, y: string);
  constructor(x: NType);
}
        `,
        [
          {
            "kind": StructureKind.Class,
            "name": "Base",
            "ctors": [
              {
                "kind": StructureKind.Constructor,
                "overloads": [
                  {
                    "kind": StructureKind.ConstructorOverload,
                    "parameters": [
                      {
                        "name": "x",
                        "type": "number",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                      {
                        "name": "y",
                        "type": "string",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                      {
                        "name": "z",
                        "type": "boolean",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                    ],
                    "docs": [],
                    "returnType": undefined,
                    "scope": undefined,
                    "typeParameters": [],
                  },
                  {
                    "kind": StructureKind.ConstructorOverload,
                    "parameters": [
                      {
                        "name": "x",
                        "type": "number",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                      {
                        "name": "y",
                        "type": "string",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                    ],
                    "docs": [],
                    "returnType": undefined,
                    "scope": undefined,
                    "typeParameters": [],
                  },
                ],
                "parameters": [
                  {
                    "name": "x",
                    "type": "NType",
                    "isReadonly": false,
                    "decorators": [],
                    "hasQuestionToken": false,
                    "hasOverrideKeyword": false,
                    "kind": StructureKind.Parameter,
                    "isRestParameter": false,
                    "initializer": undefined,
                    "scope": undefined,
                  },
                ],
                "statements": undefined,
                "docs": [],
                "typeParameters": [],
                "scope": undefined,
                "returnType": undefined,
              }
            ],
            "decorators": [],
            typeParameters: [
              {
                kind: StructureKind.TypeParameter,
                name: "NType",
                constraint: "number",
                isConst: false,
                default: undefined,
                variance: 0,
              }
            ],
            docs: [],
            isAbstract: false,
            isExported: false,
            implements: [],
            isDefaultExport: false,
            hasDeclareKeyword: true,
            staticBlocks: [],
            methods: [],
            properties: [],
            extends: undefined,
            getAccessors: [],
            setAccessors: [],
          }
        ]
      );
    });

    it("declared classes with overloaded methods (no body)", () => {
      compareSourceToStructure(
        `
declare class Base<NType extends number> {
  static helloWorld(x: number, y: string): void;
  static helloWorld(x: NType): void;
  helloWorld(x: number, y: string): void;
  helloWorld(x: NType): void;
}
        `,
        [
          {
            "kind": StructureKind.Class,
            "docs": [],
            "decorators": [],
            "isAbstract": false,
            "hasDeclareKeyword": true,
            "isDefaultExport": false,
            "isExported": false,
            "name": "Base",
            "typeParameters": [
              {
                kind: StructureKind.TypeParameter,
                name: "NType",
                constraint: "number",
                isConst: false,
                default: undefined,
                variance: 0,
              }
            ],
            "extends": undefined,
            "implements": [],

            "ctors": [],
            "properties": [],
            "getAccessors": [],
            "setAccessors": [],
            "staticBlocks": [],

            "methods": [
              {
                "kind": StructureKind.Method,
                "name": "helloWorld",
                "isStatic": true,
                "typeParameters": [],
                "parameters": [
                  {
                    "name": "x",
                    "type": "NType",
                    "isReadonly": false,
                    "decorators": [],
                    "hasQuestionToken": false,
                    "hasOverrideKeyword": false,
                    "kind": StructureKind.Parameter,
                    "isRestParameter": false,
                    "initializer": undefined,
                    "scope": undefined,
                  },
                ],
                "returnType": "void",
                "overloads": [
                  {
                    "kind": StructureKind.MethodOverload,
                    "isStatic": true,
                    "typeParameters": [],
                    "parameters": [
                      {
                        "name": "x",
                        "type": "number",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                      {
                        "name": "y",
                        "type": "string",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                    ],
                    "returnType": "void",
                    "docs": [],
                    "hasOverrideKeyword": false,
                    "hasQuestionToken": false,
                    "isAbstract": false,
                    "isAsync": false,
                    "isGenerator": false,
                    "scope": undefined,
                  },
                ],
                "decorators": [],
                "docs": [],
                "hasOverrideKeyword": false,
                "hasQuestionToken": false,
                "isAbstract": false,
                "isAsync": false,
                "isGenerator": false,
                "scope": undefined,
                "statements": undefined,
              },
              {
                "kind": StructureKind.Method,
                "name": "helloWorld",
                "isStatic": false,
                "overloads": [
                  {
                    "kind": StructureKind.MethodOverload,
                    "isStatic": false,
                    "isAsync": false,
                    "isGenerator": false,
                    "typeParameters": [],
                    "parameters": [
                      {
                        "name": "x",
                        "type": "number",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                      {
                        "name": "y",
                        "type": "string",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                    ],
                    "returnType": "void",
                    "docs": [],
                    "hasOverrideKeyword": false,
                    "hasQuestionToken": false,
                    "isAbstract": false,
                    "scope": undefined,
                  },
                ],
                "typeParameters": [],
                "parameters": [
                  {
                    "name": "x",
                    "type": "NType",
                    "isReadonly": false,
                    "decorators": [],
                    "hasQuestionToken": false,
                    "hasOverrideKeyword": false,
                    "kind": StructureKind.Parameter,
                    "isRestParameter": false,
                    "initializer": undefined,
                    "scope": undefined,
                  },
                ],
                "returnType": "void",
                "decorators": [],
                "docs": [],
                "hasOverrideKeyword": false,
                "hasQuestionToken": false,
                "isAbstract": false,
                "isAsync": false,
                "isGenerator": false,
                "scope": undefined,
                "statements": undefined
              }
            ]
          },
        ],
      );
    });

    it("declared functions (no body)", () => {
      compareSourceToStructure(
        `
declare function foo(x: number, y: string): void;
declare function foo(x: number): void;
        `,
        [
          {
            "name": "foo",
            "statements": undefined,
            "parameters": [
              {
                "name": "x",
                "type": "number",
                "isReadonly": false,
                "decorators": [],
                "hasQuestionToken": false,
                "hasOverrideKeyword": false,
                "kind": StructureKind.Parameter,
                "isRestParameter": false,
                "initializer": undefined,
                "scope": undefined,
              }
            ],
            "returnType": "void",
            "typeParameters": [],
            "docs": [],
            "isExported": false,
            "isDefaultExport": false,
            "hasDeclareKeyword": true,
            "isGenerator": false,
            "isAsync": false,
            "kind": StructureKind.Function,
            "overloads": [
              {
                "isExported": false,
                "isDefaultExport": false,
                "typeParameters": [],
                "docs": [],
                "hasDeclareKeyword": true,
                "parameters": [
                  {
                    "name": "x",
                    "type": "number",
                    "isReadonly": false,
                    "decorators": [],
                    "hasQuestionToken": false,
                    "hasOverrideKeyword": false,
                    "kind": StructureKind.Parameter,
                    "isRestParameter": false,
                    "initializer": undefined,
                    "scope": undefined,
                  },
                  {
                    "name": "y",
                    "type": "string",
                    "isReadonly": false,
                    "decorators": [],
                    "hasQuestionToken": false,
                    "hasOverrideKeyword": false,
                    "kind": StructureKind.Parameter,
                    "isRestParameter": false,
                    "initializer": undefined,
                    "scope": undefined,
                  }
                ],
                "returnType": "void",
                "isGenerator": false,
                "isAsync": false,
                "kind": StructureKind.FunctionOverload
              }
            ]
          }
        ]
      );
    });

    it("declared namespace containing functions (no body)", () => {
      compareSourceToStructure(
        `
declare namespace NamespaceTest {
  function foo(x: number, y: string): void;
  function foo(x: number): void;
}
        `,
        [
          {
            kind: StructureKind.Module,
            name: "NamespaceTest",
            hasDeclareKeyword: true,
            statements: [
              {
                "name": "foo",
                "statements": undefined,
                "parameters": [
                  {
                    "name": "x",
                    "type": "number",
                    "isReadonly": false,
                    "decorators": [],
                    "hasQuestionToken": false,
                    "hasOverrideKeyword": false,
                    "kind": StructureKind.Parameter,
                    "isRestParameter": false,
                    "initializer": undefined,
                    "scope": undefined,
                  }
                ],
                "returnType": "void",
                "typeParameters": [],
                "docs": [],
                "isExported": false,
                "isDefaultExport": false,
                "hasDeclareKeyword": false,
                "isGenerator": false,
                "isAsync": false,
                "kind": StructureKind.Function,
                "overloads": [
                  {
                    "isExported": false,
                    "isDefaultExport": false,
                    "typeParameters": [],
                    "docs": [],
                    "hasDeclareKeyword": false,
                    "parameters": [
                      {
                        "name": "x",
                        "type": "number",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                      {
                        "name": "y",
                        "type": "string",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      }
                    ],
                    "returnType": "void",
                    "isGenerator": false,
                    "isAsync": false,
                    "kind": StructureKind.FunctionOverload
                  }
                ]
              }
            ],
            isDefaultExport: false,
            isExported: false,
            docs: [],
            declarationKind: ModuleDeclarationKind.Namespace,
          }
        ]
      );
    });

    it("declared namespace containing a class (no body)", () => {
      compareSourceToStructure(
        `
declare namespace NamespaceTest {
  class Base<NType extends number> {
    static helloWorld(x: number, y: string): void;
    static helloWorld(x: NType): void;
    helloWorld(x: number, y: string): void;
    helloWorld(x: NType): void;
  }
}
        `,
        [
          {
            kind: StructureKind.Module,
            name: "NamespaceTest",
            hasDeclareKeyword: true,
            statements: [
              {
                "kind": StructureKind.Class,
                "docs": [],
                "decorators": [],
                "isAbstract": false,
                "hasDeclareKeyword": false,
                "isDefaultExport": false,
                "isExported": false,
                "name": "Base",
                "typeParameters": [
                  {
                    kind: StructureKind.TypeParameter,
                    name: "NType",
                    constraint: "number",
                    isConst: false,
                    default: undefined,
                    variance: 0,
                  }
                ],
                "extends": undefined,
                "implements": [],
      
                "ctors": [],
                "properties": [],
                "getAccessors": [],
                "setAccessors": [],
                "staticBlocks": [],

                "methods": [
                  {
                    "kind": StructureKind.Method,
                    "name": "helloWorld",
                    "isStatic": true,
                    "typeParameters": [],
                    "parameters": [
                      {
                        "name": "x",
                        "type": "NType",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                    ],
                    "returnType": "void",
                    "overloads": [
                      {
                        "kind": StructureKind.MethodOverload,
                        "isStatic": true,
                        "typeParameters": [],
                        "parameters": [
                          {
                            "name": "x",
                            "type": "number",
                            "isReadonly": false,
                            "decorators": [],
                            "hasQuestionToken": false,
                            "hasOverrideKeyword": false,
                            "kind": StructureKind.Parameter,
                            "isRestParameter": false,
                            "initializer": undefined,
                            "scope": undefined,
                          },
                          {
                            "name": "y",
                            "type": "string",
                            "isReadonly": false,
                            "decorators": [],
                            "hasQuestionToken": false,
                            "hasOverrideKeyword": false,
                            "kind": StructureKind.Parameter,
                            "isRestParameter": false,
                            "initializer": undefined,
                            "scope": undefined,
                          },
                        ],
                        "returnType": "void",
                        "docs": [],
                        "hasOverrideKeyword": false,
                        "hasQuestionToken": false,
                        "isAbstract": false,
                        "isAsync": false,
                        "isGenerator": false,
                        "scope": undefined,
                      },
                    ],
                    "decorators": [],
                    "docs": [],
                    "hasOverrideKeyword": false,
                    "hasQuestionToken": false,
                    "isAbstract": false,
                    "isAsync": false,
                    "isGenerator": false,
                    "scope": undefined,
                    "statements": undefined,
                  },
                  {
                    "kind": StructureKind.Method,
                    "name": "helloWorld",
                    "isStatic": false,
                    "overloads": [
                      {
                        "kind": StructureKind.MethodOverload,
                        "isStatic": false,
                        "isAsync": false,
                        "isGenerator": false,
                        "typeParameters": [],
                        "parameters": [
                          {
                            "name": "x",
                            "type": "number",
                            "isReadonly": false,
                            "decorators": [],
                            "hasQuestionToken": false,
                            "hasOverrideKeyword": false,
                            "kind": StructureKind.Parameter,
                            "isRestParameter": false,
                            "initializer": undefined,
                            "scope": undefined,
                          },
                          {
                            "name": "y",
                            "type": "string",
                            "isReadonly": false,
                            "decorators": [],
                            "hasQuestionToken": false,
                            "hasOverrideKeyword": false,
                            "kind": StructureKind.Parameter,
                            "isRestParameter": false,
                            "initializer": undefined,
                            "scope": undefined,
                          },
                        ],
                        "returnType": "void",
                        "docs": [],
                        "hasOverrideKeyword": false,
                        "hasQuestionToken": false,
                        "isAbstract": false,
                        "scope": undefined,
                      },
                    ],
                    "typeParameters": [],
                    "parameters": [
                      {
                        "name": "x",
                        "type": "NType",
                        "isReadonly": false,
                        "decorators": [],
                        "hasQuestionToken": false,
                        "hasOverrideKeyword": false,
                        "kind": StructureKind.Parameter,
                        "isRestParameter": false,
                        "initializer": undefined,
                        "scope": undefined,
                      },
                    ],
                    "returnType": "void",
                    "decorators": [],
                    "docs": [],
                    "hasOverrideKeyword": false,
                    "hasQuestionToken": false,
                    "isAbstract": false,
                    "isAsync": false,
                    "isGenerator": false,
                    "scope": undefined,
                    "statements": undefined,
                  }
                ]
              },
            ],
            isDefaultExport: false,
            isExported: false,
            docs: [],
            declarationKind: ModuleDeclarationKind.Namespace,
          }
        ]
      )
    });
  });

  describe("getOverloadIndex works with", () => {
    function getOverloadIndices<
      NodeType extends OverloadableDeclaration
    >
    (
      source: string,
      nodeGetter: (sourceFile: SourceFile) => NodeType[]
    ): number[]
    {
      sourceFile.addStatements(source);
      const nodes: NodeType[] = nodeGetter(sourceFile);
      return nodes.map(getOverloadIndex<NodeType>);
    }

    it("functions", () => {
      const indices = getOverloadIndices<FunctionDeclaration>(
        `
function foo(x: number, y: string, z: boolean): void
function foo(x: number, y: string): void
function foo(x: number): void {
  void(x);
}

function bar(x: number, y: string): void
function bar(x: number): void {
  void(x);
}

function baz(x: number): void {
  void(x);
}
        `,
        sourceFile => sourceFile.getChildrenOfKind(SyntaxKind.FunctionDeclaration)
      );

      expect(indices).toEqual([0, 1, -1, 0, -1, -1]);
    });

    it("declared functions", () => {
      const indices = getOverloadIndices<FunctionDeclaration>(
        `
declare function foo(x: number, y: string, z: boolean): void
declare function foo(x: number, y: string): void
declare function foo(x: number): void;

declare function bar(x: number, y: string): void;
declare function bar(x: number): void;

declare function baz(x: number): void;
        `,
        sourceFile => sourceFile.getChildrenOfKind(SyntaxKind.FunctionDeclaration)
      );

      expect(indices).toEqual([0, 1, -1, 0, -1, -1]);
    });

    it("classes with constructor overloads", () => {
      const indices = getOverloadIndices<ConstructorDeclaration>(
        `
class Bar {
  constructor(x: number, y: string, z: boolean)
  constructor(x: number, y: string)
  constructor(x: number)
  {
    void(x);
  }
}
        `,
        sourceFile => sourceFile.getClassOrThrow("Bar").getChildrenOfKind(SyntaxKind.Constructor)
      );
      expect(indices).toEqual([0, 1, -1]);
    });

    it("declared classes with overloaded constructors (no body)", () => {
      const indices = getOverloadIndices<ConstructorDeclaration>(
        `
declare class Bar<NType extends number> {
  constructor(x: number, y: string, z: boolean);
  constructor(x: number, y: string);
  constructor(x: NType);
}
        `,
        sourceFile => sourceFile.getClassOrThrow("Bar").getChildrenOfKind(SyntaxKind.Constructor)
      );
      expect(indices).toEqual([0, 1, -1]);
    });

    it("classes with method overloads (static and non-static)", () => {
      const indices = getOverloadIndices<MethodDeclaration>(
        `
class Bar {
  static foo(x: number, y: string): boolean
  static foo(x: number): boolean
  {
    return Boolean(x);
  }

  foo(x: number, y: string, z: boolean): boolean
  foo(x: number, y: string): boolean
  foo(x: number): boolean
  {
    return Boolean(x);
  }

  bar(x: number): void {
    void(x);
  }
}
        `,
        sourceFile => sourceFile.getClassOrThrow("Bar").getChildrenOfKind(SyntaxKind.MethodDeclaration)
      );
      expect(indices).toEqual([0, -1, 0, 1, -1, -1]);
    });

    it("declared classes with method overloads (static and non-static)", () => {
      const indices = getOverloadIndices<MethodDeclaration>(
        `
declare class Bar {
  static foo(x: number, y: string): boolean
  static foo(x: number): boolean

  foo(x: number, y: string, z: boolean): boolean
  foo(x: number, y: string): boolean
  foo(x: number): boolean

  bar(x: number): void
}
        `,
        sourceFile => sourceFile.getClassOrThrow("Bar").getChildrenOfKind(SyntaxKind.MethodDeclaration)
      );
      expect(indices).toEqual([0, -1, 0, 1, -1, -1]);
    });
  });
});
