import getTS_SourceFile from "#stage_utilities/source/getTS_SourceFile.mjs";

import {
  type ConditionalTypedStructure,
  InterfaceDeclarationImpl,
  ObjectLiteralTypedStructureImpl,
  TypeAliasDeclarationImpl
} from "#ts-morph_structures/exports.mjs";

import getTypeElementMemberedOwner from "../source/getTypeElementMemberedOwner.mjs";

describe("getTypeElementMemberedOwner()", () => {
  it("with an interface", () => {
    const NumberStringInterfaceFile = getTS_SourceFile(
      {
        pathToDirectory: "#aspects/stubs/fixtures",
        isAbsolutePath: true,
      },
      "types/NumberStringInterface.d.mts"
    );

    const NST = getTypeElementMemberedOwner(
      NumberStringInterfaceFile,
      "NumberStringInterface",
      (message, failingTypeNode) => {
        void(message);
        void(failingTypeNode);
        throw new Error("unexpected");
      }
    );

    expect(NST).toBeInstanceOf(InterfaceDeclarationImpl);
    if (!(NST instanceof InterfaceDeclarationImpl))
      return;

    expect(NST.callSignatures.length).toBe(0);
    expect(NST.constructSignatures.length).toBe(0);
    expect(NST.properties.length).toBe(0);
    expect(NST.indexSignatures.length).toBe(0);
    expect(NST.methods.length).toBe(2);

    expect(NST.methods[0].name).toBe("repeatForward");
    expect(NST.methods[1].name).toBe("repeatBack");
  });

  it("with a type alias to an object literal", () => {
    const NumberStringTypeFile = getTS_SourceFile(
      {
        pathToDirectory: "#stage_utilities/fixtures",
        isAbsolutePath: true
      },
      "types/NumberStringType.d.mts"
    );

    const NST = getTypeElementMemberedOwner(
      NumberStringTypeFile,
      "NumberStringType",
      (message, failingTypeNode) => {
        void(message);
        void(failingTypeNode);
        throw new Error("unexpected");
      }
    );

    expect(NST).toBeInstanceOf(ObjectLiteralTypedStructureImpl);
    if (!(NST instanceof ObjectLiteralTypedStructureImpl))
      return;

    expect(NST.callSignatures.length).toBe(0);
    expect(NST.constructSignatures.length).toBe(0);
    expect(NST.properties.length).toBe(0);
    expect(NST.indexSignatures.length).toBe(0);
    expect(NST.methods.length).toBe(2);

    expect(NST.methods[0].name).toBe("repeatForward");
    expect(NST.methods[1].name).toBe("repeatBack");
  });

  it("with a type alias to a type other than an object literal, with a helper passed in", () => {
    const NST_ConditionalFile = getTS_SourceFile(
      {
        pathToDirectory: "#aspects/stubs/fixtures",
        isAbsolutePath: true,
      },
      "types/NumberStringType-conditional.d.mts"
    );

    expect(() => {
      getTypeElementMemberedOwner(
        NST_ConditionalFile,
        "NumberStringType",
        (message, failingTypeNode) => {
          void(message);
          void(failingTypeNode);
          throw new Error("unexpected");
        }
      );
    }).toThrowError(
      "alias node does not wrap a type literal.  I need a resolveTypeAliasStructure callback to get you an object literal."
    );

    const NST = getTypeElementMemberedOwner(
      NST_ConditionalFile,
      "NumberStringType",
      (message, failingTypeNode) => {
        void(message);
        void(failingTypeNode);
        throw new Error("unexpected");
      },
      (alias: TypeAliasDeclarationImpl): ObjectLiteralTypedStructureImpl => {
        return (alias.typeStructure as ConditionalTypedStructure).trueType as ObjectLiteralTypedStructureImpl;
      }
    );

    expect(NST).toBeInstanceOf(ObjectLiteralTypedStructureImpl);
    if (!(NST instanceof ObjectLiteralTypedStructureImpl))
      return;

    expect(NST.callSignatures.length).toBe(0);
    expect(NST.constructSignatures.length).toBe(0);
    expect(NST.properties.length).toBe(0);
    expect(NST.indexSignatures.length).toBe(0);
    expect(NST.methods.length).toBe(2);

    expect(NST.methods[0].name).toBe("repeatForward");
    expect(NST.methods[1].name).toBe("repeatBack");
  });
});
