import {
  getModuleClassWithArgs,
  type ModuleSourceDirectory,
} from "../../_01_stage_utilities/source/AsyncSpecModules.mjs";
import { DefaultMap } from "../../_01_stage_utilities/source/DefaultMap.mjs";
import type { NumberStringType } from "../fixtures/NumberStringType.mjs";
import { SpyBaseInterface } from "../../_01_stage_utilities/source/SpyBase.mjs";
import type { VoidMethodsOnly } from "../source/AspectDecorators.mjs";

describe("Aspect decorators", () => {
  const moduleSource: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../spec-generated"
  };

  let AspectBase: new () => VoidMethodsOnly<NumberStringType>;
  let AspectSpy: new () => (VoidMethodsOnly<NumberStringType> & SpyBaseInterface);
  beforeAll(async () => {
    AspectBase = await getModuleClassWithArgs<
      "NumberStringAspectClass_AspectBase",
      [],
      VoidMethodsOnly<NumberStringType>
    >(
      moduleSource,
      "NumberStringAspectClass.mjs",
      "NumberStringAspectClass_AspectBase"
    );

    AspectSpy = class extends AspectBase implements SpyBaseInterface
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

      constructor() {
        super();
        this.getSpy("repeatForward");
        this.getSpy("repeatBack");
      }

      count = 0;

      // This assignment is because we're importing the file into a spec.
      // In real scenarios, the generated code will live in source/generated, and not be cleaned up.
      repeatForward = function(
        this: typeof AspectSpy & { count: number },
        s: string,
        n: number,
      ): void
      {
        (this as unknown as SpyBaseInterface).getSpy("repeatForward")(this.count++, s, n)
      }

      repeatBack = function(
        this: typeof AspectSpy & { count: number },
        n: number,
        s: string,
      ): void
      {
        (this as unknown as SpyBaseInterface).getSpy("repeatBack")(this.count++, s, n)
      }
    }
  });

  it(", AspectBase.repeatForward() exists", () => {
    const aspect = new AspectBase;
    expect(aspect.repeatForward("foo", 3)).toBe(undefined);
  });

  it(", AspectBase can be used as a spy base", () => {
    const aspect = new AspectSpy;
    expect(aspect.spyMap.size).toBe(2);
    aspect.repeatForward("foo", 3);
    expect(aspect.expectSpiesClearExcept("repeatForward"));
    expect(aspect.getSpy("repeatForward")).toHaveBeenCalledOnceWith(0, "foo", 3);
  });
});
