interface Foo {
  (y: never): boolean;
  [key: symbol]: false;
}

enum NumberString {
  one = 1,
  two,
  three,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type One = NumberString.one;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface HasConstructSignature {
  // eslint-disable-next-line @typescript-eslint/no-misused-new
  new (x: number): HasConstructSignature
}

// eslint-disable-next-line @typescript-eslint/prefer-namespace-keyword, @typescript-eslint/no-namespace
module ThisIsAModule {
  export const x = 3;
}
void(ThisIsAModule);

class Bar implements Omit<Foo, keyof Foo> {
  static one: number;
  static two: string;
  static {
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

  get wop(): string {
    return "wop";
  }
  set wop(value: string) {
    void(value);
  }
}
void(Bar.one);

function foo(x: number, y: string): void
function foo(x: number): void
{
  void(x);
}

export {
  NumberString,
  foo
};

export type MappedTypeExample = {
  [key in "one" | "two"]: boolean;
}

export type TemplateLiteralExample = `one${"A" | "B"}two${"C" | "D"}three${"E" | "F"}`;
