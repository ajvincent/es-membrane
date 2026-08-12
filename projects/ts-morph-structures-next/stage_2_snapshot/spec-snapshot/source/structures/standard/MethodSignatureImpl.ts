import {
  MethodSignatureImpl
} from "#stage_two/snapshot/source/exports.js";

describe("MethodSignatureImpl", () => {
  it("supports the returnType and returnTypeStructure properties", () => {
    const signature = new MethodSignatureImpl("foo");
    expect(signature.returnType).toBe(undefined);
    expect(signature.returnTypeStructure).toBe(undefined);
  });
});
