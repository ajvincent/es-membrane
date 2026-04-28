import assert from "node:assert/strict";

import {
  FunctionDeclarationImpl,
  ParameterDeclarationImpl,
} from "#stage_two/snapshot/source/exports.js";

import type {
  CodeBlockWriter,
  WriterFunction
} from "ts-morph";

import BlockStatementImpl from "../statements/BlockStatement.js";
import ExpressionBase from "../ExpressionBase.js";

export class FunctionExpressionImpl extends ExpressionBase {
  readonly #functionDecl: FunctionDeclarationImpl;

  constructor(
    functionDecl: FunctionDeclarationImpl
  )
  {
    super();
    this.#functionDecl = functionDecl;
  }

  #beforeBlockWriter(
    writer: CodeBlockWriter
  ): void
  {
    assert(this.#functionDecl.overloads.length === 0);
    assert(this.#functionDecl.parameters.every(v => v?.type));
    assert(this.#functionDecl.typeParameters.every(v => typeof v === "string"));
    assert(this.#functionDecl.returnType);

    writer.write("function");
    if (this.#functionDecl.name)
      writer.write(" " + this.#functionDecl.name);

    if (this.#functionDecl.typeParameters.length > 0) {
      this.pairedWrite(writer, "<", ">", () => {
        this.writeSequence(writer, this.#functionDecl.typeParameters as readonly string[]);
      });
    }

    const params: readonly WriterFunction[] = this.#functionDecl.parameters.map(
      p => this.#parameterWriter(writer, p)
    );
    this.pairedWrite(writer, "(", ")", () => {
      this.writeSequence(writer, params)
    });

    writer.write(": ");
    this.writeExpression(writer, this.#functionDecl.returnType);
  }

  #parameterWriter(writer: CodeBlockWriter, param: ParameterDeclarationImpl): WriterFunction {
    return () => {
      writer.write(param.name + ": ");
      this.writeExpression(writer, param.type!);
    }
  }


  #writerFunction(
    writer: CodeBlockWriter
  ): void
  {
    assert(this.#functionDecl.statements.every(v => typeof v === "string"));
    const blockWriter = new BlockStatementImpl(
      this.#beforeBlockWriter.bind(this),
      this.#functionDecl.statements.map(ExpressionBase.mapToWriter),
    );
    blockWriter.writerFunction(writer);
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
