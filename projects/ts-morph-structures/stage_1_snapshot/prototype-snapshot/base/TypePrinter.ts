import {
  CodeBlockWriter
} from "ts-morph";

import {
  pairedWrite
} from "./utilities.js";

import {
  TypeStructures
} from "../typeStructures/TypeStructures.js";

export class TypePrinterSettingsBase {
  indentChildren = false;
  newLinesAroundChildren = false;
  oneLinePerChild = false;
}

export interface TypePrinterSettingsInternal
extends TypePrinterSettingsBase
{
  objectType: TypeStructures | null,
  startToken: string,
  childTypes: TypeStructures[],
  joinChildrenToken: string,
  endToken: string,
}

export interface TypePrinterSettings {
  printSettings: TypePrinterSettingsBase,
}

export function TypePrinter(
  this: void,
  writer: CodeBlockWriter,
  settings: TypePrinterSettingsInternal,
): void
{
  const {
    indentChildren,
    newLinesAroundChildren,
    oneLinePerChild,

    objectType: prefixType,
    startToken,
    childTypes,
    joinChildrenToken,
    endToken,
  } = settings;

  prefixType?.writerFunction(writer);

  pairedWrite(
    writer,
    startToken,
    endToken,
    newLinesAroundChildren,
    indentChildren,
    () => {
      if (childTypes.length === 0)
        return;
      if (childTypes.length === 1) {
        childTypes[0].writerFunction(writer);
        return;
      }

      const lastChild = childTypes[childTypes.length - 1];
      for (const child of childTypes) {
        child.writerFunction(writer);
        if (child === lastChild)
          continue;

        if (oneLinePerChild) {
          writer.write(joinChildrenToken.trimEnd());
          writer.newLine();
        }
        else {
          writer.write(joinChildrenToken);
        }
      }
    }
  );
}
