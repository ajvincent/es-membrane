declare type setStatusCallback = (value: string) => void;
export declare class BuildPromise {
    #private;
    /** @constant */
    target: string;
    /**
     * @param {BuildPromiseSet}   ownerSet       The set owning this.
     * @param {setStatusCallback} setStatus      Friend-like access to the owner set's #status property.
     * @param {string}            target         The build target.
     * @param {boolean}           writeToConsole True if we should write to the console.
     */
    constructor(ownerSet: BuildPromiseSet, setStatus: setStatusCallback, target: string, writeToConsole: boolean);
    /** @type {string} */
    get description(): string;
    set description(value: string);
    /**
     * @param {Function} callback The task.
     */
    addTask(callback: (() => void)): void;
    /**
     * @param {string} target The subtarget.
     */
    addSubtarget(target: string): void;
    /** @type {string[]} */
    get deepTargets(): string[];
    run(): Promise<void>;
}
export declare class BuildPromiseSet {
    #private;
    markReady(): void;
    markClosed(): void;
    get status(): string;
    /** @type {BuildPromise} @constant */
    main: Readonly<BuildPromise>;
    constructor(writeToConsole?: boolean);
    /**
     * @param {string} targetName The target name.
     * @returns {BuildPromise} The build promise.
     */
    get(targetName: string): BuildPromise;
    has(targetName: string): boolean;
}
export {};
