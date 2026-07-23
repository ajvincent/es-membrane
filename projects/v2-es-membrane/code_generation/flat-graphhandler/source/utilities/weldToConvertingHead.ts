import {
  type ClassMembersMap,
  ImportManager,
  SourceFileImpl,
} from "ts-morph-structures";

export function weldToConvertingHead(
  tailClassMembers: ClassMembersMap,
  tailImportManager: ImportManager,
): SourceFileImpl
{
  void tailClassMembers;
  void tailImportManager;
  throw new Error("not yet implemented");
}
