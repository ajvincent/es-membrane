export type NumberStringType = true extends boolean ? {
  repeatForward(s: string, n: number): string;
  repeatBack(n: number, s: string): string;
} : never;
