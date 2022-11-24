/* This may look stupid every time I see it:  "why not just use Function?"
 * The problem comes when I try to write something like:
 * export type Foo = {
 *   bar<
 *     MethodType extends Function,
 *   >
 *   (
 *     initialArguments: Parameters<MethodType>
 *   ): void
 * };
 *
 * I get TypeScript errors: MethodType does not satisfy the constraint '(...args: any) => any'
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction = (...args: any[]) => any;

export type PropertyKey = string | number | symbol;

export type OnlyFunctionKeys<ClassType> = keyof {
  [Key in keyof ClassType as (ClassType[Key] extends AnyFunction ? Key : never)]: true
};

// A key for derived classes to use.  A symbol to prevent conflicts with existing types.
export const INVOKE_SYMBOL = Symbol("protected invoke");

export type Entry_BaseType<ClassType extends object> = ClassType & {
  [INVOKE_SYMBOL]<
    MethodType extends AnyFunction,
  >
  (
    methodName: PropertyKey,
    initialArguments: Parameters<MethodType>
  ): ReturnType<MethodType>
}
