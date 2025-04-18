import "es-search-references/guest";

let success: string | undefined;
try {
  // @ts-expect-error not enough arguments
  searchReferences()
}
catch (ex) {
  success = (ex as Error).message;
}

report(["noArguments", success]);
