export interface NumberStringType {
  repeatForward(s: string, n: number): string;
  repeatBack(n: number, s: string): string;
}

export default class NumberStringClass
{
  constructor(...args: unknown[]) {
    void(args);
  }

  repeatForward(
    s: string,
    n: number
  ): string
  {
    return s.repeat(n);
  }

  repeatBack(
    n: number,
    s: string
  ): string
  {
    return s.repeat(n);
  }
}
