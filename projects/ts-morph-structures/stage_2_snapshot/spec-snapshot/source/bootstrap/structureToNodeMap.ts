// #region preamble
import fs from "fs/promises";
import path from "path";

import {
  type ConstructorDeclarationOverloadStructure,
  type ConstructorDeclarationStructure,
  type FunctionDeclarationOverloadStructure,
  type FunctionDeclarationStructure,
  type MethodDeclarationOverloadStructure,
  type MethodDeclarationStructure,
  ModuleKind,
  ModuleResolutionKind,
  Node,
  Project,
  ProjectOptions,
  ScriptTarget,
  StructureKind,
  type Structures,
  SyntaxKind,
} from "ts-morph";

import {
  ModuleSourceDirectory,
  pathToModule,
} from "#utilities/source/AsyncSpecModules.js";

import {
  PromiseAllParallel
} from "#utilities/source/PromiseTypes.js";

import {
  structureToNodeMap,
  structureImplToNodeMap,
} from "#stage_two/snapshot/source/bootstrap/structureToNodeMap.js";

import StructureKindToSyntaxKindMap from "#stage_two/snapshot/source/bootstrap/structureToSyntax.js";
import {
  fixFunctionOverloads,
} from "#stage_two/snapshot/source/bootstrap/adjustForOverloads.js";

async function getSupportedKindSet(): Promise<Set<StructureKind>> {
  const stageDir: ModuleSourceDirectory = {
    pathToDirectory: "#stage_two",
    isAbsolutePath: true
  };

  const pathToStructuresDir = pathToModule(stageDir, "snapshot/source/structures/standard");

  const moduleList = (await fs.readdir(pathToStructuresDir)).filter(
    fileName => fileName.endsWith("Impl.ts")
  );

  const StructureKindRE = /StructureKind\.([A-Za-z]+)/g;

  const KindList: StructureKind[] = await PromiseAllParallel(moduleList, async leafName => {
    const fileToRead = path.join(pathToStructuresDir, leafName);
    const contents = await fs.readFile(fileToRead, { encoding: "utf-8" });
    const match = contents.match(StructureKindRE)!
    return StructureKind[match[0].replace("StructureKind.", "") as keyof typeof StructureKind];
  });

  return new Set(KindList);
}
const remainingKeysBase = await getSupportedKindSet();

// no syntax kind for this, so unsupported
remainingKeysBase.delete(StructureKind.JSDocTag);

const TSC_CONFIG: ProjectOptions = {
  "compilerOptions": {
    "lib": ["es2022"],
    "module": ModuleKind.ESNext,
    "target": ScriptTarget.ESNext,
    "moduleResolution": ModuleResolutionKind.NodeNext,
    "sourceMap": false,
    "declaration": false,
  },
  skipAddingFilesFromTsConfig: true,
};

const project = new Project(TSC_CONFIG);

const fixturesDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../../../../fixtures"
};
// #endregion preamble

