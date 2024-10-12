import { series } from "gulp";
export declare function PushAndPopDirSeries(dirName: string, callbacks: (() => Promise<void>)[]): ReturnType<typeof series>;
