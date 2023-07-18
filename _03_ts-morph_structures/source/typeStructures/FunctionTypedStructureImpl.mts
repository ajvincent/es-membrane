import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  FunctionTypedStructure,
  LiteralTypedStructure,
  TypeStructure
} from "./TypeStructure.mjs";

import {
  TypeStructureKind,
} from "./TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "./callbackToTypeStructureRegistry.mjs";

export interface FunctionTypeContext {
  //typeArguments: TypeParameterDeclarationImpl[]
  isConstructor: boolean,
  parameters: [LiteralTypedStructure, TypeStructure][];
  restParameter: [LiteralTypedStructure, TypeStructure] | undefined;
  returnType: TypeStructure;
}

export default class FunctionTypedStructureImpl implements FunctionTypedStructure
{
  readonly kind: TypeStructureKind.Function = TypeStructureKind.Function;

  isConstructor: boolean;
  parameters: [LiteralTypedStructure, TypeStructure][];
  restParameter: [LiteralTypedStructure, TypeStructure] | undefined;
  returnType: TypeStructure;

  constructor(
    context: FunctionTypeContext
    )
  {
    this.isConstructor = context.isConstructor;
    this.parameters = context.parameters.slice();
    this.restParameter = context.restParameter;
    this.returnType = context.returnType;

    registerCallbackForTypeStructure(this);
  }

  #writerFunction(writer: CodeBlockWriter): void
  {

    /*
    let typesWriter: TypeArgumentsWriter | undefined;
    if (this.typeArguments) {
      typesWriter = new TypeArgumentsWriter(this.typeArguments);
    }
    */

    const argumentsWriter = new AllParametersWriter(this.parameters.map(
      ([literal, typeWriter]) => new OneParameterWriter(literal, typeWriter, false)
    ));

    if (this.restParameter) {
      argumentsWriter.elements.push(new OneParameterWriter(...this.restParameter, true));
    }

    if (this.isConstructor)
      writer.write("new ");

    /*
    if (typesWriter)
      typesWriter.writerFunction(writer);
    */
    argumentsWriter.writerFunction(writer);
    writer.write(" => ");

    this.returnType.writerFunction(writer);
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}

class AllParametersWriter
{
  public readonly prefix = "(";
  public readonly postfix = ")";
  public readonly joinCharacters = ", ";

  elements: OneParameterWriter[];

  constructor(typeStructures: OneParameterWriter[])
  {
    this.elements = typeStructures;
  }


  #writerFunction(writer: CodeBlockWriter): void
  {
    writer.write(this.prefix);

    const lastChildIndex = this.elements.length - 1;
    this.elements.forEach((typedStructure, index) => {
      typedStructure.writerFunction(writer);
      if (index < lastChildIndex) {
        writer.write(this.joinCharacters);
      }
    });

    writer.write(this.postfix);
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}

class OneParameterWriter
{
  #literal: LiteralTypedStructure;
  #type: TypeStructure
  #isRestParameter: boolean;
  constructor(
    literal: LiteralTypedStructure,
    type: TypeStructure,
    isRestParameter: boolean
  )
  {
    this.#literal = literal;
    this.#type = type;
    this.#isRestParameter = isRestParameter;
  }

  #writerFunction(writer: CodeBlockWriter): void {
    if (this.#isRestParameter)
      writer.write("...");
    this.#literal.writerFunction(writer);
    writer.write(": ");
    this.#type.writerFunction(writer);
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
