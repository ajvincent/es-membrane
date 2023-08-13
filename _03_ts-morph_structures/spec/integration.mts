import getTS_SourceFile from "#stage_utilities/source/getTS_SourceFile.mjs";
import {
  ModuleSourceDirectory,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import {
  ClassDeclarationImpl,
  IndexSignatureDeclarationImpl,
  InterfaceDeclarationImpl,
  LiteralTypedStructureImpl,
  /*
  PropertyDeclarationImpl,
  */
  PropertySignatureImpl,
  SourceFileImpl,
  TypeArgumentedTypedStructureImpl,
  TypeParameterDeclarationImpl,
  getTypeAugmentedStructure
} from "#ts-morph_structures/exports.mjs";

xit("ts-morph-structures: integration test", () => {
  let NST_InterfaceStructure = new InterfaceDeclarationImpl("notUsed");

  {
    const projectDir: ModuleSourceDirectory = {
      importMeta: import.meta,
      pathToDirectory: "../../.."
    };

    const NumberStringTypeFile = getTS_SourceFile(
      projectDir, "_01_stage_utilities/fixtures/types/NumberStringType.d.mts"
    );
    const NST_Node = NumberStringTypeFile.getInterfaceOrThrow("NumberStringType");

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
  }

  const newSourceStructure = new SourceFileImpl;

  {
    const ValueWrapperStructure = new InterfaceDeclarationImpl("ValueWrapper");
    newSourceStructure.statements.push(ValueWrapperStructure);

    const typeParameter = new TypeParameterDeclarationImpl("WrappedType");
    ValueWrapperStructure.typeParameters.push(typeParameter);
    typeParameter.constraint = "string";

    const valueProperty = new PropertySignatureImpl("value");
    ValueWrapperStructure.properties.push(valueProperty);
    valueProperty.type = "WrappedType";
  }

  {
    const ObjectWrapperStructure = new InterfaceDeclarationImpl("ObjectWrapper");
    newSourceStructure.statements.push(ObjectWrapperStructure);

    const indexSignature = new IndexSignatureDeclarationImpl;
    ObjectWrapperStructure.indexSignatures.push(indexSignature);
    indexSignature.keyName = "key";
    indexSignature.keyType = "string";

    const returnTypeStructure = new TypeArgumentedTypedStructureImpl(
      new LiteralTypedStructureImpl("ValueWrapper")
    );
    returnTypeStructure.elements.push(new LiteralTypedStructureImpl("key"));
    indexSignature.returnTypeStructure = returnTypeStructure;
  }

  const classDeclaration = new ClassDeclarationImpl;
  newSourceStructure.statements.push(classDeclaration);
  /*
  {
    const implementsStructure = new TypeArgumentedTypedStructureImpl(
      new LiteralTypedStructureImpl("ObjectWrapper")
    )
  }
  */

  void(NST_InterfaceStructure);
});
