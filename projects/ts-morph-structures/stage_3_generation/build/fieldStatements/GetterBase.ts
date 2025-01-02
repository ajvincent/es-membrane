import type {
  ClassStatementsGetter,
  ImportManager,
} from "#stage_two/snapshot/source/exports.js";

import BaseClassModule from "../../moduleClasses/BaseClassModule.js";

export default
abstract class StatementGetterBase
implements ClassStatementsGetter
{
  protected readonly importManager: ImportManager;
  protected readonly baseName: string;
  protected readonly module: BaseClassModule;

  readonly keyword: string;
  readonly supportsStatementsFlags: number;

  constructor(
    module: BaseClassModule,
    keyword: string,
    flags: number,
  )
  {
    this.importManager = module.importManager;
    this.baseName = module.baseName;
    this.module = module;
    this.keyword = module.baseName + ":" + keyword;
    this.supportsStatementsFlags = flags;
  }
}
