import type {
  PrefixedNumber
} from "../../utilities/StringCounter.ts";

export type ObjectId = PrefixedNumber<"object">;
export type ReferenceId = PrefixedNumber<"reference">;
