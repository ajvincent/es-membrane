export type PrefixedNumber<Prefix extends string> = `${Prefix}:${number}`;

export type ObjectId = PrefixedNumber<"object">;
export type ReferenceId = PrefixedNumber<"reference">;
export type SymbolId = PrefixedNumber<"symbol">;
