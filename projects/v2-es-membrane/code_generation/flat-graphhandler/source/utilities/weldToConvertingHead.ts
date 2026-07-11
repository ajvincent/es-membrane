import {
  type ClassMembersMap,
  ImportManager,
  SourceFileImpl,
} from "ts-morph-structures";

export declare function weldToConvertingHead(
  tailClassMembers: ClassMembersMap,
  tailImportManager: ImportManager,
): SourceFileImpl;
