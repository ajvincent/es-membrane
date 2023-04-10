/* eslint-disable @typescript-eslint/no-explicit-any */
export type CtorParamsAndArgs<
  X extends (new (...args: any[]) => any) & { prototype: object }
> = X extends (new (...args: infer P) => infer Q) & { prototype: infer R } ?
  { args: P, creates: Q, proto: R } :
  never;
