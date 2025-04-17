import "es-search-references-guest";

let success: string | undefined;
try {
  //@ts-expect-error null is not an object or a symbol
  searchReferences("resultsKey", null, [], true);
}
catch (ex) {
  success = (ex as Error).message;
}

report(["targetKeyIsNull", success]);
