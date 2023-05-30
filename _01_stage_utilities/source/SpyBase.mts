import { DefaultMap } from "./DefaultMap.mjs";

export interface SpyBaseInterface {
  readonly spyMap: DefaultMap<string | symbol, jasmine.Spy>;
  getSpy(name: string | symbol) : jasmine.Spy;
  expectSpiesClearExcept(...names: (string | symbol)[]) : void;
}

export default class SpyBase implements SpyBaseInterface
{
  readonly spyMap: DefaultMap<string | symbol, jasmine.Spy> = new DefaultMap;

  getSpy(name: string | symbol) : jasmine.Spy
  {
    return this.spyMap.getDefault(name, () => jasmine.createSpy());
  }

  expectSpiesClearExcept(...names: (string | symbol)[]) : void
  {
    const nonEmptyNames: (string | symbol)[] = [];
    this.spyMap.forEach((spy, foundName) => {
      if (!names.includes(foundName) && (spy.calls.count() > 0))
        nonEmptyNames.push(foundName);
    });

    expect(nonEmptyNames).toEqual([]);
    names.forEach(name => expect(this.spyMap.has(name)).toBe(true));
  }
}
