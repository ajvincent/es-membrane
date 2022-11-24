import {
  JSONSchemaType,
  ErrorObject
} from "ajv";
import Ajv from 'ajv';

type ComponentLocationBaseData = {
  readonly "type": "component",
  readonly "file": string
};

export type PassiveComponentData = ComponentLocationBaseData & {
  readonly "setReturn": "never",
  readonly "role": ("precondition" | "checkArguments" | "bodyAssert" | "checkReturn" | "postcondition"),
};

export type BodyComponentData = ComponentLocationBaseData & {
  readonly "setReturn": ("must" | "may" | "never"),
  readonly "role": "body",
};

/**
 * I can't deprecate this yet.  I had planned on making decorators specify the sequence keys
 * inline in modules, but at this time (July 29, 2022), decorators are not capable of doing this.
 */
export type SequenceKeysData = {
  readonly "type": "sequence",
  readonly "subkeys": ReadonlyArray<string>
};

export type ComponentOrSequence = PassiveComponentData | BodyComponentData | SequenceKeysData;

export type KeysAsProperties = {
  readonly [key: string]: ComponentOrSequence;
};

type ComponentGeneratorData = {
  readonly sourceTypeLocation: string;
  readonly sourceTypeAlias: string;
  readonly targetDirLocation: string;
  readonly baseClassName: string;
  readonly entryTypeAlias: string;
};

type IntegrationTargetData = {
  readonly directory: string;
  readonly leafName: string;
};

export type BuildData = {
  readonly schemaDate: 20221027;

  readonly keys: KeysAsProperties;
  readonly startComponent?: string;

  readonly componentGenerator: ComponentGeneratorData;

  readonly sourceDirectories?: ReadonlyArray<string>;
  readonly integrationTargets?: IntegrationTargetData[];
};

export type BuildDataArray = ReadonlyArray<BuildData>;

//#region subschemas

const PassiveComponentDataSchema: JSONSchemaType<PassiveComponentData> = {
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "const": "component"
    },
    "file": {
      "type": "string",
      "pattern": ".\\.mjs$"
    },

    "setReturn": {
      "type": "string",
      "const": "never"
    },
    "role": {
      "type": "string",
      "enum": [
        "precondition",
        "checkArguments",
        "bodyAssert",
        "checkReturn",
        "postcondition"
      ]
    }
  },
  "required": [
    "type",
    "file",
    "setReturn",
    "role"
  ],
  "additionalProperties": false
};

const BodyComponentDataSchema: JSONSchemaType<BodyComponentData> = {
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "const": "component"
    },
    "file": {
      "type": "string",
      "pattern": ".\\.mjs$"
    },
    "setReturn": {
      "type": "string",
      "enum": [
        "must",
        "may",
        "never"
      ]
    },
    "role": {
      "type": "string",
      "const": "body"
    }
  },

  "required": [
    "type",
    "file",
    "setReturn",
    "role"
  ],
  "additionalProperties": false
};

const SequenceKeysSchema: JSONSchemaType<SequenceKeysData> = {
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "enum": ["sequence"]
    },
    "subkeys": {
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1
      },
      "minItems": 1,
    }
  },
  "required": ["type", "subkeys"],
  "additionalProperties": false,
};

const ComponentGeneratorSchema: JSONSchemaType<ComponentGeneratorData> = {
  "type": "object",
  "properties": {
    "sourceTypeLocation": {
      "type": "string",
      "minLength": 1
    },

    "sourceTypeAlias": {
      "type": "string",
      "minLength": 1
    },

    "targetDirLocation": {
      "type": "string",
      "minLength": 1
    },

    "baseClassName": {
      "type": "string",
      "minLength": 1
    },

    "entryTypeAlias": {
      "type": "string",
      "minLength": 1
    },
  },

  "required": [
    "sourceTypeLocation",
    "sourceTypeAlias",
    "targetDirLocation",
    "baseClassName",
    "entryTypeAlias",
  ],
  "additionalProperties": false,
};

