import ts, {
  Node,
  ProjectOptions,
  StructureKind,
  Structures,
  SyntaxKind,
} from "ts-morph";
import {
  ModuleSourceDirectory,
  pathToModule,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import StructureKindToSyntaxKindMap from "../../source/generated/structureToSyntax.mjs";

import structureToNodeMap from "#ts-morph_structures/source/bootstrap/structureToNodeMap.mjs";

const TSC_CONFIG: ProjectOptions = {
  "compilerOptions": {
    "lib": ["es2022"],
    "module": ts.ModuleKind.ESNext,
    "target": ts.ScriptTarget.ESNext,
    "moduleResolution": ts.ModuleResolutionKind.NodeNext,
    "sourceMap": false,
    "declaration": false,
  },
  skipAddingFilesFromTsConfig: true,
};

const project = new ts.Project(TSC_CONFIG);

const fixturesDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../../../fixtures"
};

xit("structureToNodeMap returns an accurate Map<Structure, Node>", () => {
  const remainingKeys = new Set<StructureKind>(StructureKindToSyntaxKindMap.keys());

  function checkMap(
    pathToModuleFile: string
  ): void
  {
    const sourceFile = project.addSourceFileAtPath(pathToModule(fixturesDir, pathToModuleFile));
    let map: ReadonlyMap<Structures, Node>;
    try {
      map = structureToNodeMap(sourceFile);
    }
    catch (ex) {
      console.log(pathToModuleFile);
      throw ex;
    }
    map.forEach((node, structure) => {
      expect(Node.hasStructure(node)).toBe(true);
      if (Node.hasStructure(node)) {
        expect<Structures>(node.getStructure()).withContext(
          `at ${pathToModuleFile}#${sourceFile.getLineAndColumnAtPos(node.getPos()).line}`
        ).toEqual(structure);
      }
      remainingKeys.delete(structure.kind);
    });
  }

  checkMap("ecma_references/classDecorators.mts");
  checkMap("stage_utilities/assert.mts");
  checkMap("stage_utilities/DefaultMap.mts");
  checkMap("stage_utilities/PromiseTypes.mts");
  checkMap("stage_utilities/PropertyKeySorter.mts");
  checkMap("stage_utilities/WeakRefSet.mts");
  checkMap("grab-bag.mts");

  let remainingKinds = Array.from(remainingKeys.keys()).map(
    (kind) => StructureKind[kind] + ": " + SyntaxKind[StructureKindToSyntaxKindMap.get(kind)!]
  );
  remainingKinds = remainingKinds.filter(kind => !kind.startsWith("Jsx"));
  remainingKinds.sort();

  expect(remainingKinds).toEqual([]);
});
