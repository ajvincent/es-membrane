import {
  ImportManager
} from "ts-morph-structures";

export declare function mergeImportManagers(
  sourceManagers: Iterable<ImportManager>,
  targetModuleSpecifier: string
): ImportManager;
