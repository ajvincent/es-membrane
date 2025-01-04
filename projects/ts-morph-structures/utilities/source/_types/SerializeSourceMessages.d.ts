import type {
  randomUUID
} from "crypto";

import type {
  SourceFileStructure
} from "ts-morph";

export type SerializeRequest = {
  command: "serializeSource",
  isRequest: true,
  token: ReturnType<typeof randomUUID>,
  absolutePathToFile: string,
  structure: SourceFileStructure
};

type SerializeResponseSuccess = {
  success: true,
  source: string,
};

type SerializeResponseFailure = {
  success: false,
  error: unknown
};

export type SerializeResponse = {
  command: "serializeSource",
  isResponse: true,
  token: ReturnType<typeof randomUUID>,
} & (SerializeResponseSuccess | SerializeResponseFailure);
