export declare function buildReplacementMap(
  packageImports: Record<string, string | null>
): ReadonlyMap<RegExp, string | null>;

export declare function getReplacement(
  replacementMap: ReadonlyMap<RegExp, string | null>,
  specifier: string,
  parentURL: string,
): string;
