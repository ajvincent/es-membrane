/* eslint-disable @typescript-eslint/no-explicit-any */

export type ClassMethodDecoratorReturn<
  This extends object,
  Key extends keyof This,
> = (
  this: ThisParameterType<This[Key]>,
  ...args: Parameters<This[Key]>
) => ReturnType<This[Key]>;

export type ClassMethodDecorator<
  This extends object,
  Key extends keyof This,
  ReturnsModified extends boolean,
  Arguments extends any[] | false
> = This[Key] extends Function ?
  (
    Arguments extends any[] ?
    (...args: Arguments) => ClassMethodDecorator<This, Key, false> :

    (
      this: void,
      method: This[Key],
      context: ClassMethodDecoratorContext<This, This[Key]>
    ) => (
      true extends ReturnsModified ? ClassMethodDecoratorReturn<This, Key> :
      void
    )
  ) :

  never
;
