let success: string | undefined;
try {
  //@ts-expect-error targetKey must be an object
  searchReferences("resultsKey", 6, [], true)
}
catch (ex) {
  success = (ex as Error).message;
}

report(["targetKeyIsNumber", success]);
