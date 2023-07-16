import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  TypedNodeWriter
} from "../types/ts-morph-typednodewriter.mjs";
import LiteralWriter from "./Literal.mjs";
import ChildrenWriter from "./ChildrenWriter.mjs";

export interface FunctionTypeContext {
  //typeArguments: TypeParameterDeclarationImpl[]
  isConstructor: boolean,
  parameters: [LiteralWriter, TypedNodeWriter][];
  restParameter: [LiteralWriter, TypedNodeWriter] | undefined;
  returnType: TypedNodeWriter;
}

export default class FunctionTypeWriter implements TypedNodeWriter
{
  public static readonly voidWriter = new LiteralWriter("void");

  //public typeArguments: TypeParameterDeclarationImpl[];
  public isConstructor: boolean;
  public parameters: [LiteralWriter, TypedNodeWriter][];
  public restParameter: [LiteralWriter, TypedNodeWriter] | undefined;
  public returnType: TypedNodeWriter;

  constructor(
    context: FunctionTypeContext,
  )
  {
    const {
      isConstructor,
      parameters,
      restParameter,
      returnType,
    } = context;

    this.isConstructor = isConstructor;
    //this.typeArguments = typeArguments.slice();
    this.parameters = parameters.map(param => [...param]);
    if (restParameter)
      this.restParameter = [...restParameter];
    this.returnType = returnType;
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
      ([literal, typeWriter]) => new OneParameterWriter(literal, typeWriter)
    ));

    if (this.restParameter) {
      argumentsWriter.children.push(new OneParameterWriter(...this.restParameter, true));
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

/*
class TypeArgumentsWriter extends ChildrenWriter {
  public readonly prefix = "<";
  public readonly postfix = ">";
  public readonly joinCharacters = ", ";

  constructor(typeArguments: TypedNodeWriter[]) {
    super();
    this.children.push(...typeArguments);
  }
}
*/

class AllParametersWriter extends ChildrenWriter
{
  public readonly prefix = "(";
  public readonly postfix = ")";
  public readonly joinCharacters = ", ";

  constructor(childWriters: readonly TypedNodeWriter[])
  {
    super();
    this.children.push(...childWriters);
  }
}

class OneParameterWriter implements TypedNodeWriter
{
  #literal: LiteralWriter;
  #type: TypedNodeWriter
  #isRestParameter: boolean;
  constructor(
    literal: LiteralWriter,
    type: TypedNodeWriter,
    isRestParameter = false
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
