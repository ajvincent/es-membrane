interface Foo {
  (y: never): boolean;
  [key: symbol]: false;
}

enum NumberString {
  one = 1,
  two,
  three,
}

class Bar implements Omit<Foo, keyof Foo> {
  static one: number;
  static two: string;
  static {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    this["one"] = 1;
    this.two = "two";
  }

  constructor(x: number, y: string, z: boolean)
  constructor(x: number, y: string)
  constructor(x: number)
  {
    const w = {x, y: "y"};
    const t = {
      ...w,
      z: false
    };
    void(t);
  }

  baz(x: number, y: string): void
  baz(x: number): void {
    void(x);
  }

  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  get wop(): string {
    return "wop";
  }
  set wop(value: string) {
    void(value);
  }
}
void(Bar.one);

export { NumberString };
