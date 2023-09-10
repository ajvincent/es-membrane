import getTS_SourceFile from "#stage_utilities/source/getTS_SourceFile.mjs";

import {
  ModuleSourceDirectory
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import ClassStubBuilder from "../source/ClassStubBuilder.mjs";
import {
  ConditionalTypedStructure,
  LiteralTypedStructureImpl,
  ObjectLiteralTypedStructureImpl,
  StringTypedStructureImpl,
  TypeAliasDeclarationImpl,
  TemplateLiteralTypedStructureImpl,
  TypeParameterDeclarationImpl,
  TypeStructureKind,
  TypeArgumentedTypedStructureImpl,
} from "#ts-morph_structures/exports.mjs";
import { StructureKind } from "ts-morph";

describe("ClassStubBuilder", () => {
  const fixturesDirectory: ModuleSourceDirectory = {
    pathToDirectory: "#aspects/stubs/fixtures",
    isAbsolutePath: true,
  };

  describe("with interfaces", () => {
    it("with no type parameters and no index signatures, holding methods", () => {
      const NST = getTS_SourceFile(fixturesDirectory, "types/NumberStringInterface.d.mts");

      const stubBuilder = new ClassStubBuilder(NST, "NumberStringInterface", "NumberStringClass");
      const classDecl = stubBuilder.createClassStub();

      expect(classDecl.name).toBe("NumberStringClass");
      expect(classDecl.typeParameters.length).toBe(0);

      const implementsEntries = Array.from(classDecl.implementsSet.values());
      expect(implementsEntries.length).toBe(1);
      expect(implementsEntries[0]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((implementsEntries[0] as LiteralTypedStructureImpl).stringValue).toBe("NumberStringInterface");

      expect(classDecl.methods.length).toBe(2);
      if (classDecl.methods.length === 2) {
        const repeatForward = classDecl.methods[0];
        expect(repeatForward.name).toBe("repeatForward");
        expect(repeatForward.typeParameters.length).toBe(0);
        expect(repeatForward.parameters.length).toBe(2);
        expect(repeatForward.parameters[0].name).toBe("s");
        expect(repeatForward.parameters[0].type).toBe("string");
        expect(repeatForward.parameters[1].name).toBe("n");
        expect(repeatForward.parameters[1].type).toBe("number");
        expect(repeatForward.returnType).toBe("string");
        expect(repeatForward.statements.length).toBe(0);

        const repeatBack = classDecl.methods[1];
        expect(repeatBack.name).toBe("repeatBack");
        expect(repeatBack.typeParameters.length).toBe(0);
        expect(repeatBack.parameters.length).toBe(2);
        expect(repeatBack.parameters[0].name).toBe("n");
        expect(repeatBack.parameters[0].type).toBe("number");
        expect(repeatBack.parameters[1].name).toBe("s");
        expect(repeatBack.parameters[1].type).toBe("string");
        expect(repeatBack.returnType).toBe("string");
        expect(repeatBack.statements.length).toBe(0);
      }

      expect(classDecl.ctors.length).toBe(0);
      expect(classDecl.properties.length).toBe(0);
      expect(classDecl.getAccessors.length).toBe(0);
      expect(classDecl.setAccessors.length).toBe(0);
    });

    it("with an index signature holding methods", () => {
      const NST = getTS_SourceFile(fixturesDirectory, "types/IndexSignatureWithMethod.d.mts");

      const stubBuilder = new ClassStubBuilder(NST, "IndexSignatureWithMethod", "Example");

      expect(
        () => stubBuilder.createClassStub()
      ).toThrowError("I cannot generate a class from index signatures without an index name resolver.");

      stubBuilder.indexNameResolver = function(signature): string[] {
        void(signature);
        return ["foo", "bar"];
      }

      const classDecl = stubBuilder.createClassStub();
      expect(classDecl.name).toBe("Example");
      expect(classDecl.typeParameters.length).toBe(0);

      const implementsEntries = Array.from(classDecl.implementsSet.values());
      expect(implementsEntries.length).toBe(1);
      expect(implementsEntries[0]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((implementsEntries[0] as LiteralTypedStructureImpl).stringValue).toBe("IndexSignatureWithMethod");

      expect(classDecl.methods.length).toBe(3);
      expect(classDecl.methods[0].name).toBe("hello");
      expect(classDecl.methods[1].name).toBe("foo");
      expect(classDecl.methods[2].name).toBe("bar");

      // Actually testing the method declarations would be a repeat of an earlier test.

      expect(classDecl.ctors.length).toBe(0);
      expect(classDecl.properties.length).toBe(0);
      expect(classDecl.getAccessors.length).toBe(0);
      expect(classDecl.setAccessors.length).toBe(0);
    });

    it("with an index signature holding properties", () => {
      const StringIndexSignatureFile = getTS_SourceFile(fixturesDirectory, "types/StringIndexSignature.d.mts");
      const stubBuilder = new ClassStubBuilder(StringIndexSignatureFile, "StringIndexSignature", "Example");

      expect(
        () => stubBuilder.createClassStub()
      ).toThrowError("I cannot generate a class from index signatures without an index name resolver.");

      stubBuilder.indexNameResolver = function(signature): string[] {
        void(signature);
        return ["foo", "bar"];
      }

      const classDecl = stubBuilder.createClassStub();
      expect(classDecl.name).toBe("Example");

      expect(classDecl.typeParameters.length).toBe(0);

      const implementsEntries = Array.from(classDecl.implementsSet.values());
      expect(implementsEntries.length).toBe(1);
      expect(implementsEntries[0]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((implementsEntries[0] as LiteralTypedStructureImpl).stringValue).toBe("StringIndexSignature");

      expect(classDecl.properties.length).toBe(3);
      if (classDecl.properties.length === 3) {
        const [hello, foo, bar] = classDecl.properties;
        expect(hello.name).toBe("hello");
        expect(hello.type).toBe("false");

        expect(foo.name).toBe("foo");
        expect(foo.type).toBe("boolean");

        expect(bar.name).toBe("bar");
        expect(bar.type).toBe("boolean");
      }

      expect(classDecl.ctors.length).toBe(0);
      expect(classDecl.methods.length).toBe(0);
      expect(classDecl.getAccessors.length).toBe(0);
      expect(classDecl.setAccessors.length).toBe(0);
    });
  });

  describe("with type aliases", () => {
    it("and no type parameters, pointing to an object literal holding methods", () => {
      const NST = getTS_SourceFile(
        {
          pathToDirectory: "#stage_utilities/fixtures",
          isAbsolutePath: true
        },
        "types/NumberStringType.d.mts"
      );

      const stubBuilder = new ClassStubBuilder(NST, "NumberStringType", "NumberStringClass");
      const classDecl = stubBuilder.createClassStub();

      expect(classDecl.name).toBe("NumberStringClass");
      expect(classDecl.typeParameters.length).toBe(0);

      const implementsEntries = Array.from(classDecl.implementsSet.values());
      expect(implementsEntries.length).toBe(1);
      expect(implementsEntries[0]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((implementsEntries[0] as LiteralTypedStructureImpl).stringValue).toBe("NumberStringType");

      expect(classDecl.methods.length).toBe(2);
      if (classDecl.methods.length === 2) {
        const repeatForward = classDecl.methods[0];
        expect(repeatForward.name).toBe("repeatForward");
        expect(repeatForward.typeParameters.length).toBe(0);
        expect(repeatForward.parameters.length).toBe(2);
        expect(repeatForward.parameters[0].name).toBe("s");
        expect(repeatForward.parameters[0].type).toBe("string");
        expect(repeatForward.parameters[1].name).toBe("n");
        expect(repeatForward.parameters[1].type).toBe("number");
        expect(repeatForward.returnType).toBe("string");
        expect(repeatForward.statements.length).toBe(0);

        const repeatBack = classDecl.methods[1];
        expect(repeatBack.name).toBe("repeatBack");
        expect(repeatBack.typeParameters.length).toBe(0);
        expect(repeatBack.parameters.length).toBe(2);
        expect(repeatBack.parameters[0].name).toBe("n");
        expect(repeatBack.parameters[0].type).toBe("number");
        expect(repeatBack.parameters[1].name).toBe("s");
        expect(repeatBack.parameters[1].type).toBe("string");
        expect(repeatBack.returnType).toBe("string");
        expect(repeatBack.statements.length).toBe(0);
      }

      expect(classDecl.ctors.length).toBe(0);
      expect(classDecl.properties.length).toBe(0);
      expect(classDecl.getAccessors.length).toBe(0);
      expect(classDecl.setAccessors.length).toBe(0);
    });

    it("and no type parameters, pointing to an conditional type structure", () => {
      const NST = getTS_SourceFile(
        {
          pathToDirectory: "#aspects/stubs/fixtures",
          isAbsolutePath: true,
        },
        "types/NumberStringType-conditional.d.mts"
      );

      const stubBuilder = new ClassStubBuilder(NST, "NumberStringType", "NumberStringClass");

      expect(
        () => stubBuilder.createClassStub()
      ).toThrowError(
        "alias node does not wrap a type literal.  I need a resolveTypeAliasStructure callback to get you an object literal."
      );

      stubBuilder.resolveTypeAliasStructure = function(
        alias: TypeAliasDeclarationImpl
      ): ObjectLiteralTypedStructureImpl
      {
        return (alias.typeStructure as ConditionalTypedStructure).trueType as ObjectLiteralTypedStructureImpl;
      }

      const classDecl = stubBuilder.createClassStub();

      expect(classDecl.name).toBe("NumberStringClass");
      expect(classDecl.typeParameters.length).toBe(0);

      const implementsEntries = Array.from(classDecl.implementsSet.values());
      expect(implementsEntries.length).toBe(1);
      expect(implementsEntries[0]).toBeInstanceOf(LiteralTypedStructureImpl);
      expect((implementsEntries[0] as LiteralTypedStructureImpl).stringValue).toBe("NumberStringType");

      expect(classDecl.methods.length).toBe(2);
      expect(classDecl.methods[0].name).toBe("repeatForward");
      expect(classDecl.methods[1].name).toBe("repeatBack");

      expect(classDecl.ctors.length).toBe(0);
      expect(classDecl.properties.length).toBe(0);
      expect(classDecl.getAccessors.length).toBe(0);
      expect(classDecl.setAccessors.length).toBe(0);
    });

    it("and type parameters, some with defaults, and a type argument", () => {
      const NST = getTS_SourceFile(
        {
          pathToDirectory: "#aspects/stubs/fixtures",
          isAbsolutePath: true,
        },
        "types/NumberStringWithTypeParameters.d.mts"
      );

      const stubBuilder = new ClassStubBuilder(NST, "NumberStringWithTypeParameters", "NumberStringClass");

      expect(
        () => stubBuilder.createClassStub()
      ).toThrowError("no context type argument and no default structure for type parameter 'StringType'");

      stubBuilder.typeArguments.push(
        new TemplateLiteralTypedStructureImpl([
          "prefix",
          new LiteralTypedStructureImpl("string"),
        ]),
        new LiteralTypedStructureImpl("Integer"),
      );

      const IntegerType = new TypeParameterDeclarationImpl("Integer");
      IntegerType.constraintStructure = new LiteralTypedStructureImpl("number");
      stubBuilder.classTypeParameters.push(IntegerType);

      const classDecl = stubBuilder.createClassStub();
      expect(classDecl.name).toBe("NumberStringClass");

      expect(classDecl.typeParameters.length).toBe(1);
      const [firstTypeParameter] = classDecl.typeParameters;
      expect(typeof firstTypeParameter).toBe("object");
      if (typeof firstTypeParameter === "object") {
        expect(firstTypeParameter.kind).toBe(StructureKind.TypeParameter);
        if (firstTypeParameter.kind === StructureKind.TypeParameter) {
          expect(firstTypeParameter.name).toBe("Integer");
          expect(firstTypeParameter.constraintStructure?.kind).toBe(TypeStructureKind.Literal);
          expect((firstTypeParameter.constraintStructure as LiteralTypedStructureImpl).stringValue).toBe("number");
        }
      }

      //#region implements
      expect(classDecl.implementsSet.size).toBe(1);
      const [firstImplements] = Array.from(classDecl.implementsSet.values());
      expect(firstImplements).toBeInstanceOf(TypeArgumentedTypedStructureImpl);
      if (firstImplements instanceof TypeArgumentedTypedStructureImpl) {
        expect(firstImplements.objectType.kind).toBe(TypeStructureKind.Literal);
        expect((firstImplements.objectType as LiteralTypedStructureImpl).stringValue).toBe("NumberStringWithTypeParameters");

        expect(firstImplements.childTypes.length).toBe(2);
        const [StringTypeDef, NumberTypeDef] = firstImplements.childTypes;

        expect(StringTypeDef.kind).toBe(TypeStructureKind.TemplateLiteral);
        expect((StringTypeDef as TemplateLiteralTypedStructureImpl).childTypes[0]).toBe("prefix");
        const StringTypeDefSecondChild = (StringTypeDef as TemplateLiteralTypedStructureImpl).childTypes[1];
        expect(StringTypeDefSecondChild).toBeInstanceOf(LiteralTypedStructureImpl);
        expect((StringTypeDefSecondChild as LiteralTypedStructureImpl).stringValue).toBe("string");

        expect(NumberTypeDef.kind).toBe(TypeStructureKind.Literal);
        expect((NumberTypeDef as LiteralTypedStructureImpl).stringValue).toBe("Integer");
      }
      //#endregion implements

      expect(classDecl.methods.length).toBe(1);
      if (classDecl.methods.length === 1) {
        const [ repeatForward ] = classDecl.methods;
        expect(repeatForward.name).toBe("repeatForward");
        expect(repeatForward.typeParameters.length).toBe(0);

        const { parameters, returnTypeStructure, statements } = repeatForward;
        const [ s, n ] = parameters;
        expect(parameters.length).toBe(2);
        expect(s.name).toBe("s");

        expect(s.typeStructure).toBeInstanceOf(TemplateLiteralTypedStructureImpl);
        if (s.typeStructure instanceof TemplateLiteralTypedStructureImpl) {
          expect(s.typeStructure.childTypes.length).toBe(2);
          const [prefixType, stringType] = s.typeStructure.childTypes;
          expect(prefixType).toBe("prefix");
          expect(stringType).toBeInstanceOf(LiteralTypedStructureImpl);
          if (stringType instanceof LiteralTypedStructureImpl)
            expect(stringType.stringValue).toBe("string");
        }

        expect(n.typeStructure?.kind).toBe(TypeStructureKind.Literal);
        expect((n.typeStructure as LiteralTypedStructureImpl).stringValue).toBe("Integer");

        expect(returnTypeStructure?.kind).toBe(TypeStructureKind.TemplateLiteral);
        if (returnTypeStructure instanceof TemplateLiteralTypedStructureImpl) {
          const { childTypes } = returnTypeStructure;
          expect(childTypes.length).toBe(2);
          const [ stringType, postfixType ] = childTypes;

          expect(stringType).toBeInstanceOf(LiteralTypedStructureImpl);
          expect((stringType as LiteralTypedStructureImpl).stringValue).toBe("string");

          expect(postfixType).toBeInstanceOf(StringTypedStructureImpl);
          expect((postfixType as StringTypedStructureImpl).stringValue).toBe("postfix");
        }

        expect(statements.length).toBe(0);
      }

      expect(classDecl.ctors.length).toBe(0);
      expect(classDecl.properties.length).toBe(0);
      expect(classDecl.getAccessors.length).toBe(0);
      expect(classDecl.setAccessors.length).toBe(0);
    });
  });
});
