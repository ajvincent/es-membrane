import {
  INVOKE_SYMBOL,
} from "../../source/exports/Common.mjs";

import Entry_Base from "./Entry_Base.mjs";
import type { ReadonlyKeyToComponentMap } from "../../source/exports/KeyToComponentMap_Base.mjs";

import type {
  NumberStringType
} from "../NumberStringType.mjs";

import { Console } from "console";
import { Readable, Writable } from "stream";

export type NumberStringTypeAndLog = NumberStringType & {
  consoleStream: Readable;
  log(isEnter: boolean, message: string) : void;
  consoleData : Promise<string>;
}

export default class NumberString_EntryBase
               extends Entry_Base<NumberStringType, NumberStringTypeAndLog>
               implements NumberStringTypeAndLog
{
  readonly consoleData: Promise<string>;
  readonly consoleStream = new Readable({
    read(readable) : void {
      void(readable);
    },
    encoding: "utf-8"
  });

  constructor(
    extendedMap: ReadonlyKeyToComponentMap<NumberStringType, NumberStringTypeAndLog>,
  )
  {
    super(extendedMap);
    const writable = new Writable({
      decodeStrings: true
    });
    writable._write = (chunk, encoding, callback) : void => {
      this.consoleStream.push(chunk, encoding);
      callback();
    };

    this.#console = new Console(writable);
    this.consoleData = new Promise(resolve => {
      this.consoleStream.on("readable", () => resolve(this.consoleStream.read()));
    });
  }

  repeatForward(s: string, n: number): string
  {
    return this[INVOKE_SYMBOL]<
      NumberStringType["repeatForward"]
    >
    (
      "repeatForward",
      [s, n]
    );
  }

  repeatBack(n: number, s: string): string
  {
    return this[INVOKE_SYMBOL]<
      NumberStringType["repeatBack"]
    >
    (
      "repeatBack",
      [n, s]
    );
  }

  #console: Console;

  log(isEnter: boolean, message: string) : void
  {
    this.#console.log((isEnter ? "enter " : "leave ") + message);
  }
}
