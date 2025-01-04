import {
  StructureMetaDictionaries,
} from "#stage_two/generation/build/structureMeta/DataClasses.js";

import fillDictionaries from "#stage_two/generation/build/structureMeta/fillDictionaries.js";

it("fillDictionaries works", () => {
  const dictionaries = new StructureMetaDictionaries;

  fillDictionaries(dictionaries);

  expect(dictionaries.unions.has("StatementStructures")).toBe(true);
  expect(dictionaries.unions.has("Structures")).toBe(true);

  { // test ClassDeclarationStructure
    const structureDef = dictionaries.structures.get("ClassDeclarationStructure")!;

    expect(structureDef.structureName).toBe("ClassDeclarationStructure");
    expect(structureDef.structureKindName).toBe("Class");

    expect(structureDef.booleanKeys.size).toBe(0);
    expect(Array.from(structureDef.decoratorKeys).sort()).toEqual([
      "AbstractableNodeStructure",
      "AmbientableNodeStructure",
      "DecoratableNodeStructure",
      "ExportableNodeStructure",
      "JSDocableNodeStructure",
      "NameableNodeStructure",
      "Structure",
      "TypeParameteredNodeStructure",
    ]);

    expect(Array.from(structureDef.structureFields.keys()).sort()).toEqual([
      "extends"
    ]);

    const _extends = structureDef.structureFields.get("extends");
    if (_extends) {
      expect(_extends.fromTypeName).toBe("ClassLikeDeclarationBaseSpecificStructure");
      expect(_extends.hasQuestionToken).toBe(true);
      expect(_extends.mayBeString).toBe(true);
      expect(_extends.mayBeUndefined).toBe(false);
      expect(_extends.mayBeWriter).toBe(true);
      expect(_extends.otherTypes).toEqual([]);
    }

    const name = structureDef.structureFields.get("name");
    if (name) {
      expect(name.fromTypeName).toBe(undefined);
      expect(name.hasQuestionToken).toBe(true);
      expect(name.mayBeString).toBe(true);
      expect(name.mayBeUndefined).toBe(false);
      expect(name.mayBeWriter).toBe(false);
      expect(name.otherTypes).toEqual([]);
    }

    expect(Array.from(structureDef.structureFieldArrays.keys()).sort()).toEqual([
      "ctors", "getAccessors", "implements", "methods", "properties", "setAccessors", "staticBlocks"
    ]);

    const ctors = structureDef.structureFieldArrays.get("ctors");
    if (ctors) {
      expect(ctors.fromTypeName).toBe("ClassLikeDeclarationBaseSpecificStructure");
      expect(ctors.hasQuestionToken).toBe(true);
      expect(ctors.mayBeString).toBe(false);
      expect(ctors.mayBeUndefined).toBe(false);
      expect(ctors.mayBeWriter).toBe(false);

      expect(ctors.otherTypes.length).toBe(1);
      const [value] = ctors.otherTypes;
      if (value) {
        expect(value.isOptionalKind).toBe(true);
        expect(value.structureName).toBe("ConstructorDeclarationStructure");
        expect(value.tsmorph_Type).toBe(undefined);
        expect(value.unionName).toBe(undefined);
      }

      // tests for the other fields are redundant
    }
  }

  { // test JsxElementStructure
    const structureDef = dictionaries.structures.get("JsxElementStructure")!;

    expect(Array.from(structureDef.structureFieldArrays.keys()).sort()).toEqual([
      "attributes", "children"
    ]);
    const attributes = structureDef.structureFieldArrays.get("attributes");
    if (attributes) {
      expect(attributes.fromTypeName).toBe("JsxElementSpecificStructure");
      expect(attributes.hasQuestionToken).toBe(true);
      expect(attributes.mayBeString).toBe(false);
      expect(attributes.mayBeUndefined).toBe(false);
      expect(attributes.mayBeWriter).toBe(false);
      expect(attributes.otherTypes.length).toBe(2);

      const [jsxAttribute, jsxSpreadAttribute] = attributes.otherTypes;
      if (jsxAttribute) {
        expect(jsxAttribute.isOptionalKind).toBe(true);
        expect(jsxAttribute.structureName).toBe("JsxAttributeStructure");
        expect(jsxAttribute.tsmorph_Type).toBeUndefined();
        expect(jsxAttribute.unionName).toBeUndefined();
      }

      if (jsxSpreadAttribute) {
        expect(jsxSpreadAttribute.isOptionalKind).toBe(false);
        expect(jsxSpreadAttribute.structureName).toBe("JsxSpreadAttributeStructure");
        expect(jsxSpreadAttribute.tsmorph_Type).toBeUndefined();
        expect(jsxSpreadAttribute.unionName).toBeUndefined();
      }
    }

    // test for "children" is redundant, as are tests for structureFields
  }

  { // test TypeAliasDeclarationStructure: type property shows up three times
    const structureDef = dictionaries.structures.get("TypeAliasDeclarationStructure")!;
    const typeProperty = structureDef.structureFields.get("type")!;
    expect(typeProperty.fromTypeName).toBeUndefined();
    expect(typeProperty.hasQuestionToken).toBeFalse();
    expect(typeProperty.mayBeString).toBeTrue();
    expect(typeProperty.mayBeUndefined).toBeFalse();
    expect(typeProperty.mayBeWriter).toBeTrue();
    expect(typeProperty.otherTypes.length).toBe(0);
  }

  { // test CallSignatureDeclarationStructure: SignaturedDeclarationStructure should be replaced
    const structureDef = dictionaries.structures.get("CallSignatureDeclarationStructure")!;
    expect(structureDef.decoratorKeys.has("SignaturedDeclarationStructure")).toBeFalse();
    expect(structureDef.decoratorKeys.has("ParameteredNodeStructure")).toBeTrue();
    expect(structureDef.decoratorKeys.has("ReturnTypedNodeStructure")).toBeTrue();
  }

  { // test Structure
    const decoratorDef = dictionaries.decorators.get("Structure")!;
    expect(decoratorDef.booleanKeys.size).toBe(0);
    expect(decoratorDef.structureFields.size).toBe(0);
    expect(decoratorDef.decoratorKeys.size).toBe(0);

    expect(Array.from(decoratorDef.structureFieldArrays.keys()).sort()).toEqual([
      "leadingTrivia", "trailingTrivia"
    ]);

    const leadingTrivia = decoratorDef.structureFieldArrays.get("leadingTrivia")!;
    expect(leadingTrivia.mayBeString).toBeTrue();
    expect(leadingTrivia.mayBeWriter).toBeTrue();
    expect(leadingTrivia.hasQuestionToken).toBeTrue();
    expect(leadingTrivia.mayBeUndefined).toBeFalse();
    expect(leadingTrivia.otherTypes).toEqual([]);

    expect(decoratorDef.structureFields.size).toBe(0);

    // trailingTrivial test is redundant
  }

  // replaced by its constituent decorators
  expect(dictionaries.decorators.has("SignaturedDeclarationStructure")).toBeFalse();

  { // test ExportableNodeStructure
    const decoratorDef = dictionaries.decorators.get("ExportableNodeStructure")!;
    expect(decoratorDef.decoratorKeys.size).toBe(0);
    expect(decoratorDef.structureFieldArrays.size).toBe(0);
    expect(decoratorDef.structureFields.size).toBe(0);

    expect(Array.from(decoratorDef.booleanKeys).sort()).toEqual([
      "isDefaultExport", "isExported"
    ]);
  }

  const countMap = dictionaries.getDecoratorCountMap();
  expect(countMap.get("Structure")).toBeGreaterThan(countMap.get("JSDocableNodeStructure")!);

  const unknownNames: string[] = [];
  for (const [key, str] of dictionaries.structures) {
    if (!str.structureKindName)
      unknownNames.push(key)
  }
  expect(unknownNames).toEqual([]);
});
