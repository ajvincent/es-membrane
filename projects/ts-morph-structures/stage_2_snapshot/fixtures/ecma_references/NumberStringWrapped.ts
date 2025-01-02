/* This test fixture is very finicky.  Please see spec/integration.ts before changing it. */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SetReturnType } from "type-fest";
import { type NumberStringType } from "./NumberStringClass.js";

type ValueWrapper<T> = {
  value: T;
};

/*
type ObjectWrapper<Type> = {
  [key in keyof Type]: Type[key] extends (...args: any[]) => any ?
    SetReturnType<
      Type[key],
      ValueWrapper<
        ReturnType<Type[key]>
      >
    > : Type[key];
}
*/
type ObjectWrapper<Type> = {
  [key in keyof Type]: Type[key] extends (...args: any[]) => any ?
    SetReturnType<Type[key], ValueWrapper<ReturnType<Type[key]>>> :
    Type[key];
}

export default class NumberStringWrapper
implements ObjectWrapper<NumberStringType>
{
  repeatForward(s: string, n: number): ValueWrapper<string> {
    return { value: s.repeat(n) };
  }
  repeatBack(n: number, s: string): ValueWrapper<string> {
    return { value: s.repeat(n) };
  }
}
