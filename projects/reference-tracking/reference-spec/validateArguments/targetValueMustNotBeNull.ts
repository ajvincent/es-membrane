let success: string | undefined;
try {
  //@ts-expect-error targetKey must be an object
  searchReferences("resultsKey", null, [], true)
}
catch (ex) {
  success = (ex as Error).message;
}

report(["targetKeyIsNull", success]);
