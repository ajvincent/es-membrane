export type MethodsOnly<T extends object> =
T extends
{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string | symbol]: CallableFunction & ((this: object, ...args: any[]) => any)
} ? T : never;