const IntegrationTargetSchema: JSONSchemaType<IntegrationTargetData> = {
  "type": "object",
  "properties": {
    "directory": {
      "type": "string",
      "minLength": 1
    },

    "leafName": {
      "type": "string",
      "minLength": 1
    }
  },

  "required": ["directory", "leafName"],
  "additionalProperties": false,
  "nullable": true
}
// #endregion subschemas

const BuildDataSchema : JSONSchemaType<BuildData> = {
  "type": "object",

  "properties": {
    "schemaDate": {
      "type": "number",
      "enum": [20221027]
    },

    "keys": {
      "type": "object",
      "required": [],
      "additionalProperties": {
        "oneOf": [
          PassiveComponentDataSchema,
          BodyComponentDataSchema,
          SequenceKeysSchema
        ],
      },
    },

    "startComponent": {
      "type": "string",
      "minLength": 1,
      "nullable": true,
    },

    "componentGenerator": ComponentGeneratorSchema,

    "sourceDirectories": {
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1,
      },
      "minItems": 1,
      "nullable": true,
    },

    "integrationTargets": {
      "type": "array",
      "nullable": true,
      "items": IntegrationTargetSchema,
      "minItems": 1
    }
  },

  "required": [
    "keys",
    "componentGenerator",
    "schemaDate",
  ],

  "additionalProperties": false
}

const BuildDataArraySchema: JSONSchemaType<BuildDataArray> = {
  "type": "array",
  "minItems": 1,
  "items": BuildDataSchema
};

const ajv = new Ajv.default();
const SchemaValidator = ajv.compile(BuildDataArraySchema);

export function StaticValidator(data: unknown) : data is BuildDataArray
{
  // Do we have valid data?
  const pass = SchemaValidator(data);
  if (!pass) {
    const errors = SchemaValidator.errors ?? [] as ErrorObject[];

    throw new Error("data did not pass schema", {
      cause: new AggregateError(errors.map(e => new Error(e.message)))
    });
  }

  return data.every(buildData => StaticValidatorOne(buildData));
}

function StaticValidatorOne(data: BuildData) : true
{
  const entries = Object.entries(data.keys);
  const components = new Map<string, PassiveComponentData | BodyComponentData>,
        sequences = new Map<string, SequenceKeysData>,
        keys = new Set<string>;

  // Fill the components and sequences maps.
  entries.forEach(([key, item]) => {
    keys.add(key);
    if (item.type === "component")
      components.set(key, item);
    else
      sequences.set(key, item);
  });

  // Ensure there are no duplicate or missing subkeys.
  {
    const pendingKeys = new Set(keys.values());
    sequences.forEach(value => {
      value.subkeys.forEach(subkey => {
        if (!pendingKeys.has(subkey))
          throw new Error(`Missed subkey (maybe a duplicate?) : "${subkey}"`);
        pendingKeys.delete(subkey);
      });
    });
  }

  // Do we have a valid start component?
  if (data.startComponent && !keys.has(data.startComponent))
    throw new Error(`Start component name "${data.startComponent}" does not have a component or sequence!`);

  // Are the components in a sequence in the proper role order?
  {
    let currentState = "precondition", currentOrder: number = StageMap.get(currentState) as number;
    sequences.forEach((sequence, key) => {
      sequence.subkeys.forEach((subkey => {
        const component = components.get(subkey) as PassiveComponentData | BodyComponentData;
        const nextState = component.role;
        const nextOrder = StageMap.get(nextState) as number;

        if (nextOrder < currentOrder) {
          throw new Error(`In sequence key "${key}", components with role ${nextState} must precede components with role ${currentState}!`);
        }

        currentState = component.role;
        currentOrder = nextOrder;
      }));
    });
  }

  return true;
}

const StageMap: ReadonlyMap<string, number> = new Map([
  ["precondition", 0],
  ["checkArguments", 1],
  ["bodyAssert", 2],
  ["body", 2],
  ["checkReturn", 3],
  ["postcondition", 4]
]);
