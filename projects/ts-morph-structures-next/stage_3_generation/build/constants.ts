import {
  StructureKind
} from "ts-morph";

import {
  ClassMembersMap
} from "#stage_two/snapshot/source/exports.js";

import {
  type ModuleSourceDirectory,
} from "#utilities/source/AsyncSpecModules.js";

const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../.."
};

const distDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../../dist"
};

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
  stageDir,
};
