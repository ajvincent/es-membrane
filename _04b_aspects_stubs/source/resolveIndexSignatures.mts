import {
  StructureKind,
} from "ts-morph";

import {
  IndexSignatureDeclarationImpl,
  InterfaceDeclarationImpl,
  MethodSignatureImpl,
  ObjectLiteralTypedStructureImpl,
  ParameterDeclarationImpl,
  ParameterTypedStructure,
  PropertySignatureImpl,
  TypeStructureClassesMap,
  TypeStructureKind,
} from "#ts-morph_structures/exports.mjs";

export default function resolveIndexSignatures(
  structure: InterfaceDeclarationImpl | ObjectLiteralTypedStructureImpl,
  nameResolver: (signature: IndexSignatureDeclarationImpl) => string[],
): InterfaceDeclarationImpl | ObjectLiteralTypedStructureImpl
{
  if (structure.indexSignatures.length === 0)
    return structure;

  if (structure.kind === StructureKind.Interface)
    structure = InterfaceDeclarationImpl.clone(structure);
  else
    structure = ObjectLiteralTypedStructureImpl.clone(structure);

  const indexSignatures: IndexSignatureDeclarationImpl[] = structure.indexSignatures.splice(0, Infinity);
  indexSignatures.forEach(signature => {
    const names = nameResolver(signature);

    if ((signature.returnTypeStructure?.kind === TypeStructureKind.Function) && !signature.isReadonly) {
      const baseMethodSignature = new MethodSignatureImpl("");
      const { returnTypeStructure } = signature;

      returnTypeStructure.typeParameters.forEach(typeParam => {
        baseMethodSignature.typeParameters.push(typeParam);
      });
      returnTypeStructure.parameters.forEach(param => {
        baseMethodSignature.parameters.push(convertParameterFromTypeToImpl(param));
      });
      if (returnTypeStructure.restParameter) {
        const restParameter = convertParameterFromTypeToImpl(returnTypeStructure.restParameter);
        restParameter.isRestParameter = true;
        baseMethodSignature.parameters.push(restParameter);
      }

      if (returnTypeStructure.returnType)
        baseMethodSignature.returnTypeStructure = returnTypeStructure.returnType;

      names.forEach(name => {
        const methodSignature = MethodSignatureImpl.clone(baseMethodSignature);
        methodSignature.name = name;
        structure.methods.push(methodSignature);
      });
    }
    else {
      const baseProp = new PropertySignatureImpl("");
      if (signature.isReadonly)
        baseProp.isReadonly = true;
      if (signature.returnTypeStructure)
        baseProp.typeStructure = signature.returnTypeStructure;

      names.forEach(name => {
        const prop = PropertySignatureImpl.clone(baseProp);
        prop.name = name;
        structure.properties.push(prop);
      });
    }
  });

  return structure;
}

function convertParameterFromTypeToImpl(
  source: ParameterTypedStructure
): ParameterDeclarationImpl
{
  const impl = new ParameterDeclarationImpl(source.name.stringValue);
  if (source.typeStructure)
    impl.typeStructure = TypeStructureClassesMap.clone(source.typeStructure);
  return impl;
}
