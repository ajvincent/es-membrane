export type DataDescriptor =
  Omit<PropertyDescriptor, "get" | "set"> &
  Pick<Required<PropertyDescriptor>, "value">;
