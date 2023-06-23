/* eslint-disable @typescript-eslint/no-explicit-any */

export type ClassMethodDecoratorReturn<
  This extends object,
  Key extends keyof This,
> =
  This[Key] extends (...args: any[]) => any ?
  (
    this: This,
    ...args: Parameters<This[Key]>
  ) => ReturnType<This[Key]> :
  never;

export type ClassMethodDecorator<
  This extends object,
  Key extends keyof This,
  ReturnsModified extends boolean,
  Arguments extends any[] | false,
> = This[Key] extends (...args: any[]) => any ?
  (
    Arguments extends any[] ?
    (...args: Arguments) => ClassMethodDecorator<This, Key, ReturnsModified, false> :

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
