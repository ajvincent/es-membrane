export type PrefixedNumber<Prefix extends string> = `${Prefix}:${number}`;

export type ObjectId = PrefixedNumber<"object" | "target" | "heldValues">;
export type ReferenceId = PrefixedNumber<"reference">;
export type SymbolId = PrefixedNumber<"symbol" | "target">;
export type WeakKeyId = ObjectId | SymbolId;
