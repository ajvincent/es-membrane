import { execFile } from "node:child_process";
export declare const execAsync: typeof execFile.__promisify__;
export declare function assertRepoIsClean(): Promise<void>;
