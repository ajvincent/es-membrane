/* This is generated code.  Do not edit directly.
   Instead, edit the types this file imports.
*/
import { NumberStringType } from "../build/NumberStringType.mjs";
import { AnyFunction } from "./internal/Common.mjs";
import ComponentMap from "./PassThroughClassType.mjs";

export default class NumberStringClass implements NumberStringType {
    repeatForward(s: string, n: number) : string
    {
        return this.#INVOKE_SYMBOL<NumberStringType["repeatForward"]>("repeatForward", [s, n]);
    }

    repeatBack(n: number, s: string) : string
    {
        return this.#INVOKE_SYMBOL<NumberStringType["repeatBack"]>("repeatBack", [n, s]);
    }

    /**
     * @typeParam MethodType - The type of the original method.
     * @param methodName       - The name of the method we want to call, which we get from each component via Reflect.
     * @param initialArguments - The initial arguments to pass to the starting target.
     * @returns The original target method's type.
     */
    #INVOKE_SYMBOL<
        MethodType extends AnyFunction,
    >
    (
        methodName: PropertyKey,
        initialArguments: Parameters<MethodType>
    ) : ReturnType<MethodType>
    {
        const map = ComponentMap.getMapForInstance(this);

        const startTarget = map.startComponent;
        if (!startTarget)
            throw new Error("assertion failure: we should have a start target");

        // This is safe because we're in a protected method.
        const passThrough = map.buildPassThrough<MethodType>(
            this, methodName, initialArguments
        );

        passThrough.callTarget(startTarget);
        const [hasReturn, result] = passThrough.getReturnValue();
        if (!hasReturn)
            throw new Error("No resolved result!");

        return result;
    }
}
