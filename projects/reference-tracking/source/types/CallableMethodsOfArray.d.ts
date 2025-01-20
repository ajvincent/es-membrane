// https://stackoverflow.com/questions/51419176/how-to-get-a-subset-of-keyof-t-whose-value-tk-are-callable-functions-in-typ
type PickOfType<T, V> = {
  [P in keyof T as (T[P] extends V ? P : never)]: T[P]
}

export type CallableMethodsOfArray = PickOfType<unknown[], CallableFunction>;
