import "es-search-references/guest";

let success: string | undefined;
try {
  //@ts-expect-error 6 is not an object or a symbol
  searchReferences("resultsKey", 6, [], true);
}
catch (ex) {
  success = (ex as Error).message;
}

report(["targetKeyIsNumber", success]);
