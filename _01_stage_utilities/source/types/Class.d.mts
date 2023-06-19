/* eslint-disable @typescript-eslint/no-explicit-any */
export type Class<T extends object, Arguments extends unknown[] = any[]> = {
  prototype: T;
  new(...parameters: Arguments): T
};

export type Constructor<T> = { new(...parameters: Arguments): T };