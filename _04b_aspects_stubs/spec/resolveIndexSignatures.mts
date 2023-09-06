import {
  StructureKind,
  TypeNode,
} from "ts-morph";

import {
  ModuleSourceDirectory
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import getTS_SourceFile from "#stage_utilities/source/getTS_SourceFile.mjs";

import getTypeElementMemberedOwner from "../source/getTypeElementMemberedOwner.mjs";
import resolveIndexSignatures from "../source/resolveIndexSignatures.mjs";

import {
  IndexSignatureDeclarationImpl,
} from "#ts-morph_structures/exports.mjs";

describe("resolveIndexSignatures", () => {
  const fixturesDirectory: ModuleSourceDirectory = {
    pathToDirectory: "#aspects/stubs/fixtures",
    isAbsolutePath: true,
  };

  const neverConsole = (message: string, failingTypeNode: TypeNode): never => {
    void(message);
    void(failingTypeNode);
    throw new Error("unexpected");
  };

  it("returns the original interface when there is no index signature", () => {
    const NumberStringInterfaceFile = getTS_SourceFile(
      fixturesDirectory,
      "types/NumberStringInterface.d.mts"
    );

    const NST = getTypeElementMemberedOwner(
      NumberStringInterfaceFile,
      "NumberStringInterface",
      neverConsole
    );

    expect(resolveIndexSignatures(NST, (signature) => {
      void(signature);
      throw new Error("unreached");
    })).toBe(NST);
  });

  it("returns a clone of an interface, with the index signatures replaced", () => {
    const StringIndexSignatureFile = getTS_SourceFile(
      fixturesDirectory,
      "types/StringIndexSignature.d.mts"
    );

    const StringIndexSignature = getTypeElementMemberedOwner(
      StringIndexSignatureFile,
      "StringIndexSignature",
      neverConsole
    );
    expect(StringIndexSignature.kind).toBe(StructureKind.Interface);
    if (StringIndexSignature.kind !== StructureKind.Interface)
      return;

    let callbackSignature: IndexSignatureDeclarationImpl | undefined;
    const resolvedStructure = resolveIndexSignatures(
      StringIndexSignature, (signature): string[] => {
        callbackSignature = signature;
        return ["one", "two"];
      }
    );
    expect(callbackSignature).toEqual(StringIndexSignature.indexSignatures[0]);
    expect(resolvedStructure).not.toBe(StringIndexSignature);
    expect(resolvedStructure.kind).toBe(StructureKind.Interface);
    if (resolvedStructure.kind === StructureKind.Interface) {
      expect(resolvedStructure.name).toBe(StringIndexSignature.name);

      expect(resolvedStructure.properties.length).toBe(3);
      expect(resolvedStructure.properties[0]).toEqual(StringIndexSignature.properties[0]);

      expect(resolvedStructure.properties[1].name).toBe("one");
      expect(resolvedStructure.properties[1].type).toBe("boolean");

      expect(resolvedStructure.properties[2].name).toBe("two");
      expect(resolvedStructure.properties[2].type).toBe("boolean");

      expect(resolvedStructure.callSignatures.length).toBe(0);
      expect(resolvedStructure.constructSignatures.length).toBe(0);
      expect(resolvedStructure.indexSignatures.length).toBe(0);
      expect(resolvedStructure.methods.length).toBe(0);
    }
  });

  it("returns a clone of an interface, with methods when appropriate", () => {
    const WithMethodSignatureFile = getTS_SourceFile(
      fixturesDirectory,
      "types/IndexSignatureWithMethod.d.mts"
    );

    const WithMethodSignature = getTypeElementMemberedOwner(
      WithMethodSignatureFile,
      "IndexSignatureWithMethod",
      neverConsole
    );
    expect(WithMethodSignature.kind).toBe(StructureKind.Interface);
    if (WithMethodSignature.kind !== StructureKind.Interface)
      return;

      let callbackSignature: IndexSignatureDeclarationImpl | undefined;

      const resolvedStructure = resolveIndexSignatures(
        WithMethodSignature, (signature): string[] => {
          callbackSignature = signature;
          return ["one", "two"];
        }
      );

      expect(callbackSignature).toEqual(WithMethodSignature.indexSignatures[0]);
      expect(resolvedStructure).not.toBe(WithMethodSignature);
      expect(resolvedStructure.kind).toBe(StructureKind.Interface);

      if (resolvedStructure.kind === StructureKind.Interface) {
        expect(resolvedStructure.name).toBe(WithMethodSignature.name);

        expect(resolvedStructure.methods.length).toBe(3);
        expect(resolvedStructure.methods[0]).toEqual(WithMethodSignature.methods[0]);

        expect(resolvedStructure.methods[1].name).toBe("one");
        expect(resolvedStructure.methods[1].parameters.length).toBe(1);
        expect(resolvedStructure.methods[1].parameters[0].name).toBe("n");
        expect(resolvedStructure.methods[1].parameters[0].type).toBe("number");
        expect(resolvedStructure.methods[1].returnType).toBe("string");

        expect(resolvedStructure.methods[2].name).toBe("two");
        expect(resolvedStructure.methods[2].parameters.length).toBe(1);
        expect(resolvedStructure.methods[2].parameters[0].name).toBe("n");
        expect(resolvedStructure.methods[2].parameters[0].type).toBe("number");
        expect(resolvedStructure.methods[2].returnType).toBe("string");

        expect(resolvedStructure.callSignatures.length).toBe(0);
        expect(resolvedStructure.constructSignatures.length).toBe(0);
        expect(resolvedStructure.indexSignatures.length).toBe(0);
        expect(resolvedStructure.properties.length).toBe(0);
      }
  });
});
