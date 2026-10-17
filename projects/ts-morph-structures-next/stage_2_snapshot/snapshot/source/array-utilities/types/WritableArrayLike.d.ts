export interface WritableArrayLike<OuterType> {
  length: number;
  [n: number]: OuterType | undefined;
}
