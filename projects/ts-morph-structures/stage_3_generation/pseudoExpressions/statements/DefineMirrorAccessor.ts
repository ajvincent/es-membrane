import {
  type WriterFunction,
} from "ts-morph";

import {
  FunctionDeclarationImpl,
  LiteralTypeStructureImpl,
  ParameterDeclarationImpl,
  TypeStructures,
} from "#stage_two/snapshot/source/exports.js";
import ExpressionBase from "../ExpressionBase.js";

import CallExpressionStatementImpl from "./CallExpression.js";

import { ObjectLiteralExpressionMap } from "../literals/Object.js";
import { FunctionExpressionImpl } from "../literals/Function.js";

export class DefineMirrorAccessor extends ExpressionBase {
  readonly #descriptor = new ObjectLiteralExpressionMap();
  readonly #callExpression: CallExpressionStatementImpl;

  readonly writerFunction: WriterFunction;

  constructor(
    name: string,
    typeStructure: TypeStructures,
    closureIdentifier: string,
    configurable: boolean,
    enumerable: boolean,
    includeGetter: boolean,
    includeSetter: boolean,
  )
  {
    super();

    this.#callExpression = new CallExpressionStatementImpl({
      name: "Reflect.defineProperty",
      parameters: ["this", `"${name}"`, this.#descriptor.writerFunction]
    });

    this.#descriptor.set("configurable", configurable ? "true" : "false");
    this.#descriptor.set("enumerable", enumerable ? "true" : "false");

    if (includeGetter) {
      const getter = new FunctionDeclarationImpl();
      getter.statements.push(`return ${closureIdentifier};`);
      getter.returnTypeStructure = typeStructure;
      this.#descriptor.set("get", new FunctionExpressionImpl(getter));
    }

    if (includeSetter) {
      const setter = new FunctionDeclarationImpl();
      const valueParam = new ParameterDeclarationImpl("value");
      valueParam.typeStructure = typeStructure;
      setter.parameters.push(valueParam);
      setter.returnTypeStructure = LiteralTypeStructureImpl.get("void");
      setter.statements.push(`${closureIdentifier} = value;`);

      this.#descriptor.set("set", new FunctionExpressionImpl(setter));
    }

    this.writerFunction = this.#callExpression.writerFunction;
  }
}
