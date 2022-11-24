/*
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
*/

export type ExtendedObjectType<T extends object, E> = {
  [K in keyof T]: T[K] extends (...args: infer P) => infer R ?
    (__extended__: E, ...args: P) => R :
    T[K]
}