it("structureToNodeMap returns an accurate Map<Structure, Node>", () => {
  const remainingKeys = new Set(remainingKeysBase);
  function checkMap(
    relativePathToModuleFile: string,
    hashNeedle?: string
  ): void
  {
    const pathToModuleFile = pathToModule(fixturesDir, relativePathToModuleFile);
    project.addSourceFileAtPath(pathToModuleFile);
    const sourceFile = project.getSourceFileOrThrow(pathToModuleFile);

    let map: ReadonlyMap<Structures, Node>;
    try {
      map = structureToNodeMap(sourceFile, false, hashNeedle);
    }
    catch (ex) {
      console.log(pathToModuleFile);
      throw ex;
    }

    map.forEach((node: Node, structure: Structures) => {
      expect(Node.hasStructure(node)).withContext(relativePathToModuleFile).toBe(true);
      if (Node.hasStructure(node) === false)
        return;

      /* This is an expensive check (O(n^2)), but it's important.  I am checking that _every_ node with a
      getStructure() method returns an equivalent (or in the case of overloads, nearly so) structure
      to what we get from the structure-to-node map.

      Note I am excluding overloaded functions inside functions.  That's just not fair for this test.
      */
      const expectedStructure = node.getStructure();
      switch (structure.kind) {
        case StructureKind.Constructor: {
          expect(expectedStructure.kind).withContext(
            `with kind ${StructureKind[structure.kind]} at ${pathToModuleFile}#${sourceFile.getLineAndColumnAtPos(node.getPos()).line}`
          ).toBe(StructureKind.Constructor);

          if ((expectedStructure as ConstructorDeclarationStructure).overloads === undefined)
            delete structure.overloads;
          break;
        }

        case StructureKind.ConstructorOverload: {
          if (expectedStructure.kind !== StructureKind.ConstructorOverload)
            expect(expectedStructure.kind).withContext(
              `with kind ${StructureKind[structure.kind]} at ${pathToModuleFile}#${sourceFile.getLineAndColumnAtPos(node.getPos()).line}`
            ).toBe(StructureKind.Constructor);

          const expectedOverload = (expectedStructure as ConstructorDeclarationOverloadStructure);
          expectedOverload.kind = StructureKind.ConstructorOverload;
          Reflect.deleteProperty(expectedOverload, "overloads");
          Reflect.deleteProperty(expectedOverload, "statements");
          break;
        }

        case StructureKind.Function: {
          expect(expectedStructure.kind).withContext(
            `with kind ${StructureKind[structure.kind]} at ${pathToModuleFile}#${sourceFile.getLineAndColumnAtPos(node.getPos()).line}`
          ).toBe(StructureKind.Function);

          if ((expectedStructure as FunctionDeclarationStructure).overloads === undefined)
              delete structure.overloads;
          break;
        }

        case StructureKind.FunctionOverload: {
          if (expectedStructure.kind !== StructureKind.FunctionOverload)
            expect(expectedStructure.kind).withContext(
              `with kind ${StructureKind[structure.kind]} at ${pathToModuleFile}#${sourceFile.getLineAndColumnAtPos(node.getPos()).line}`
            ).toBe(StructureKind.Function);

          const expectedOverload = (expectedStructure as FunctionDeclarationOverloadStructure);
          expectedOverload.kind = StructureKind.FunctionOverload;
          Reflect.deleteProperty(expectedOverload, "name");
          Reflect.deleteProperty(expectedOverload, "overloads");
          Reflect.deleteProperty(expectedOverload, "statements");

          break;
        }

        case StructureKind.Method: {
          expect(expectedStructure.kind).withContext(
            `with kind ${StructureKind[structure.kind]} at ${pathToModuleFile}#${sourceFile.getLineAndColumnAtPos(node.getPos()).line}`
          ).toBe(StructureKind.Method);

          if ((expectedStructure as MethodDeclarationStructure).overloads === undefined)
            delete structure.overloads;
          break;
        }

        case StructureKind.MethodOverload: {
          if (expectedStructure.kind !== StructureKind.MethodOverload)
            expect(expectedStructure.kind).withContext(
              `with kind ${StructureKind[structure.kind]} at ${pathToModuleFile}#${sourceFile.getLineAndColumnAtPos(node.getPos()).line}`
            ).toBe(StructureKind.Method);

          const expectedOverload = (expectedStructure as MethodDeclarationOverloadStructure);
          expectedOverload.kind = StructureKind.MethodOverload;
          Reflect.deleteProperty(expectedOverload, "decorators");
          Reflect.deleteProperty(expectedOverload, "name");
          Reflect.deleteProperty(expectedOverload, "overloads");
          Reflect.deleteProperty(expectedOverload, "statements");
          break;
        }

        default:
          fixFunctionOverloads(expectedStructure);
      }

      expect<Structures>(structure)
        .withContext(
          `with kind ${StructureKind[structure.kind]} at ${pathToModuleFile}#${sourceFile.getLineAndColumnAtPos(node.getPos()).line}`
        ).toEqual(expectedStructure);

      remainingKeys.delete(structure.kind);
    });

    const mapWithTypes = structureImplToNodeMap(sourceFile);
    expect(mapWithTypes.size).withContext(relativePathToModuleFile).toBe(map.size);
  }

  checkMap("ecma_references/classDecorators.ts");
  checkMap("ecma_references/NumberStringClass.ts");
  checkMap("stage_utilities/assert.ts");
  checkMap("stage_utilities/DefaultMap.ts");
  checkMap("stage_utilities/PromiseTypes.ts");
  checkMap("stage_utilities/PropertyKeySorter.ts");
  checkMap("stage_utilities/WeakRefSet.ts");
  checkMap("types/declaredOverloads.d.ts");
  checkMap("exportPromise.ts");
  checkMap("grab-bag.ts");

  // Unreachable structure kinds via sourceFile.getStructure(), as of ts-morph 22.0.0
  {
    expect(remainingKeys.has(StructureKind.PropertyAssignment)).toBe(true);
    remainingKeys.delete(StructureKind.PropertyAssignment);

    expect(remainingKeys.has(StructureKind.SpreadAssignment)).toBe(true);
    remainingKeys.delete(StructureKind.SpreadAssignment);

    expect(remainingKeys.has(StructureKind.ShorthandPropertyAssignment)).toBe(true);
    remainingKeys.delete(StructureKind.ShorthandPropertyAssignment);
  }

  /* ImportAttribute shows up as AssertEntry in the StructureKind enum due to a conflict
     and is still experimental, per https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
     For that reason, I'm not going to support it right now (2024-01-12).
  */
  expect(remainingKeys.has(StructureKind.ImportAttribute)).withContext("ImportAttibute").toBe(true);
  remainingKeys.delete(StructureKind.ImportAttribute);

  let remainingKinds = Array.from(remainingKeys.keys()).map(
    (kind) => StructureKind[kind] + ": " + SyntaxKind[StructureKindToSyntaxKindMap.get(kind)!]
  );
  remainingKinds = remainingKinds.filter(kind => !kind.startsWith("Jsx"));
  remainingKinds.sort();

  expect(remainingKinds).withContext("we didn't find examples of these kinds in the fixtures").toEqual([]);
});
