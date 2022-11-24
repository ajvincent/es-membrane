/* This is generated code.  Do not edit directly.
   Instead, edit the types this file imports.
*/
import { NumberStringAndIllegal } from "../fixtures/TypePatterns.mjs";

export default class NumberStringClass implements NumberStringAndIllegal {
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

    get illegal(): never {
        throw new Error("not yet implemented");
    }

    set illegal(value: never) {
        void(value);
        throw new Error("not yet implemented");
    }
}
