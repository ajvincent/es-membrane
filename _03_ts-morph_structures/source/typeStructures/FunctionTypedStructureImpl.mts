import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import {
  FunctionTypeContext,
  FunctionTypedStructure,
  FunctionWriterStyle,
  ParameterTypedStructure,
  TypeStructure
} from "./TypeStructure.mjs";

import {
  TypeStructureKind,
} from "./TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "./callbackToTypeStructureRegistry.mjs";

import cloneableClassesMap from "./cloneableClassesMap.mjs";
import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
import ParameterTypedStructureImpl from "./ParameterTypedStructureImpl.mjs";


export default class FunctionTypedStructureImpl implements FunctionTypedStructure
{
  static clone(
    other: FunctionTypedStructure
  ): FunctionTypedStructureImpl
  {
    return new FunctionTypedStructureImpl({
      name: other.name,
      isConstructor: other.isConstructor,
      parameters: other.parameters.map(param => ParameterTypedStructureImpl.clone(param)),
      restParameter: (other.restParameter ? ParameterTypedStructureImpl.clone(other.restParameter) : undefined),
      returnType: cloneableClassesMap.get(other.returnType.kind)!.clone(other.returnType),
      writerStyle: other.writerStyle,
    });
  }

  readonly kind: TypeStructureKind.Function = TypeStructureKind.Function;

  name: string;
  isConstructor: boolean;
  parameters: ParameterTypedStructure[];
  restParameter: ParameterTypedStructure | undefined;
  returnType: TypeStructure;
  writerStyle: FunctionWriterStyle = FunctionWriterStyle.Arrow;

  constructor(
    context: FunctionTypeContext
  )
  {
    this.name = context.name ?? "";
    this.isConstructor = context.isConstructor;
    this.parameters = context.parameters.slice();
    this.restParameter = context.restParameter;
    this.returnType = context.returnType;
    this.writerStyle = context.writerStyle;

    registerCallbackForTypeStructure(this);
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    if (this.writerStyle === FunctionWriterStyle.GetAccessor) {
      writer.write("get ");
      if (this.name)
        writer.write(this.name);
    }
    else if (this.writerStyle === FunctionWriterStyle.SetAccessor) {
      writer.write("set ");
      if (this.name)
        writer.write(this.name);
    }
    else if (this.writerStyle === FunctionWriterStyle.Method) {
      if (this.name)
        writer.write(this.name);
    }
    else if (this.isConstructor)
      writer.write("new ");

    /*
    if (this.typeArguments) {
      let typesWriter: TypeArgumentsWriter = new TypeArgumentsWriter(this.typeArguments);
      typesWriter.writerFunction(writer);
    }
    */
    writer.write("(");

    this.parameters.forEach((param, index) => {
      param.writerFunction(writer);
      if ((index < this.parameters.length - 1) || this.restParameter)
        writer.write(", ");
    });

    if (this.restParameter) {
      writer.write("...");
      this.restParameter.writerFunction(writer);
    }
    writer.write(")");

    switch (this.writerStyle) {
      case FunctionWriterStyle.Arrow:
        writer.write(" => ");
        this.returnType.writerFunction(writer);
        break;

      case FunctionWriterStyle.GetAccessor:
      case FunctionWriterStyle.Method:
        writer.write(": ");
        this.returnType.writerFunction(writer);
        break;
    }
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}

FunctionTypedStructureImpl satisfies CloneableStructure<FunctionTypedStructure>;
