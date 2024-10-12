export type ParameterReferenceRecursive = (
  this: void,
  parameterReferenceMap: Map<string, Deferred<boolean>>,
  thisClassName: string,
  parameterLocation: ParameterLocation,
) => Promise<boolean>
