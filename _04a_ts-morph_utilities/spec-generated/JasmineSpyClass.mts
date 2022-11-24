/* This is generated code.  Do not edit directly.
   Instead, edit the types this file imports.
*/
import { NumberStringType } from "../fixtures/NumberStringType.mjs";

export default class JasmineSpyClass implements NumberStringType {
    readonly spy = jasmine.createSpy();
    repeatForward(s: string, n: number) : string
    {
        this.spy(s, n);
        return s.repeat(n);
    }

    repeatBack(n: number, s: string) : string
    {
        this.spy(s, n);
        return s.repeat(n);
    }
}
