/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  MethodsOnlyType
} from "./MethodsOnlyType.d.mts";

export type ClassMethodDecorator<
  This extends MethodsOnlyType,
  Key extends keyof This,
  ReturnsModified extends boolean,
  Arguments extends any[] | false,
> = (
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
);
