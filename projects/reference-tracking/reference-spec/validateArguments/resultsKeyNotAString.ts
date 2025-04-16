let success: string | undefined;
try {
  // @ts-expect-error resultsKey is not a string
  searchReferences(15, {}, [], true)
}
catch (ex) {
  success = (ex as Error).message;
}

report(["resultsKeyMustBeAString", success]);
