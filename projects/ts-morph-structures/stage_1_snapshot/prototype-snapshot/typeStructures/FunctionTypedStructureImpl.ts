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
} from "./TypeStructures.js";

import {
  ParameterTypedStructureImpl,
  PrefixOperatorsTypedStructureImpl,
  TypeParameterConstraintMode,
  TypeParameterDeclarationImpl,
  TypePrinterSettingsBase,
  TypeStructureKind,
} from "../exports.js";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.js";

import {
  registerCallbackForTypeStructure,
} from "../base/callbackToTypeStructureRegistry.js";

import replaceDescendantTypeStructures from "../base/replaceDescendantTypeStructures.js";

import {
  pairedWrite,
} from "../base/utilities.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";
import { TypePrinter } from "../base/TypePrinter.js";
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

  readonly typeParameterPrinterSettings = new TypePrinterSettingsBase;
  readonly parameterPrinterSettings = new TypePrinterSettingsBase;

  public replaceDescendantTypes(
    filter: (typeStructure: TypeStructures) => boolean,
    replacement: TypeStructures
  ): void
  {
    this.typeParameters.forEach(typeParam => typeParam.replaceDescendantTypes(filter, replacement));

    for (let i = 0; i < this.parameters.length; i++) {
      replaceDescendantTypeStructures(this.parameters, i, filter, replacement);
    }

    if (this.restParameter) {
      replaceDescendantTypeStructures(this, "restParameter", filter, replacement);
    }

    if (this.returnType) {
      replaceDescendantTypeStructures(this, "returnType", filter, replacement);
    }
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
      pairedWrite(
        writer,
        "<",
        ">",
        this.typeParameterPrinterSettings.newLinesAroundChildren,
        this.typeParameterPrinterSettings.indentChildren,
        () => {
          const lastChild = this.typeParameters[this.typeParameters.length - 1];

          for (const typeParam of this.typeParameters) {
            typeParam.constraintWriter(writer, TypeParameterConstraintMode.extends);

            if (typeParam === lastChild) {
              continue;
            }

            if (this.typeParameterPrinterSettings.oneLinePerChild) {
              writer.write(",");
              writer.newLine();
            }
            else {
              writer.write(", ");
            }
          }
        }
      );
    }

    const childTypes: TypeStructures[] = this.parameters.slice();
    if (this.restParameter) {
      const restPrefix = new PrefixOperatorsTypedStructureImpl(["..."], this.restParameter);
      childTypes.push(restPrefix);
    }

    TypePrinter(writer, {
      ...this.parameterPrinterSettings,
      objectType: null,
      childTypes,
      startToken: "(",
      joinChildrenToken: ", ",
      endToken: ")",
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

  writerFunction: WriterFunction = this.#writerFunction.bind(this);
}

FunctionTypedStructureImpl satisfies CloneableStructure<FunctionTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.Function, FunctionTypedStructureImpl);
