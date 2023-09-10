import ClassStubBuilder from "../source/ClassStubBuilder.mjs";
import NotImplementedStub from "../source/NotImplementedClass.mjs";

import {
  NumberStringTypeFile,
  pathToTypeFile,
  stageDir,
} from "./constants.mjs";

export default async function runModule(): Promise<void>
{
  const stubBuilder = new ClassStubBuilder(
    NumberStringTypeFile,
    "NumberStringType",
    "NumberStringClass"
  );

  const stubClass = stubBuilder.createClassStub();

  await NotImplementedStub(
    pathToTypeFile,
    true,
    stubBuilder,
    stubClass,
    stageDir,
    "spec-generated/NST_NotImplemented.mts"
  );
}
