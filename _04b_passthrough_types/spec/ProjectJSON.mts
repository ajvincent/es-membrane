import { StaticValidator } from "../source/ProjectJSON.mjs";

/*  The purpose of this file is to check that when I pass good data into ProjectJSON,
    the validation passes, and when we don't, the validator throws.

    However, we're relying on TypeScript types to make sure our data is
    _almost_ valid before we pass it in.  This leads to TypeScript complaining
    if the types aren't _quite_ valid.  So to get around that, you'll see a lot of
    `foo as { something?: "foo "}` patterns in this file.  These type
    assertions make it clear we're doing this deliberately.

    Someone using TypeScript without these type assertions (read: normal
    development) will see right away most of these cases are unreachable.
    I didn't want to go back and risk the schema violations though.
 */

// #region types copied without readonly types, from ../source/ProjectJSON.mts
type ComponentLocationBaseData = {
  "type": "component",
  "file": string
};

export type PassiveComponentData = ComponentLocationBaseData & {
  "setReturn": "never",
  "role": ("precondition" | "checkArguments" | "bodyAssert" | "checkReturn" | "postcondition"),
};

export type BodyComponentData = ComponentLocationBaseData & {
  "setReturn": ("must" | "may" | "never"),
  "role": "body",
};

/**
 * I can't deprecate this yet.  I had planned on making decorators specify the sequence keys
 * inline in modules, but at this time (July 29, 2022), decorators are not capable of doing this.
 */
export type SequenceKeysData = {
  "type": "sequence",
  "subkeys": ReadonlyArray<string>
};

export type KeysAsProperties = {
  [key: string]: PassiveComponentData | BodyComponentData | SequenceKeysData;
};

type ComponentGeneratorData = {
  sourceTypeLocation: string;
  sourceTypeAlias: string;
  targetDirLocation: string;
  baseClassName: string;
  entryTypeAlias: string;
};

type IntegrationTargetData = {
  directory: string;
  leafName: string;
};

export type BuildData = Partial<{
  schemaDate: 20221027;

  keys: KeysAsProperties;
  startComponent?: string;

  componentGenerator: ComponentGeneratorData;

  sourceDirectories?: ReadonlyArray<string>;
  integrationTargets?: IntegrationTargetData[];
}>;

type roleItemsTypes = BodyComponentData["role"] | PassiveComponentData["role"];
type setReturnTypes = BodyComponentData["setReturn"] | PassiveComponentData["setReturn"];
// #endregion

