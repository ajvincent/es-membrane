import {
  StructureKind
} from "ts-morph";

import {
  type ModuleSourceDirectory,
  pathToModule,
} from "#utilities/source/AsyncSpecModules.js";

import ClassMembersMap from "./utilities/public/ClassMembersMap.js";

const projectDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../../.."
};

const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../.."
};

const distDir = pathToModule(stageDir, "dist");

const COPY_FIELDS_NAME = ClassMembersMap.keyFromName(
  StructureKind.Method, true, "[COPY_FIELDS]"
);

const STRUCTURE_AND_TYPES_CHILDREN_NAME = ClassMembersMap.keyFromName(
  StructureKind.Method, false, "[STRUCTURE_AND_TYPES_CHILDREN]"
);

export {
  COPY_FIELDS_NAME,
  STRUCTURE_AND_TYPES_CHILDREN_NAME,
  distDir,
  projectDir,
  stageDir,
};
