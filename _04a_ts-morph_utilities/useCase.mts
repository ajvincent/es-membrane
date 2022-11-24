// Some interface I imported from elsewhere.
interface NumberStringType {
  repeatForward(s: string, n: number): string;
  repeatBack(n: number, s: string): string;

  type: string;

  // ... several other methods I don't control
}

/*
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
*/

type ExtendedObjectType<T extends object, E> = {
  [K in keyof T]: T[K] extends (...args: infer P) => infer R ?
    (extra: E, ...args: P) => R :
    T[K]
}

export type ExtendedNumberStringType = ExtendedObjectType<NumberStringType, boolean>;

/*
I'm running as a nodejs + npm project.
How do I ask @typescript-eslint/parser or the typescript compiler API / language service to:
  (1) extract all the keys of ExtendedNumberStringClass
  (2) given a key, extract the field signature of ExtendedNumberStringClass
*/

// The goal is to generate a stub:
export default class ENSC implements ExtendedNumberStringType
{
  repeatForward(extra: boolean, s: string, n: number): string {
    void(extra);
    void(s);
    void(n);
    throw new Error("not yet implemented");
  }

  repeatBack(extra: boolean, n: number, s: string): string {
    void(extra);
    void(s);
    void(n);
    throw new Error("not yet implemented");
  }

  get type() : string
  {
    throw new Error("not yet implemented");
  }

  // etc.
}