describe("ProjectJSON: StaticValidator", () => {
  let rawData: BuildData;

  beforeEach(() => {
    rawData = {
      "schemaDate": 20221027,
      "keys": {
      },
      "componentGenerator": {
        "sourceTypeLocation": "../fixtures/NumberStringType.mts",
        "sourceTypeAlias": "NumberStringType",
        "targetDirLocation": "../spec-generated",
        "baseClassName": "NumberStringClass",
        "entryTypeAlias": "NumberStringClass",
      }
    };
  });

  function buildComponent(file: string) : PassiveComponentData | BodyComponentData | SequenceKeysData {
    return {
      type: "component",
      file,
      role: "body",
      "setReturn": "must"
    };
  }

  describe("accepts raw data with", () => {
    it("no keys and a componentGenerator", () => {
      expect(StaticValidator([rawData])).toBeTruthy();
    });

    it("a component key and a class generator", () => {
      (rawData.keys as KeysAsProperties).foo = buildComponent("foo.mjs");
      expect(StaticValidator([rawData])).toBeTruthy();
    });

    it("a component key, a start component and a class generator", () => {
      (rawData.keys as KeysAsProperties).foo = buildComponent("foo.mjs");
      rawData.startComponent = "foo";
      expect(StaticValidator([rawData])).toBeTruthy();
    });

    it("a component key, a sequence and a class generator", () => {
      (rawData.keys as KeysAsProperties).foo = buildComponent("foo.mjs");
      (rawData.keys as KeysAsProperties).bar = {
        "type": "sequence",
        "subkeys": ["foo"]
      };
      rawData.startComponent = "bar";
      expect(StaticValidator([rawData])).toBeTruthy();
    });

    it("a sourceDirectories property containing strings", () => {
      rawData.sourceDirectories = [
        "foo"
      ];
      expect(StaticValidator([rawData])).toBeTruthy();
    });
  });

  describe("throws for", () => {
    it("a top-level value that isn't an array of BuildData objects", () => {
      expect(
        () => StaticValidator(rawData)
      ).toThrowError("data did not pass schema");
    });

    it("an empty array of BuildData objects", () => {
      expect(
        () => StaticValidator([])
      ).toThrowError("data did not pass schema");
    });

    it("a missing set of keys", () => {
      delete rawData.keys;
      let x: Error = new Error;
      expect(
        () => {
          try {
            StaticValidator([rawData]);
          }
          catch (ex) {
            x = ex as Error;
            throw ex;
          }
        }
      ).toThrowError("data did not pass schema");

      expect(x.cause).toBeInstanceOf(AggregateError);
      if (x.cause instanceof AggregateError) {
        expect(x.cause.errors.length).toBe(1);
        expect(x.cause.errors[0].message).toBe("must have required property 'keys'");
      }
    });

    it("a schemaDate mismatch", () => {
      (rawData as { schemaDate: number} ).schemaDate = 20220728;
      expect(
        () => StaticValidator([rawData])
      ).toThrowError("data did not pass schema");

      delete rawData.schemaDate;
      expect(
        () => StaticValidator([rawData])
      ).toThrowError("data did not pass schema");
    });

    it("a missing componentGenerator", () => {
      delete rawData.componentGenerator;
      expect(
        () => StaticValidator([rawData])
      ).toThrowError("data did not pass schema");
    });

    it("an extra property on the raw data", () => {
      (rawData as { extra: boolean }).extra = true;
      expect(
        () => StaticValidator([rawData])
      ).toThrowError("data did not pass schema");
    });

    it("a component key missing a file property", () => {
      const foo = (rawData.keys as KeysAsProperties).foo = buildComponent("foo.mjs");
      delete (foo as { file?: string }).file;
      expect(
        () => StaticValidator([rawData])
      ).toThrowError("data did not pass schema");
    });

    it("a sequence key missing a subkeys property", () => {
      ((rawData.keys as KeysAsProperties).foo as { type: string }) = { "type": "sequence" };

      expect(
        () => StaticValidator([rawData])
      ).toThrowError("data did not pass schema");
    });

    it("a key not matching the type", () => {
      const foo = (rawData.keys as KeysAsProperties).foo = buildComponent("foo.mjs");
      (foo as { type: string }).type = "foo";
      expect(
        () => StaticValidator([rawData])
      ).toThrowError("data did not pass schema");
    });

    it("a component key with an extra property", () => {
      const foo = (rawData.keys as KeysAsProperties).foo = buildComponent("foo.mjs");
      (foo as unknown as { extra: boolean }).extra = true;
      expect(
        () => StaticValidator([rawData])
      ).toThrowError("data did not pass schema");
    });

    it("a component key whose file doesn't end in .mjs", () => {
      (rawData.keys as KeysAsProperties).foo = buildComponent("foo.mts");
      expect(
        () => StaticValidator([rawData])
      ).toThrowError("data did not pass schema");
    });

    it("a sequence key with an extra property", () => {
      (rawData.keys as KeysAsProperties).foo = buildComponent("foo.mjs");
      const bar = (rawData.keys as KeysAsProperties).bar = {
        "type": "sequence",
        "subkeys": ["foo"],
      };

      (bar as unknown as { extra: boolean }).extra = true;

      expect(
        () => StaticValidator([rawData])
      ).toThrowError("data did not pass schema");
    });

    it("a sequence key with subkeys not being an array of strings", () => {
      (rawData.keys as KeysAsProperties).foo = buildComponent("foo.mjs");
      const bar = (rawData.keys as KeysAsProperties).bar = {
        "type": "sequence",
        "subkeys": ["foo"],
      };

      (bar as unknown as { subkeys: boolean[] }).subkeys = [true];

      expect(
        () => StaticValidator([rawData])
      ).toThrowError("data did not pass schema");

      (bar as unknown as { subkeys: boolean }).subkeys = true;
      expect(
        () => StaticValidator([rawData])
      ).toThrowError("data did not pass schema");
    });

    it("a sequence key with duplicate subkeys", () => {
      (rawData.keys as KeysAsProperties).foo = buildComponent("foo.mjs");
      (rawData.keys as KeysAsProperties).bar = {
        "type": "sequence",
        "subkeys": ["foo", "foo"],
      };
      expect(
        () => StaticValidator([rawData])
      ).toThrowError(`Missed subkey (maybe a duplicate?) : "foo"`);
    });

    it("two sequence keys sharing a subkey", () => {
      (rawData.keys as KeysAsProperties).foo = buildComponent("foo.mjs");
      (rawData.keys as KeysAsProperties).bar = {
        "type": "sequence",
        "subkeys": ["foo"],
      };

      (rawData.keys as KeysAsProperties).wop = {
        "type": "sequence",
        "subkeys": ["foo"],
      };
      expect(
        () => StaticValidator([rawData])
      ).toThrowError(`Missed subkey (maybe a duplicate?) : "foo"`);
    });

    it("a sequence key with a missed subkey", () => {
      (rawData.keys as KeysAsProperties).bar = {
        "type": "sequence",
        "subkeys": ["foo"],
      };
      expect(
        () => StaticValidator([rawData])
      ).toThrowError(`Missed subkey (maybe a duplicate?) : "foo"`);
    });

    it("a start component that doesn't point to a named key", () => {
      (rawData.keys as KeysAsProperties).foo = buildComponent("foo.mjs");
      (rawData.keys as KeysAsProperties).bar = {
        "type": "sequence",
        "subkeys": ["foo"],
      };

      rawData.startComponent = "wop";
      expect(
        () => StaticValidator([rawData])
      ).toThrowError(`Start component name "wop" does not have a component or sequence!`);
    });

    describe("a class generator", () => {
      let generator: ComponentGeneratorData;
      beforeEach(() => generator = rawData.componentGenerator as ComponentGeneratorData);

      it("missing a sourceTypeLocation", () => {
        generator.sourceTypeLocation = "";
        expect(
          () => StaticValidator([rawData])
        ).toThrowError("data did not pass schema");

        delete (generator as { sourceTypeLocation?: unknown }).sourceTypeLocation;
        expect(
          () => StaticValidator([rawData])
        ).toThrowError("data did not pass schema");
      });

      it("missing a sourceTypeAlias", () => {
        generator.sourceTypeAlias = "";
        expect(
          () => StaticValidator([rawData])
        ).toThrowError("data did not pass schema");

        delete (generator as { sourceTypeAlias?: unknown }).sourceTypeAlias;
        expect(
          () => StaticValidator([rawData])
        ).toThrowError("data did not pass schema");
      });

      it("missing a targetDirLocation", () => {
        generator.targetDirLocation = "";
        expect(
          () => StaticValidator([rawData])
        ).toThrowError("data did not pass schema");

        delete (generator as { targetDirLocation?: unknown }).targetDirLocation;
        expect(
          () => StaticValidator([rawData])
        ).toThrowError("data did not pass schema");
      });

      it("missing a baseClassName", () => {
        generator.baseClassName = "";
        expect(
          () => StaticValidator([rawData])
        ).toThrowError("data did not pass schema");

        delete (generator as { baseClassName?: unknown }).baseClassName;
        expect(
          () => StaticValidator([rawData])
        ).toThrowError("data did not pass schema");
      });

      it("missing an entryTypeAlias", () => {
        generator.entryTypeAlias = "";
        expect(
          () => StaticValidator([rawData])
        ).toThrowError("data did not pass schema");

        delete (generator as { entryTypeAlias?: unknown }).entryTypeAlias;
        expect(
          () => StaticValidator([rawData])
        ).toThrowError("data did not pass schema");
      });

      it("with an extra property", () => {
        (generator as { extra?: boolean}).extra = true;
        expect(
          () => StaticValidator([rawData])
        ).toThrowError("data did not pass schema");
      });
    });

    it("a sourceDirectories empty array property", () => {
      rawData.sourceDirectories = [];
      expect(
        () => StaticValidator([rawData])
      ).toThrowError("data did not pass schema");
    });

    it("a sourceDirectories non-array property", () => {
      (rawData as unknown as { sourceDirectories: true}).sourceDirectories = true;
      expect(
        () => StaticValidator([rawData])
      ).toThrowError("data did not pass schema");
    });

    it("a sourceDirectories array property containing values other than non-empty strings", () => {
      rawData.sourceDirectories = ["foo", ""];
      expect(
        () => StaticValidator([rawData])
      ).toThrowError("data did not pass schema");

      (rawData.sourceDirectories as (string | boolean)[]) = ["foo", true];
      expect(
        () => StaticValidator([rawData])
      ).toThrowError("data did not pass schema");
    });
  });

  describe("with setReturn", () => {
    beforeEach(() => {
      (rawData.keys as KeysAsProperties).foo = buildComponent("foo.mjs");
    });

    const roleItems: ReadonlyArray<roleItemsTypes> = Object.freeze([
      "precondition",
      "checkArguments",
      "bodyAssert",
      "body",
      "checkReturn",
      "postcondition",
    ]);

    function shouldAccept(setReturn: string, role: string) : boolean
    {
      return (setReturn === "never") || (role === "body");
    }

    ([ "never", "must", "may" ] as setReturnTypes[]).forEach((setReturn) => {
      describe(setReturn + " and role", () => {
        roleItems.forEach((role: string) => {
          const rejects = !shouldAccept(setReturn, role);
          it(`${role} does ${rejects ? "not " : ""}validate`, () => {
            const foo = (rawData.keys as KeysAsProperties).foo as BodyComponentData | PassiveComponentData;
            foo.setReturn = setReturn as setReturnTypes;
            foo.role = role as roleItemsTypes;

            const expectation = expect(() => StaticValidator([rawData]));
            if (rejects)
              expectation.toThrowError("data did not pass schema");
            else
              expectation.not.toThrow();
          });
        });
      })
    });
  });

  describe("requires components in a particular order by roles: ", () => {
    const StageMap: ReadonlyMap<roleItemsTypes, number> = new Map([
      ["precondition", 0],
      ["checkArguments", 1],
      ["bodyAssert", 2],
      ["body", 2],
      ["checkReturn", 3],
      ["postcondition", 4]
    ]);

    for (const firstKey of StageMap.keys()) {
      for (const secondKey of StageMap.keys()) {
        buildSpec(firstKey, secondKey);
      }
    }

    beforeEach(() => {
      (rawData.keys as KeysAsProperties).foo = buildComponent("foo.mjs");
      const foo = (rawData.keys as KeysAsProperties).foo as BodyComponentData | PassiveComponentData;
      foo.setReturn = "never";

      (rawData.keys as KeysAsProperties).bar = buildComponent("bar.mjs");
      const bar  = (rawData.keys as KeysAsProperties).bar as BodyComponentData | PassiveComponentData;
      bar.setReturn = "never";
      (rawData.keys as KeysAsProperties).main =  {
        "type": "sequence",
        "subkeys": ["foo", "bar"]
      };
    });

    function buildSpec(firstKey: roleItemsTypes, secondKey: roleItemsTypes) : void {
      const mustPass = (StageMap.get(firstKey) as number) <= (StageMap.get(secondKey) as number);

      it(`(${firstKey}) before (${secondKey}) must ${mustPass ? "" : "not "}pass`, () => {
        const foo = (rawData.keys as KeysAsProperties).foo as BodyComponentData | PassiveComponentData;
        foo.role = firstKey;
        const bar = (rawData.keys as KeysAsProperties).bar as BodyComponentData | PassiveComponentData;
        bar.role = secondKey;

        const expectation = expect(() => StaticValidator([rawData]));
        if (mustPass)
          expectation.not.toThrow();
        else
          expectation.toThrowError(`In sequence key "main", components with role ${secondKey} must precede components with role ${firstKey}!`);
      });
    }
  });
});
