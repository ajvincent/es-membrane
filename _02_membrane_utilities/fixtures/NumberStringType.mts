import type {
  MethodDictionary,
} from "../source/stubGenerators/base.mjs";

export type NumberStringType = {
  repeatForward(s: string, n: number): string;
  repeatBack(n: number, s: string): string;
};

// Temporary measure until ts-morph gets up to TypeScript 5.0.
export const NST_Methods: MethodDictionary = {
  "repeatForward": {
    args: [
      {
        key: "s",
        type: "string"
      },
      {
        key: "n",
        type: "number"
      },
    ],

    returnType: "string",
  },

  "repeatBack": {
    args: [
      {
        key: "n",
        type: "number"
      },
      {
        key: "s",
        type: "string"
      },
    ],

    returnType: "string",
  },
};
