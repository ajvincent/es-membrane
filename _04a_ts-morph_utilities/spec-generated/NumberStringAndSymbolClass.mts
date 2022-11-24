/* This is generated code.  Do not edit directly.
   Instead, edit the types this file imports.
*/
import { NumberStringAndSymbol, SymbolTypeKey } from "../fixtures/TypePatterns.mjs";

export default class NumberStringClass implements NumberStringAndSymbol {
    repeatForward(s: string, n: number) : string
    {
        void(s);
        void(n);
        throw new Error("not yet implemented");
    }

    repeatBack(n: number, s: string) : string
    {
        void(n);
        void(s);
        throw new Error("not yet implemented");
    }

    get [SymbolTypeKey](): boolean {
        throw new Error("not yet implemented");
    }

    set [SymbolTypeKey](value: boolean) {
        void(value);
        throw new Error("not yet implemented");
    }
}
