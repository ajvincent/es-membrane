import fs from "fs/promises";
import path from "path";

import {
  ModuleKind,
  ModuleResolutionKind,
  Node,
  Project,
  ProjectOptions,
  ScriptTarget,
  StructureKind,
  Structures,
  SyntaxKind,
} from "ts-morph";

import {
  ModuleSourceDirectory,
  pathToModule,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import {
  PromiseAllParallel
} from "#ts-morph_structures/fixtures/stage_utilities/PromiseTypes.mjs";

import StructureKindToSyntaxKindMap from "../../source/generated/structureToSyntax.mjs";
import structureToNodeMap from "#ts-morph_structures/source/bootstrap/structureToNodeMap.mjs";

import {
  MethodSignatureImpl,
} from "#ts-morph_structures/exports.mjs";

async function getSupportedKindSet(): Promise<Set<StructureKind>> {
  const stageDir: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../.."
  };

  const pathToStructuresDir = pathToModule(stageDir, "source/structures");

  const moduleList = (await fs.readdir(pathToStructuresDir)).filter(
    fileName => fileName.endsWith("Impl.mts")
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

// apparently requires module: esnext, and I can't compile my main code with this
remainingKeysBase.delete(StructureKind.AssertEntry);

// `export = 5;`, unsupported with ECMAScript modules
remainingKeysBase.delete(StructureKind.ExportAssignment);

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
  pathToDirectory: "../../../fixtures"
};

it("structureToNodeMap returns an accurate Map<Structure, Node>", () => {
  const remainingKeys = new Set(remainingKeysBase);
  function checkMap(
    pathToModuleFile: string
  ): void
  {
    pathToModuleFile = pathToModule(fixturesDir, pathToModuleFile);
    project.addSourceFileAtPath(pathToModuleFile);
    const sourceFile = project.getSourceFileOrThrow(pathToModuleFile);

    let map: ReadonlyMap<Structures, Node>;
    try {
      map = structureToNodeMap(sourceFile, false);
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

it("structureToNodeMap can use the type-aware structures", () => {
  function checkMap(
    pathToModuleFile: string
  ): ReadonlyMap<Structures, Node>
  {
    pathToModuleFile = pathToModule(fixturesDir, pathToModuleFile);
    project.addSourceFileAtPath(pathToModuleFile);
    const sourceFile = project.getSourceFileOrThrow(pathToModuleFile);

    try {
      return structureToNodeMap(sourceFile, true);
    }
    catch (ex) {
      console.log(pathToModuleFile);
      throw ex;
    }
  }

  checkMap("ecma_references/classDecorators.mts");
  checkMap("stage_utilities/assert.mts");
  checkMap("stage_utilities/DefaultMap.mts");
  checkMap("stage_utilities/PromiseTypes.mts");
  checkMap("stage_utilities/PropertyKeySorter.mts");
  checkMap("grab-bag.mts");

  const structureMap = checkMap("stage_utilities/WeakRefSet.mts");
  const liveElementsSignature = Array.from(structureMap.keys()).find(
    structure => structure.kind === StructureKind.MethodSignature && structure.name === "liveElements"
  );

  expect(liveElementsSignature).toBeInstanceOf(MethodSignatureImpl);
  if (!(liveElementsSignature instanceof MethodSignatureImpl))
    return;

  /*
  const { returnTypeStructure } = liveElementsSignature;
  expect(returnTypeStructure).toBeInstanceOf(TypeArgumentedTypedStructureImpl);
  if (!(returnTypeStructure instanceof TypeArgumentedTypedStructureImpl))
    return;
  expect(returnTypeStructure.objectType).toEqual(
    new LiteralTypedStructureImpl("IterableIterator")
  );
  expect(returnTypeStructure.elements).toEqual([
    new LiteralTypedStructureImpl("T"),
  ]);
  */

  expect(liveElementsSignature.returnType).toBe("IterableIterator<T>");
});
