/*
class Base<NType extends number> {
  constructor(x: number, y: string);
  constructor(x: NType);
  constructor(x: number) {
    void(x);
  }

  foo(x: number, y: string): void;
  foo<NType extends number>(x: NType): void;
  foo(x: number): void {
    void(x);
  }
}
*/
declare class Base<NType extends number> {
  constructor(x: number, y: string);
  constructor(x: NType);
  foo(x: number, y: string): void;
  foo<NType extends number>(x: NType): void;
}

/*
function bar(x: number, y: string): void
function bar<NType extends number>(x: NType): void;
function bar(x: number): void
{
  void(x);
}
*/
declare function bar(x: number, y: string): void;
declare function bar<NType extends number>(x: NType): void;

declare namespace ReflectTest {
  function apply<T, A extends readonly unknown[], R>(
      target: (this: T, ...args: A) => R,
      thisArgument: T,
      argumentsList: Readonly<A>,
  ): R;
  function apply(target: Function, thisArgument: unknown, argumentsList: ArrayLike<unknown>): unknown;
}
