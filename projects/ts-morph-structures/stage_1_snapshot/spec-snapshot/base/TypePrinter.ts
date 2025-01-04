import {
  CodeBlockWriter,
} from "ts-morph";

import {
  FunctionTypedStructureImpl,
  FunctionWriterStyle,
  LiteralTypedStructureImpl,
  ParameterTypedStructureImpl,
  TypeParameterDeclarationImpl,

  createCodeBlockWriter,
} from "#stage_one/prototype-snapshot/exports.js";

describe("TypePrinter for type structures", () => {
  let writer: CodeBlockWriter = createCodeBlockWriter();

  // #region setup
  const stringTypeParam = new TypeParameterDeclarationImpl("StringType");
  stringTypeParam.constraintStructure = new LiteralTypedStructureImpl("string");

  const numberTypeParam = new TypeParameterDeclarationImpl("NumberType");
  numberTypeParam.constraintStructure = new LiteralTypedStructureImpl("number");
  numberTypeParam.defaultStructure = new LiteralTypedStructureImpl("1");

  const nstTyped = new LiteralTypedStructureImpl("NumberStringType");

  const typedFunction = new FunctionTypedStructureImpl({
    name: undefined,
    writerStyle: FunctionWriterStyle.Arrow,
    isConstructor: false,
    typeParameters: [
      stringTypeParam,
      new TypeParameterDeclarationImpl("Middle"),
      numberTypeParam,
    ],
    parameters: [
      new ParameterTypedStructureImpl(
        "foo",
        nstTyped
      ),
      new ParameterTypedStructureImpl(
        "bar",
        new LiteralTypedStructureImpl(numberTypeParam.name)
      ),
    ],
    restParameter: new ParameterTypedStructureImpl("args", new LiteralTypedStructureImpl("object[]")),
    returnType: new LiteralTypedStructureImpl("string"),
  });
  // #endregion setup

  const unformattedTypeParameters = `<StringType extends string, Middle, NumberType extends number = 1>`;
  const unformattedParameters = `(foo: NumberStringType, bar: NumberType, ...args: object[])`;
  const returnType = " => string";

  beforeEach(() => {
    writer = createCodeBlockWriter();
    typedFunction.typeParameterPrinterSettings.indentChildren = false;
    typedFunction.typeParameterPrinterSettings.newLinesAroundChildren = false;
    typedFunction.typeParameterPrinterSettings.oneLinePerChild = false;
    typedFunction.parameterPrinterSettings.indentChildren = false;
    typedFunction.parameterPrinterSettings.newLinesAroundChildren = false;
    typedFunction.parameterPrinterSettings.oneLinePerChild = false;
  });

  it("without any printer settings", () => {
    typedFunction.writerFunction(writer);
    expect<string>(writer.toString()).toEqual(
      `${unformattedTypeParameters}${unformattedParameters}${returnType}`
    );
  });

  describe("with printer settings on the type parameters:", () => {
    it("indentChildren = true", () => {
      typedFunction.typeParameterPrinterSettings.indentChildren = true;
      typedFunction.writerFunction(writer);
      expect<string>(writer.toString()).toEqual(
        `<
  StringType extends string, Middle, NumberType extends number = 1
>${unformattedParameters}${returnType}`
      );
    });

    it("newLinesAroundChildren = true", () => {
      typedFunction.typeParameterPrinterSettings.newLinesAroundChildren = true;
      typedFunction.writerFunction(writer);
      expect<string>(writer.toString()).toEqual(
        `<
StringType extends string, Middle, NumberType extends number = 1
>${unformattedParameters}${returnType}`
      );
    });

    it("oneLinePerChild = true", () => {
      typedFunction.typeParameterPrinterSettings.oneLinePerChild = true;
      typedFunction.writerFunction(writer);
      expect<string>(writer.toString()).toEqual(
        `<StringType extends string,
Middle,
NumberType extends number = 1>${unformattedParameters}${returnType}`
      );
    });

    it("indentChildren = true, newLinesAroundChildren = true", () => {
      typedFunction.typeParameterPrinterSettings.indentChildren = true;
      typedFunction.typeParameterPrinterSettings.newLinesAroundChildren = true;
      typedFunction.writerFunction(writer);
      expect<string>(writer.toString()).toEqual(
        `<
  StringType extends string, Middle, NumberType extends number = 1
>${unformattedParameters}${returnType}`
      );
    });

    it("indentChildren = true, oneLinePerChild = true", () => {
      typedFunction.typeParameterPrinterSettings.indentChildren = true;
      typedFunction.typeParameterPrinterSettings.oneLinePerChild = true;
      typedFunction.writerFunction(writer);
      expect<string>(writer.toString()).toEqual(
        `<
  StringType extends string,
  Middle,
  NumberType extends number = 1
>${unformattedParameters}${returnType}`
      );
    });

    it("newLinesAroundChildren = true, oneLinePerChild = true", () => {
      typedFunction.typeParameterPrinterSettings.newLinesAroundChildren = true;
      typedFunction.typeParameterPrinterSettings.oneLinePerChild = true;
      typedFunction.writerFunction(writer);
      expect<string>(writer.toString()).toEqual(
        `<
StringType extends string,
Middle,
NumberType extends number = 1
>${unformattedParameters}${returnType}`
      );
    });

    it("indentChildren = true, newLinesAroundChildren = true, oneLinePerChild = true", () => {
      typedFunction.typeParameterPrinterSettings.indentChildren = true;
      typedFunction.typeParameterPrinterSettings.newLinesAroundChildren = true;
      typedFunction.typeParameterPrinterSettings.oneLinePerChild = true;
      typedFunction.writerFunction(writer);
      expect<string>(writer.toString()).toEqual(
        `<
  StringType extends string,
  Middle,
  NumberType extends number = 1
>${unformattedParameters}${returnType}`
      );
    });
  });

  describe("with printer settings on the parameters:", () => {
    it("indentChildren = true", () => {
      typedFunction.parameterPrinterSettings.indentChildren = true;
      typedFunction.writerFunction(writer);
      expect<string>(writer.toString()).toEqual(
        `${unformattedTypeParameters}(
  foo: NumberStringType, bar: NumberType, ...args: object[]
)${returnType}`
      );
    });

    it("newLinesAroundChildren = true", () => {
      typedFunction.parameterPrinterSettings.newLinesAroundChildren = true;
      typedFunction.writerFunction(writer);
      expect<string>(writer.toString()).toEqual(
        `${unformattedTypeParameters}(
foo: NumberStringType, bar: NumberType, ...args: object[]
)${returnType}`
      );
    });

    it("oneLinePerChild = true", () => {
      typedFunction.parameterPrinterSettings.oneLinePerChild = true;
      typedFunction.writerFunction(writer);
      expect<string>(writer.toString()).toEqual(
        `${unformattedTypeParameters}(foo: NumberStringType,
bar: NumberType,
...args: object[])${returnType}`
      );
    });

    it("indentChildren = true, newLinesAroundChildren = true", () => {
      typedFunction.parameterPrinterSettings.indentChildren = true;
      typedFunction.parameterPrinterSettings.newLinesAroundChildren = true;
      typedFunction.writerFunction(writer);
      expect<string>(writer.toString()).toEqual(
        `${unformattedTypeParameters}(
  foo: NumberStringType, bar: NumberType, ...args: object[]
)${returnType}`
      );
    });

    it("indentChildren = true, oneLinePerChild = true", () => {
      typedFunction.parameterPrinterSettings.indentChildren = true;
      typedFunction.parameterPrinterSettings.oneLinePerChild = true;
      typedFunction.writerFunction(writer);
      expect<string>(writer.toString()).toEqual(
        `${unformattedTypeParameters}(
  foo: NumberStringType,
  bar: NumberType,
  ...args: object[]
)${returnType}`
      );
    });

    it("newLinesAroundChildren = true, oneLinePerChild = true", () => {
      typedFunction.parameterPrinterSettings.newLinesAroundChildren = true;
      typedFunction.parameterPrinterSettings.oneLinePerChild = true;
      typedFunction.writerFunction(writer);
      expect<string>(writer.toString()).toEqual(
        `${unformattedTypeParameters}(
foo: NumberStringType,
bar: NumberType,
...args: object[]
)${returnType}`
      );
    });

    it("indentChildren = true, newLinesAroundChildren = true, oneLinePerChild = true", () => {
      typedFunction.parameterPrinterSettings.indentChildren = true;
      typedFunction.parameterPrinterSettings.newLinesAroundChildren = true;
      typedFunction.parameterPrinterSettings.oneLinePerChild = true;
      typedFunction.writerFunction(writer);
      expect<string>(writer.toString()).toEqual(
        `${unformattedTypeParameters}(
  foo: NumberStringType,
  bar: NumberType,
  ...args: object[]
)${returnType}`
      );
    });
  });
});
