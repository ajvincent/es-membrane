/**
 * @remarks
 * `ObjectGraphTailHandler` converts from `ObjectGraphHandler<T>` to `Required<ProxyHandler<T>>` by invoking the
 * `nextHandler` argument with the `nextTarget` and `nextArgArray`, `nextThisArg`, `nextDescriptor`,
 * etc. arguments.
 */
