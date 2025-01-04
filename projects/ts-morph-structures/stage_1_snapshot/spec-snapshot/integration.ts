// #region preamble
import {
  ModuleKind,
  ModuleResolutionKind,
  Project,
  ProjectOptions,
  ScriptTarget,
  SourceFile,
  Structure,
  forEachStructureChild,
} from "ts-morph";

import getTS_SourceFile from "#utilities/source/getTS_SourceFile.js";
import {
  ModuleSourceDirectory,
} from "#utilities/source/AsyncSpecModules.js";

import {
  ArrayTypedStructureImpl,
  ClassDeclarationImpl,
  ConditionalTypedStructureImpl,
  FunctionTypedStructureImpl,
  ImportDeclarationImpl,
  ImportSpecifierImpl,
  IndexedAccessTypedStructureImpl,
  InterfaceDeclarationImpl,
  LiteralTypedStructureImpl,
  MappedTypeTypedStructureImpl,
  MethodDeclarationImpl,
  MemberedObjectTypeStructureImpl,
  ParameterTypedStructureImpl,
  PrefixOperatorsTypedStructureImpl,
  PropertySignatureImpl,
  SourceFileImpl,
  TypeAliasDeclarationImpl,
  TypeArgumentedTypedStructureImpl,
  TypeParameterDeclarationImpl,
  getTypeAugmentedStructure
} from "#stage_one/prototype-snapshot/exports.js";

// #endregion preamble

