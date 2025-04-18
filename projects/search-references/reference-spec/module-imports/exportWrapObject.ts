import "es-search-references/guest";

export default function wrapObject(value: object): Record<"value", object> {
  return { value };
}
