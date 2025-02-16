import wrapObject from "./exportWrapObject.js";
export default function addProperty(value: object): Record<"value" | "addedProperty", object> {
  return {
    ...wrapObject(value),
    addedProperty: { isAddedProperty: true },
  }
}