it("ts-morph-structures: integration test", () => {
  const stageDir: ModuleSourceDirectory = {
    pathToDirectory: "#stage_one",
    isAbsolutePath: true
  };

  // get the NumberStringType interface
  let NST_InterfaceStructure = new InterfaceDeclarationImpl("notUsed");
  {
    const NumberStringClassFile = getTS_SourceFile(
      stageDir, "fixtures/ecma_references/NumberStringClass.ts"
    );
    const NST_Node = NumberStringClassFile.getInterfaceOrThrow("NumberStringType");

    const result = getTypeAugmentedStructure(
      NST_Node, (message, failingTypeNode) => {
        void(message);
        void(failingTypeNode);
      }
    );
    expect(result.failures.length).toBe(0);
    expect(result.rootStructure).toBeInstanceOf(InterfaceDeclarationImpl);

    if (result.rootStructure instanceof InterfaceDeclarationImpl)
      NST_InterfaceStructure = result.rootStructure;
    else
      return;
  }

  const newSourceStructure = new SourceFileImpl;

  // imports
  {
    const SetReturnTypeImport = new ImportDeclarationImpl("type-fest");
    SetReturnTypeImport.namedImports.push(new ImportSpecifierImpl("SetReturnType"));
    SetReturnTypeImport.isTypeOnly = true;

    const NST_Type_Import = new ImportDeclarationImpl("./NumberStringClass.js");
    const NST_Specifier = new ImportSpecifierImpl("NumberStringType");
    NST_Specifier.isTypeOnly = true;
    NST_Type_Import.namedImports.push(NST_Specifier);

    newSourceStructure.statements.push(SetReturnTypeImport, NST_Type_Import);
  }

  // type ValueWrapper<T> = { value: T };
  {
    const ValueWrapperAlias = new TypeAliasDeclarationImpl("ValueWrapper");
    newSourceStructure.statements.push(ValueWrapperAlias);

    ValueWrapperAlias.typeParameters.push(new TypeParameterDeclarationImpl("T"));

    const valueProperty = new PropertySignatureImpl("value");
    valueProperty.type = "T";
    ValueWrapperAlias.typeStructure = new MemberedObjectTypeStructureImpl([
      valueProperty,
    ]);
  }

  /*
  type ObjectWrapper<Type> = {
    [key in keyof Type]: Type[key] extends (...args: any[]) => any  ?
      SetReturnType<
        Type[key],
        ValueWrapper<
          ReturnType<Type[key]>
        >
      > : Type[key];
  }
  */
  {
    const ObjectWrapperAlias = new TypeAliasDeclarationImpl("ObjectWrapper");
    newSourceStructure.statements.push(ObjectWrapperAlias);

    ObjectWrapperAlias.typeParameters.push(new TypeParameterDeclarationImpl("Type"));

    const Type_Literal = new LiteralTypedStructureImpl("Type");
    const Key_Literal = new LiteralTypedStructureImpl("key");
    const TypeKeyIndexed = new IndexedAccessTypedStructureImpl(
      Type_Literal, Key_Literal
    );

    const SetReturnType_Structure = new TypeArgumentedTypedStructureImpl(
      new LiteralTypedStructureImpl("SetReturnType"),
      [
        TypeKeyIndexed,
        new TypeArgumentedTypedStructureImpl(
          new LiteralTypedStructureImpl("ValueWrapper"),
          [
            new TypeArgumentedTypedStructureImpl(
              new LiteralTypedStructureImpl("ReturnType"),
              [TypeKeyIndexed]
            )
          ]
        )
      ]
    );

    const RestAnyFunction_Structure = new FunctionTypedStructureImpl({
      restParameter: new ParameterTypedStructureImpl(
        "args",
        new ArrayTypedStructureImpl(new LiteralTypedStructureImpl("any"))
      ),
      returnType: new LiteralTypedStructureImpl("any"),
    });

    const conditionalStructure = new ConditionalTypedStructureImpl({
      checkType: TypeKeyIndexed,
      extendsType: RestAnyFunction_Structure,
      trueType: SetReturnType_Structure,
      falseType: TypeKeyIndexed
    });

    const keyInKeyofStructure = new TypeParameterDeclarationImpl("key");
    keyInKeyofStructure.constraintStructure = new PrefixOperatorsTypedStructureImpl(
      ["keyof"], Type_Literal
    );

    const mappedTypeStructure = new MappedTypeTypedStructureImpl(
      keyInKeyofStructure
    );
    mappedTypeStructure.type = conditionalStructure;

    ObjectWrapperAlias.typeStructure = mappedTypeStructure;
  }

  /*
  export default class NumberStringWrapper
  implements ObjectWrapper<NumberStringType>
  {
    repeatForward(s: string, n: number): ValueWrapper<string> {
      return { value: s.repeat(n) };
    }
    repeatBack(n: number, s: string): ValueWrapper<string> {
      return { value: s.repeat(n) };
    }
  }
  */
  {
    const classDeclaration = new ClassDeclarationImpl;
    newSourceStructure.statements.push(classDeclaration);

    classDeclaration.name = "NumberStringWrapper";
    classDeclaration.isExported = true;
    classDeclaration.isDefaultExport = true;

    classDeclaration.implementsSet.add(new TypeArgumentedTypedStructureImpl(
      new LiteralTypedStructureImpl("ObjectWrapper"), [
        new LiteralTypedStructureImpl("NumberStringType")
      ]
    ));

    const ValueWrapperString = new TypeArgumentedTypedStructureImpl(
      new LiteralTypedStructureImpl("ValueWrapper"), [
        new LiteralTypedStructureImpl("string")
      ]
    );

    const methods: MethodDeclarationImpl[] = NST_InterfaceStructure.methods.map(
      signature => MethodDeclarationImpl.fromSignature(signature)
    );

    methods.forEach(method => {
      method.returnTypeStructure = ValueWrapperString;
      method.statements.push("return { value: s.repeat(n) };");
    });

    classDeclaration.methods.push(...methods);
  }

  // create the source file
  let NumberStringWrapper_File: SourceFile;
  {
    const TSC_CONFIG: ProjectOptions = {
      "compilerOptions": {
        "lib": ["es2022"],
        "module": ModuleKind.ESNext,
        "target": ScriptTarget.ESNext,
        "moduleResolution": ModuleResolutionKind.NodeNext,
      },
      skipAddingFilesFromTsConfig: true,
      useInMemoryFileSystem: true,
    };

    const project = new Project(TSC_CONFIG);
    NumberStringWrapper_File = project.createSourceFile("NumberStringWrapper.ts", newSourceStructure);

    const source = NumberStringWrapper_File.print();
    project.removeSourceFile(NumberStringWrapper_File);

    NumberStringWrapper_File = project.createSourceFile("NumberStringWrapper.ts", source);
  }

  // reference structure
  const referenceStructure = getTS_SourceFile(
    stageDir, "fixtures/ecma_references/NumberStringWrapped.ts"
  ).getStructure();

  const actualStructure = NumberStringWrapper_File.getStructure();

  // whitespace cleanup
  forEachStructureChild(referenceStructure, structure => {
    if (Structure.isTyped(structure))
      structure.type = (structure.type as string).replace(/\s+/gm, " ");
  });
  forEachStructureChild(actualStructure, structure => {
    if (Structure.isTyped(structure))
      structure.type = (structure.type as string).replace(/\s+/gm, " ");
  });

  expect(actualStructure).toEqual(referenceStructure);
});
