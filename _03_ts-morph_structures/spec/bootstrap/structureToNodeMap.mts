import ts, {
  Node,
  StructureKind,
  Structures,
} from "ts-morph";
import {
  ModuleSourceDirectory,
  pathToModule,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import StructureKindToSyntaxKindMap from "../../source/generated/structureToSyntax.mjs";

import structureToNodeMap from "#ts-morph_structures/source/bootstrap/structureToNodeMap.mjs";

const TSC_CONFIG = {
  "compilerOptions": {
    "lib": ["es2022"],
    "module": ts.ModuleKind.ESNext,
    "target": ts.ScriptTarget.ESNext,
    "moduleResolution": ts.ModuleResolutionKind.NodeNext,
    "sourceMap": true,
    "declaration": true,
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
    const map = structureToNodeMap(sourceFile);
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

  checkMap("stage_utilities/DefaultMap.mts");
  checkMap("stage_utilities/PromiseTypes.mts");
  checkMap("stage_utilities/PropertyKeySorter.mts");
  checkMap("stage_utilities/WeakRefSet.mts");

  expect(Array.from(remainingKeys.entries())).toEqual([]);
});
