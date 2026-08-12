import {
  type AccessorMirrorGetter,
  type ClassBodyStatementsGetter,
  type ClassHeadStatementsGetter,
  type ClassTailStatementsGetter,
  type ConstructorBodyStatementsGetter,
  type ConstructorHeadStatementsGetter,
  type ConstructorTailStatementsGetter,
  MemberedStatementsKey,
  type PropertyInitializerGetter,
  stringWriterOrStatementImpl
} from "#stage_two/snapshot/source/exports.js";

import { BaseClassModule } from "../../moduleClasses/exports.js";
import StatementGetterBase from "./GetterBase.js";

export default
class DebuggingFilter extends StatementGetterBase
implements AccessorMirrorGetter, PropertyInitializerGetter,
ClassBodyStatementsGetter, ClassHeadStatementsGetter, ClassTailStatementsGetter,
ConstructorBodyStatementsGetter, ConstructorHeadStatementsGetter, ConstructorTailStatementsGetter
{
  #baseNamePrefix?: string;
  #fieldKeyPrefix: string;
  #groupKeyNeedle: string;

  constructor(
    module: BaseClassModule,
    flags: number,
    fieldKeyPrefix: string,
    groupKeyNeedle: string,
    baseName?: string
  )
  {
    super(
      module,
      "Debugging",
      flags,
    );
    this.#fieldKeyPrefix = fieldKeyPrefix;
    this.#groupKeyNeedle = groupKeyNeedle;
    this.#baseNamePrefix = baseName;
  }
  filterAccessorMirror(key: MemberedStatementsKey): boolean {
    return this.#accept(key);
  }
  getAccessorMirror(key: MemberedStatementsKey): stringWriterOrStatementImpl | undefined {
    return this.#getStatements(key)[0];
  }
  filterPropertyInitializer(key: MemberedStatementsKey): boolean {
    return this.#accept(key);
  }
  getPropertyInitializer(key: MemberedStatementsKey): stringWriterOrStatementImpl | undefined {
    return this.#getStatements(key)[0];
  }
  filterBodyStatements(key: MemberedStatementsKey): boolean {
    return this.#accept(key);
  }
  getBodyStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    return this.#getStatements(key);
  }
  filterHeadStatements(key: MemberedStatementsKey): boolean {
    return this.#accept(key);
  }
  getHeadStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    return this.#getStatements(key);
  }
  filterTailStatements(key: MemberedStatementsKey): boolean {
    return this.#accept(key);
  }
  getTailStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    return this.#getStatements(key);
  }
  filterCtorBodyStatements(key: MemberedStatementsKey): boolean {
    return this.#accept(key);
  }
  getCtorBodyStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    return this.#getStatements(key);
  }
  filterCtorHeadStatements(key: MemberedStatementsKey): boolean {
    return this.#accept(key);
  }
  getCtorHeadStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    return this.#getStatements(key);
  }
  filterCtorTailStatements(key: MemberedStatementsKey): boolean {
    return this.#accept(key);
  }
  getCtorTailStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    return this.#getStatements(key);
  }

  #accept(
    key: MemberedStatementsKey
  ): boolean
  {
    if (key.fieldKey.startsWith(this.#fieldKeyPrefix) && key.statementGroupKey.includes(this.#groupKeyNeedle)) {
      if (!this.#baseNamePrefix || this.module.baseName.startsWith(this.#baseNamePrefix)) {
        // eslint-disable-next-line no-debugger
        debugger;
      }
    }
    return false;
  }

  #getStatements(
    key: MemberedStatementsKey
  ): readonly stringWriterOrStatementImpl[]
  {
    void(key);
    throw new Error("Method not implemented.");
  }
}
