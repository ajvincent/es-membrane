import ExportManager, {
  type AddExportContext,
} from "./public/ExportManager.js";

import {
  SourceFileImpl,
} from "#stage_one/prototype-snapshot/exports.js";

import saveSourceFile from "./saveSourceFile.js";

export default class ExportManagerCommit extends ExportManager
{
  #committed = false;

  addExports(
    context: AddExportContext
  ): void
  {
    if (this.#committed)
      throw new Error("file has been committed");
    return super.addExports(context);
  }


  async commit(): Promise<void> {
    if (this.#committed)
      throw new Error("exports file has been committed");
    this.#committed = true;

    const sourceStructure = new SourceFileImpl;
    const declarations = this.getDeclarations();

    sourceStructure.statements.push(
      "// This file is generated.  Do not edit.",
      ...declarations
    );

    await saveSourceFile(this.absolutePathToExportFile, sourceStructure);
  }
}