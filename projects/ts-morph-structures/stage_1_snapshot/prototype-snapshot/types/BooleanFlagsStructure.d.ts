export interface BooleanFlagsStructure<Flags extends string> {
  enableFlags(flags: Flags[]): this
}
