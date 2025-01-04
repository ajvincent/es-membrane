import type {
  CodeBlockWriter
} from "ts-morph";

import {
  type TypeStructures
} from "#stage_two/snapshot/source/exports.js";

import StatementBase from "./StatementBase.js";

export default class SatisfiesStatementImpl
extends StatementBase
{
  identifier: string;
  satisfiesType: TypeStructures;

  constructor(
    identifier: string,
    satisfiesType: TypeStructures
  )
  {
    super();
    this.identifier = identifier;
    this.satisfiesType = satisfiesType;
  }

  #writerFunction(
    writer: CodeBlockWriter
  ): void
  {
    writer.write(this.identifier);
    writer.write(" satisfies ");
    this.satisfiesType.writerFunction(writer);
    writer.write(";");
  }

  readonly writerFunction = this.#writerFunction.bind(this);
}
