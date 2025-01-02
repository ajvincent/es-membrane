import {
  ClassMembersMap,
  IntersectionTypeStructureImpl,
  LiteralTypeStructureImpl,
  MethodSignatureImpl,
  ParameterDeclarationImpl,
  TypeArgumentedTypeStructureImpl,
  UnionTypeStructureImpl,
} from "#stage_two/snapshot/source/exports.js";

import BaseModule from "./BaseModule.js";
import InternalJSDocTag from "../build/classTools/InternalJSDocTag.js";


export default
abstract class BaseClassModule extends BaseModule
{
  public classMembersMap?: ClassMembersMap;

  readonly abstract baseName: string;
  readonly abstract exportName: string;

  createCopyFieldsMethod(isStructureClass: boolean): MethodSignatureImpl
  {
    const methodSignature = new MethodSignatureImpl("[COPY_FIELDS]");

    const sourceParam = new ParameterDeclarationImpl("source");
    const targetParam = new ParameterDeclarationImpl("target");

    if (isStructureClass) {
      sourceParam.typeStructure = new TypeArgumentedTypeStructureImpl(
        LiteralTypeStructureImpl.get("OptionalKind"),
        [ LiteralTypeStructureImpl.get(this.baseName) ]
      );

      targetParam.typeStructure = LiteralTypeStructureImpl.get(this.exportName);
    }
    else {
      sourceParam.typeStructure = new IntersectionTypeStructureImpl([
        LiteralTypeStructureImpl.get(this.baseName),
        LiteralTypeStructureImpl.get("Structures")
      ]);

      targetParam.typeStructure = new IntersectionTypeStructureImpl([
        LiteralTypeStructureImpl.get(this.exportName),
        LiteralTypeStructureImpl.get("Structures")
      ]);

      this.addImports("ts-morph", [], [
        "Structures",
      ]);
    }

    methodSignature.docs.push(InternalJSDocTag);
    methodSignature.parameters.push(sourceParam, targetParam);
    methodSignature.returnTypeStructure = LiteralTypeStructureImpl.get("void");

    this.addImports("internal", ["COPY_FIELDS"], []);
    this.addImports("ts-morph", [], [ this.baseName ]);

    return methodSignature;
  }

  createToJSONMethod(): MethodSignatureImpl
  {
    this.addImports("internal", [], ["StructureClassToJSON"]);

    const methodSignature = new MethodSignatureImpl("toJSON");
    methodSignature.returnTypeStructure = new TypeArgumentedTypeStructureImpl(
      LiteralTypeStructureImpl.get("StructureClassToJSON"),
      [
        LiteralTypeStructureImpl.get(this.exportName)
      ]
    );
    return methodSignature;
  }

  createStructureIteratorMethod(): MethodSignatureImpl
  {
    this.addImports("public", [], ["StructureImpls", "TypeStructures"]);
    this.addImports("internal", ["STRUCTURE_AND_TYPES_CHILDREN"], []);

    const methodSignature = new MethodSignatureImpl("[STRUCTURE_AND_TYPES_CHILDREN]");
    methodSignature.docs.push(InternalJSDocTag);

    methodSignature.returnTypeStructure = new TypeArgumentedTypeStructureImpl(
      LiteralTypeStructureImpl.get("IterableIterator"),
      [
        new UnionTypeStructureImpl([
          LiteralTypeStructureImpl.get("StructureImpls"),
          LiteralTypeStructureImpl.get("TypeStructures")
        ])
      ]
    );
    return methodSignature;
  }
}
