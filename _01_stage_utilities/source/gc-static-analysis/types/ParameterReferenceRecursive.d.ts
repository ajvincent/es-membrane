export type ParameterReferenceRecursive = (
  this: void,
  parameterReferenceMap: Map<string, Deferred<boolean>>,
  parameterLocation: ParameterLocation,
) => Promise<boolean>
