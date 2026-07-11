import type {
  ClassDeclarationImpl,
  ImportManager,
} from "ts-morph-structures";

export interface ClassAndImportManager {
  readonly classDecl: ClassDeclarationImpl;
  readonly importManager: ImportManager;
}
