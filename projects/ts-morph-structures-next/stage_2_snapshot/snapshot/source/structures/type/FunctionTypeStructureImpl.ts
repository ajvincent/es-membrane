// #region preamble
import { StructureKind, type CodeBlockWriter } from "ts-morph";

import type { AugmentedStructures, TypeStructures } from "../../exports.js";

import { StructureClassesMap } from "../../base/StructureClassesMap.js";
import { TypeStructureClassesMap } from "../../base/TypeStructureClassesMap.js";

import { TypeStructureKind } from "../../base/TypeStructureKind.js";

import { STRUCTURE_CHILDREN } from "../../base/symbolKeys.js";

import type { CloneableTypeStructure } from "../../types/CloneableStructure.js";

import type { TypeParameterDeclarationImpl } from "../standard/TypeParameterDeclarationImpl.js";

import { WRITER_FUNCTION_KEY } from "../WriterStructuresBase.js";

import { ParameterTypeStructureImpl } from "./ParameterTypeStructureImpl.js";

import { PrefixOperatorsTypeStructureImpl } from "./PrefixOperatorsTypeStructureImpl.js";

import TypeStructuresWithTypeParameters from "./TypeStructuresWithTypeParameters.js";
// #endregion preamble

export enum FunctionWriterStyle {
  Arrow = "Arrow",
  Method = "Method",
  GetAccessor = "GetAccessor",
  SetAccessor = "SetAccessor",
}

export interface FunctionTypeContext {
  name: string | undefined;
  isConstructor: boolean;
  // useful for constraintStructure, defaultStructure
  typeParameters: TypeParameterDeclarationImpl[];
  parameters: ParameterTypeStructureImpl[];
  restParameter: ParameterTypeStructureImpl | undefined;
  returnType: TypeStructures | undefined;
  writerStyle: FunctionWriterStyle;
}

/** ("new" | "get" | "set" | "") name<typeParameters>(parameters, ...restParameter) ("=\>" | ":" ) returnType */
export class FunctionTypeStructureImpl extends TypeStructuresWithTypeParameters<TypeStructureKind.Function> {
  static clone(other: FunctionTypeStructureImpl): FunctionTypeStructureImpl {
    return new FunctionTypeStructureImpl({
      name: other.name,
      isConstructor: other.isConstructor,
      typeParameters: StructureClassesMap.cloneArrayWithKind(
        StructureKind.TypeParameter,
        other.typeParameters,
      ),
      parameters: other.parameters.map((param) =>
        ParameterTypeStructureImpl.clone(param),
      ),
      restParameter: other.restParameter
        ? ParameterTypeStructureImpl.clone(other.restParameter)
        : undefined,
      returnType: other.returnType
        ? TypeStructureClassesMap.clone(other.returnType)
        : undefined,
      writerStyle: other.writerStyle,
    });
  }

  readonly kind: TypeStructureKind.Function = TypeStructureKind.Function;

  name: string;
  isConstructor: boolean;
  typeParameters: TypeParameterDeclarationImpl[];
  parameters: ParameterTypeStructureImpl[];
  restParameter: ParameterTypeStructureImpl | undefined;
  returnType: TypeStructures | undefined;
  writerStyle: FunctionWriterStyle = FunctionWriterStyle.Arrow;

  constructor(context: Partial<FunctionTypeContext>) {
    super();
    this.name = context.name ?? "";
    this.isConstructor = context.isConstructor ?? false;
    this.typeParameters = context.typeParameters?.slice() ?? [];
    this.parameters = context.parameters?.slice() ?? [];
    this.restParameter = context.restParameter;
    this.returnType = context.returnType;
    this.writerStyle = context.writerStyle ?? FunctionWriterStyle.Arrow;
  }

  /** @internal */
  protected [WRITER_FUNCTION_KEY](writer: CodeBlockWriter): void {
    if (this.writerStyle === FunctionWriterStyle.GetAccessor) {
      writer.write("get ");
      if (this.name) writer.write(this.name);
    } else if (this.writerStyle === FunctionWriterStyle.SetAccessor) {
      writer.write("set ");
      if (this.name) writer.write(this.name);
    } else if (this.writerStyle === FunctionWriterStyle.Method) {
      if (this.name) writer.write(this.name);
    } else if (this.isConstructor) writer.write("new ");

    if (this.typeParameters.length) {
      FunctionTypeStructureImpl.pairedWrite(
        writer,
        "<",
        ">",
        false,
        false,
        () => {
          const lastChild = this.typeParameters[this.typeParameters.length - 1];

          for (const typeParam of this.typeParameters) {
            TypeStructuresWithTypeParameters.writeTypeParameter(
              typeParam,
              writer,
              "extends",
            );

            if (typeParam !== lastChild) {
              writer.write(", ");
            }
          }
        },
      );
    }

    FunctionTypeStructureImpl.pairedWrite(
      writer,
      "(",
      ")",
      false,
      false,
      () => {
        let lastType:
          | ParameterTypeStructureImpl
          | PrefixOperatorsTypeStructureImpl
          | undefined;
        if (this.restParameter)
          lastType = new PrefixOperatorsTypeStructureImpl(
            ["..."],
            this.restParameter,
          );
        else if (this.parameters.length > 0)
          lastType = this.parameters[this.parameters.length - 1];

        for (const type of this.parameters) {
          type.writerFunction(writer);
          if (type !== lastType) writer.write(", ");
        }
        if (this.restParameter) {
          lastType!.writerFunction(writer);
        }
      },
    );

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

  /** @internal */
  public *[STRUCTURE_CHILDREN](): IterableIterator<AugmentedStructures> {
    yield* super[STRUCTURE_CHILDREN]();

    yield* this.typeParameters.values();
    yield* this.parameters.values();
    if (this.restParameter) yield this.restParameter;
    if (typeof this.returnType === "object") yield this.returnType;
  }
}

FunctionTypeStructureImpl satisfies CloneableTypeStructure<FunctionTypeStructureImpl>;

TypeStructureClassesMap.set(
  TypeStructureKind.Function,
  FunctionTypeStructureImpl,
);
