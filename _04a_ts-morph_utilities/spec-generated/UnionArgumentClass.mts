/* This is generated code.  Do not edit directly.
   Instead, edit the types this file imports.
*/
import { UnionArgument } from "../fixtures/TypePatterns.mjs";

export default class NumberStringClass implements UnionArgument {
    doSomething(x: string | number) : void
    {
        void(x);
        throw new Error("not yet implemented");
    }
}
