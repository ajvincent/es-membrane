/* This is generated code.  Do not edit directly.
   Instead, edit the types this file imports.
*/
import { NumberStringAndType } from "../fixtures/TypePatterns.mjs";

export default class NumberStringClass implements NumberStringAndType {
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

    get type(): string {
        throw new Error("not yet implemented");
    }

    set type(value: string) {
        void(value);
        throw new Error("not yet implemented");
    }
}
