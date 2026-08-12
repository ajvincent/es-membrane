import {
  ConstructorDeclarationImpl,
  ConstructSignatureDeclarationImpl,
  JSDocImpl,
  JSDocTagImpl,
  LiteralTypeStructureImpl,
  MethodDeclarationImpl,
  MethodSignatureImpl,
  ParameterDeclarationImpl,
  PropertyDeclarationImpl,
  PropertySignatureImpl,
  TypeParameterDeclarationImpl,
} from "#stage_two/snapshot/source/exports.js";

describe("static fromSignature() methods generally work", () => {
  const tag = new JSDocTagImpl("param");
  tag.text = "Hi Mom";
  const baseDoc = new JSDocImpl;
  baseDoc.description = "Hello World";
  baseDoc.tags.push(tag);

  let doc: JSDocImpl;
  beforeEach(() => {
    doc = JSDocImpl.clone(baseDoc);
  });

  function checkDoc(clonedDoc: JSDocImpl): void {
    expect(clonedDoc).not.toBe(doc);
    expect(clonedDoc.description).toBe("Hello World");
    expect(clonedDoc.tags.length).toBe(1);
    expect(clonedDoc.tags[0]).not.toBe(tag);
    expect(clonedDoc.tags[0].tagName).toBe(tag.tagName);
    expect(clonedDoc.tags[0].text).toBe(tag.text);
  }

  it("on ConstructorDeclarationImpl", () => {
    const signature = new ConstructSignatureDeclarationImpl;
    signature.docs.push(doc);
    signature.leadingTrivia.push("// leading signature");
    signature.trailingTrivia.push("// trailing signature");

    signature.typeParameters.push(new TypeParameterDeclarationImpl("SignatureType"));
    {
      const param = new ParameterDeclarationImpl("mySignature");
      param.typeStructure = LiteralTypeStructureImpl.get("SignatureType");
      signature.parameters.push(param);
    }

    signature.returnTypeStructure = LiteralTypeStructureImpl.get("symbol");

    const decl: ConstructorDeclarationImpl = ConstructorDeclarationImpl.fromSignature(signature);
    checkDoc(decl.docs[0] as JSDocImpl);
    expect(decl.leadingTrivia).toEqual(signature.leadingTrivia);
    expect(decl.leadingTrivia).not.toBe(signature.leadingTrivia);
    expect(decl.trailingTrivia).toEqual(signature.trailingTrivia);
    expect(decl.trailingTrivia).not.toBe(signature.trailingTrivia);

    expect(decl.typeParameters.length).toBe(1);
    if (decl.typeParameters.length > 0) {
      const typeParam = decl.typeParameters[0];
      expect(typeof typeParam).toBe("object");
      if (typeof typeParam === "object") {
        expect(typeParam.name).toBe("SignatureType");
      }
      expect(typeParam).not.toBe(signature.typeParameters[0]);
    }

    expect(decl.parameters.length).toBe(1);
    if (decl.parameters.length > 0) {
      const param = decl.parameters[0];
      expect(param.name).toBe("mySignature");
      expect(param.typeStructure).toBe(LiteralTypeStructureImpl.get("SignatureType"));
      expect(param).not.toBe(signature.parameters[0]);
    }
  });

  it("on MethodDeclarationImpl with isStatic: false", () => {
    const signature = new MethodSignatureImpl("foo");
    signature.docs.push(doc);
    signature.leadingTrivia.push("// leading signature");
    signature.trailingTrivia.push("// trailing signature");
    signature.hasQuestionToken = true;

    signature.typeParameters.push(new TypeParameterDeclarationImpl("SignatureType"));
    {
      const param = new ParameterDeclarationImpl("mySignature");
      param.typeStructure = LiteralTypeStructureImpl.get("SignatureType");
      signature.parameters.push(param);
    }

    signature.returnTypeStructure = LiteralTypeStructureImpl.get("symbol");

    const decl: MethodDeclarationImpl = MethodDeclarationImpl.fromSignature(false, signature);

    expect(decl.isStatic).toBe(false);
    expect(decl.name).toBe(signature.name);
    expect(decl.hasQuestionToken).toBe(signature.hasQuestionToken);

    checkDoc(decl.docs[0] as JSDocImpl);
    expect(decl.leadingTrivia).toEqual(signature.leadingTrivia);
    expect(decl.leadingTrivia).not.toBe(signature.leadingTrivia);
    expect(decl.trailingTrivia).toEqual(signature.trailingTrivia);
    expect(decl.trailingTrivia).not.toBe(signature.trailingTrivia);

    expect(decl.typeParameters.length).toBe(1);
    if (decl.typeParameters.length > 0) {
      const typeParam = decl.typeParameters[0];
      expect(typeof typeParam).toBe("object");
      if (typeof typeParam === "object") {
        expect(typeParam.name).toBe("SignatureType");
      }
      expect(typeParam).not.toBe(signature.typeParameters[0]);
    }

    expect(decl.parameters.length).toBe(1);
    if (decl.parameters.length > 0) {
      const param = decl.parameters[0];
      expect(param.name).toBe("mySignature");
      expect(param.typeStructure).toBe(LiteralTypeStructureImpl.get("SignatureType"));
      expect(param).not.toBe(signature.parameters[0]);
    }

    expect(decl.returnTypeStructure).toBe(LiteralTypeStructureImpl.get("symbol"));
  });

  it("on MethodDeclarationImpl with isStatic: true", () => {
    const signature = new MethodSignatureImpl("foo");
    signature.docs.push(doc);
    signature.leadingTrivia.push("// leading signature");
    signature.trailingTrivia.push("// trailing signature");
    //signature.hasQuestionToken = true;

    signature.typeParameters.push(new TypeParameterDeclarationImpl("SignatureType"));
    {
      const param = new ParameterDeclarationImpl("mySignature");
      param.typeStructure = LiteralTypeStructureImpl.get("SignatureType");
      signature.parameters.push(param);
    }

    signature.returnTypeStructure = LiteralTypeStructureImpl.get("symbol");

    const decl: MethodDeclarationImpl = MethodDeclarationImpl.fromSignature(true, signature);

    expect(decl.isStatic).toBe(true);
    expect(decl.name).toBe(signature.name);
    expect(decl.hasQuestionToken).toBe(signature.hasQuestionToken);

    checkDoc(decl.docs[0] as JSDocImpl);
    expect(decl.leadingTrivia).toEqual(signature.leadingTrivia);
    expect(decl.leadingTrivia).not.toBe(signature.leadingTrivia);
    expect(decl.trailingTrivia).toEqual(signature.trailingTrivia);
    expect(decl.trailingTrivia).not.toBe(signature.trailingTrivia);

    expect(decl.typeParameters.length).toBe(1);
    if (decl.typeParameters.length > 0) {
      const typeParam = decl.typeParameters[0];
      expect(typeof typeParam).toBe("object");
      if (typeof typeParam === "object") {
        expect(typeParam.name).toBe("SignatureType");
      }
      expect(typeParam).not.toBe(signature.typeParameters[0]);
    }

    expect(decl.parameters.length).toBe(1);
    if (decl.parameters.length > 0) {
      const param = decl.parameters[0];
      expect(param.name).toBe("mySignature");
      expect(param.typeStructure).toBe(LiteralTypeStructureImpl.get("SignatureType"));
      expect(param).not.toBe(signature.parameters[0]);
    }

    expect(decl.returnTypeStructure).toBe(LiteralTypeStructureImpl.get("symbol"));
  });

  it("on PropertyDeclarationImpl with isStatic: false", () => {
    const signature = new PropertySignatureImpl("foo");
    signature.docs.push(doc);
    signature.leadingTrivia.push("// leading signature");
    signature.trailingTrivia.push("// trailing signature");
    signature.hasQuestionToken = true;

    //signature.isReadonly = true;
    signature.typeStructure = LiteralTypeStructureImpl.get("NumberStringType");

    const decl: PropertyDeclarationImpl = PropertyDeclarationImpl.fromSignature(false, signature);

    expect(decl.isStatic).toBe(false);
    expect(decl.name).toBe(signature.name);
    expect(decl.hasQuestionToken).toBe(signature.hasQuestionToken);

    checkDoc(decl.docs[0] as JSDocImpl);
    expect(decl.leadingTrivia).toEqual(signature.leadingTrivia);
    expect(decl.leadingTrivia).not.toBe(signature.leadingTrivia);
    expect(decl.trailingTrivia).toEqual(signature.trailingTrivia);
    expect(decl.trailingTrivia).not.toBe(signature.trailingTrivia);

    expect(decl.isReadonly).toBe(signature.isReadonly);
    expect(decl.typeStructure).toBe(LiteralTypeStructureImpl.get("NumberStringType"));
  });

  it("on PropertyDeclarationImpl with isStatic: true", () => {
    const signature = new PropertySignatureImpl("foo");
    signature.docs.push(doc);
    signature.leadingTrivia.push("// leading signature");
    signature.trailingTrivia.push("// trailing signature");
    //signature.hasQuestionToken = true;

    signature.isReadonly = true;
    signature.typeStructure = LiteralTypeStructureImpl.get("NumberStringType");

    const decl: PropertyDeclarationImpl = PropertyDeclarationImpl.fromSignature(true, signature);

    expect(decl.isStatic).toBe(true);
    expect(decl.name).toBe(signature.name);
    expect(decl.hasQuestionToken).toBe(signature.hasQuestionToken);

    checkDoc(decl.docs[0] as JSDocImpl);
    expect(decl.leadingTrivia).toEqual(signature.leadingTrivia);
    expect(decl.leadingTrivia).not.toBe(signature.leadingTrivia);
    expect(decl.trailingTrivia).toEqual(signature.trailingTrivia);
    expect(decl.trailingTrivia).not.toBe(signature.trailingTrivia);

    expect(decl.isReadonly).toBe(signature.isReadonly);
    expect(decl.typeStructure).toBe(LiteralTypeStructureImpl.get("NumberStringType"));
  });
});
