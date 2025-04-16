export type PromiseResolver<T> = (value: T | PromiseLike<T>) => unknown;
export type PromiseRejecter = (reason?: unknown) => unknown;

/** @deprecated use `Promise.withResolvers()` instead. */
export class Deferred<T>
{
  resolve: PromiseResolver<T>;
  reject: PromiseRejecter;
  promise: Promise<T>;

  constructor()
  {
    this.resolve = (value): void => {
      void(value);
    };
    this.reject = (reason): void => {
      throw reason;
    }
    this.promise = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
  }
}
