/* eslint-disable @typescript-eslint/no-explicit-any */

export type ClassMethodDecorator<
  This extends object,
  Key extends keyof This,
  ReturnsModified extends boolean,
  Arguments extends any[] | false,
> =
This[Key] extends (this: This, ...args: any[]) => any ?
(
  Arguments extends any[] ?
  (...args: Arguments) => ClassMethodDecorator<This, Key, ReturnsModified, false> :

  (
    this: void,
    method: This[Key],
    context: ClassMethodDecoratorContext<This, This[Key]>
  ) => (
    true extends ReturnsModified ? This[Key] :
    void
  )
) : never;
