// #region preamble
import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import {
  type FunctionTypeContext,
  type FunctionTypedStructure,
  FunctionWriterStyle,
  type ParameterTypedStructure,
  type TypeStructures
} from "./TypeStructures.mjs";

import {
  ParameterTypedStructureImpl,
  TypeParameterConstraintMode,
  TypeParameterDeclarationImpl,
  TypeStructureKind,
} from "../../exports.mjs";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.mjs";

import {
  registerCallbackForTypeStructure,
} from "../base/callbackToTypeStructureRegistry.mjs";

import {
  pairedWrite,
} from "../base/utilities.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
// #endregion preamble

/** ("new" | "get" | "set" | "") name<typeParameters>(parameters, ...restParameter) ("=\>" | ":" ) returnType */
export default class FunctionTypedStructureImpl
implements FunctionTypedStructure
{
  static clone(
    other: FunctionTypedStructure
  ): FunctionTypedStructureImpl
  {
    return new FunctionTypedStructureImpl({
      name: other.name,
      isConstructor: other.isConstructor,
      typeParameters: other.typeParameters,
      parameters: other.parameters.map(param => ParameterTypedStructureImpl.clone(param)),
      restParameter: (other.restParameter ? ParameterTypedStructureImpl.clone(other.restParameter) : undefined),
      returnType: other.returnType ? TypeStructureClassesMap.clone(other.returnType) : undefined,
      writerStyle: other.writerStyle,
    });
  }

  readonly kind: TypeStructureKind.Function = TypeStructureKind.Function;

  name: string;
  isConstructor: boolean;
  typeParameters: TypeParameterDeclarationImpl[];
  parameters: ParameterTypedStructure[];
  restParameter: ParameterTypedStructure | undefined;
  returnType: TypeStructures | undefined;
  writerStyle: FunctionWriterStyle = FunctionWriterStyle.Arrow;

  constructor(
    context: Partial<FunctionTypeContext>
  )
  {
    this.name = context.name ?? "";
    this.isConstructor = context.isConstructor ?? false
    this.typeParameters = context.typeParameters?.slice() ?? []
    this.parameters = context.parameters?.slice() ?? [];
    this.restParameter = context.restParameter;
    this.returnType = context.returnType;
    this.writerStyle = context.writerStyle ??  FunctionWriterStyle.Arrow;

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

    if (this.typeParameters.length) {
      pairedWrite(writer, "<", ">", false, false, () => {
        this.typeParameters.forEach((typeParam, index) => {
          typeParam.constraintWriter(writer, TypeParameterConstraintMode.extends);
          if (index < this.typeParameters.length - 1)
            writer.write(", ");
        });
      });
    }

    pairedWrite(writer, "(", ")", false, false, () => {
      this.parameters.forEach((param, index) => {
        param.writerFunction(writer);
        if ((index < this.parameters.length - 1) || this.restParameter)
          writer.write(", ");
      });
  
      if (this.restParameter) {
        writer.write("...");
        this.restParameter.writerFunction(writer);
      }
    });

    if (this.returnType) {
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
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}

FunctionTypedStructureImpl satisfies CloneableStructure<FunctionTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.Function, FunctionTypedStructureImpl);
