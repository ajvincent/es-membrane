export function reparse(value: object): object {
  return JSON.parse(JSON.stringify(value)) as object;
}
