import ClassDeclarationImpl from "../../source/base/ClassDeclarationImpl.mjs";
import MethodSignatureImpl from "../../source/base/MethodSignatureImpl.mjs";
import ParameterDeclarationImpl from "../../source/base/ParameterDeclarationImpl.mjs";

describe("base/ClassDeclarationImpl", () => {
  it("can create method declarations from method signatures", () => {
    const stringParam = new ParameterDeclarationImpl("s");
    stringParam.type = "string";

    const numberParam = new ParameterDeclarationImpl("n");
    numberParam.type = "number";

    const repeatForwardSignature = new MethodSignatureImpl("repeatForward");
    repeatForwardSignature.parameters.push(stringParam, numberParam);
    repeatForwardSignature.returnType = "string";

    const repeatBackSignature = new MethodSignatureImpl("repeatBack");
    repeatBackSignature.parameters.push(numberParam, stringParam);
    repeatBackSignature.returnType = "string";

    const classDeclaration = ClassDeclarationImpl.fromMethodsOnly([
      repeatForwardSignature,
      repeatBackSignature
    ]);

    expect(classDeclaration.methods?.length).toBe(2);
    if (Array.isArray(classDeclaration.methods) && (classDeclaration.methods.length >= 2)) {
      const firstMethod = classDeclaration.methods[0];
      expect(firstMethod.name).toBe("repeatForward");
      expect(firstMethod.parameters).toEqual([stringParam, numberParam]);
      expect(firstMethod.returnType).toEqual("string");

      expect(firstMethod.statements.length).toBe(0);

      const secondMethod = classDeclaration.methods[1];
      expect(secondMethod.name).toBe("repeatBack");
      expect(secondMethod.parameters).toEqual([numberParam, stringParam]);
      expect(secondMethod.returnType).toEqual("string");

      expect(secondMethod.statements.length).toBe(0);
    }
  });
});