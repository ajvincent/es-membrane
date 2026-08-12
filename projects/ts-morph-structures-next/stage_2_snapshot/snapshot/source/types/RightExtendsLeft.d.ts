export type RightExtendsLeft<Left, Right> = Right extends Left ? Right : never;
