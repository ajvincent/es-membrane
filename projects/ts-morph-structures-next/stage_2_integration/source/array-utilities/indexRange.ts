/**
 * Utility to get a range of indexes for a given length.
 *
 * @internal
 */
export function indexRange(
  length: number
): number[]
{
  const indexes: number[] = [];
  for (let i = 0; i < length; i++) {
    indexes.push(i);
  }
  return indexes;
}
