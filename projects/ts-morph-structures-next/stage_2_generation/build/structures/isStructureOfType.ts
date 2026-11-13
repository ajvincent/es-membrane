import {
  IsStructureOfType_Module
} from "../../moduleClasses/isStructureOfType_Module.js";

export async function createIsStructureOfTypeModule(): Promise<void> {
  const module = new IsStructureOfType_Module();
  await module.saveFile();
}
