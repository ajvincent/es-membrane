import { SingletonPromise } from "./PromiseTypes.mjs";
import { DefaultMap } from "./DefaultMap.mjs";
export class BuildPromise {
    #ownerSet;
    #subtargets = [];
    #postSubtargets = [];
    #tasks = [];
    #runPromise;
    target;
    #setStatus;
    #writeToConsole;
    /**
     * @param ownerSet       - The set owning this.
     * @param setStatus      - Friend-like access to the owner set's #status property.
     * @param target         - The build target.
     * @param writeToConsole - True if we should write to the console.
     */
    constructor(ownerSet, setStatus, target, writeToConsole) {
        this.#ownerSet = ownerSet;
        this.#setStatus = setStatus;
        if (target === "")
            throw new Error("Target must be a non-empty string!");
        if (this.#ownerSet.status !== "not started")
            throw new Error("Build step has started");
        this.target = target;
        Reflect.defineProperty(this, "target", {
            writable: false,
            enumerable: true,
            configurable: false,
        });
        this.description = "";
        this.#runPromise = new SingletonPromise(async () => this.#run());
        this.#writeToConsole = writeToConsole;
    }
    #description = "";
    get description() {
        return this.#description;
    }
    set description(value) {
        if (this.#description)
            throw new Error(`Description already set for target "${this.target}"`);
        if (this.#ownerSet.status !== "not started")
            throw new Error("Build step has started");
        this.#description = value;
    }
    addTask(callback) {
        if (this.#ownerSet.status !== "not started")
            throw new Error("Build step has started");
        this.#tasks.push(callback);
    }
    addSubtarget(target) {
        this.#validateAddSubtarget(target);
        this.#subtargets.push(target);
    }
    addPostSubtarget(target) {
        this.#validateAddSubtarget(target);
        this.#postSubtargets.push(target);
    }
    #validateAddSubtarget(target) {
        if (target === "main")
            throw new Error("Cannot include main target");
        if (target === this.target)
            throw new Error("Cannot include this as its own subtarget");
        if (this.#subtargets.includes(target))
            throw new Error(`${target} is already a subtarget of ${this.target}`);
        if (this.#postSubtargets.includes(target))
            throw new Error(`${target} is already a post-subtarget of ${this.target}`);
        if (this === this.#ownerSet.main) {
            if (this.#ownerSet.status !== "ready")
                throw new Error("Cannot attach targets to main target until we are ready (call BuildPromiseSet.markReady())");
            if (!this.#ownerSet.has(target))
                throw new Error(`Cannot add an undefined target "${target}" to main!`);
        }
        else if (this.#ownerSet.status !== "not started") {
            throw new Error("Build step has started");
        }
        else if (this.#ownerSet.get(target).deepTargets.includes(this.target))
            throw new Error(`"${target}" already has a dependency on "${this.target}"`);
    }
    get deepTargets() {
        const targets = this.#subtargets.concat(this.#postSubtargets);
        for (let i = 0; i < targets.length; i++) {
            targets.push(...this.#ownerSet.get(targets[i]).deepTargets);
        }
        return Array.from(new Set(targets));
    }
    async run() {
        await this.#runPromise.run();
    }
    async #run() {
        if (this.#writeToConsole) {
            // eslint-disable-next-line no-console
            console.log("Starting " + this.target + "...");
        }
        if ((this.#ownerSet.status === "ready") && (this === this.#ownerSet.main))
            this.#setStatus("running");
        if (this.#ownerSet.status !== "running") {
            this.#setStatus("errored");
            throw new Error("Build promises are not running!");
        }
        const subtargets = this.#subtargets.map(st => this.#ownerSet.get(st));
        while (subtargets.length) {
            const subtarget = subtargets.shift();
            try {
                if (!subtarget)
                    throw new Error("assertion: unreachable");
                await subtarget.run();
            }
            catch (ex) {
                this.#setStatus("errored");
                throw ex;
            }
        }
        const tasks = this.#tasks.slice();
        while (tasks.length) {
            const task = tasks.shift();
            try {
                if (!task)
                    throw new Error("assertion: unreachable");
                await task();
            }
            catch (ex) {
                this.#setStatus("errored");
                throw ex;
            }
        }
        const postSubTargets = this.#postSubtargets.map(st => this.#ownerSet.get(st));
        while (postSubTargets.length) {
            const subtarget = postSubTargets.shift();
            try {
                if (!subtarget)
                    throw new Error("assertion: unreachable");
                await subtarget.run();
            }
            catch (ex) {
                this.#setStatus("errored");
                throw ex;
            }
        }
        if (this.#writeToConsole) {
            // eslint-disable-next-line no-console
            console.log("Completed " + this.target + "!");
        }
        if (this === this.#ownerSet.main)
            this.#setStatus("completed");
    }
}
Object.freeze(BuildPromise.prototype);
Object.freeze(BuildPromise);
export class BuildPromiseSet {
    #status = "not started";
    markReady() {
        if (this.#status === "not started")
            this.#status = "ready";
    }
    markClosed() {
        if (this.#status !== "errored")
            this.#status = "closed";
    }
    get status() {
        return this.#status;
    }
    #map = new DefaultMap;
    main;
    #setStatusCallback;
    #writeToConsole;
    constructor(writeToConsole = false) {
        this.#setStatusCallback = (value) => {
            this.#status = value;
        };
        this.#writeToConsole = writeToConsole;
        this.main = this.get("main");
    }
    /**
     * @param targetName - The target name.
     * @returns The build promise.
     */
    get(targetName) {
        return this.#map.getDefault(targetName, () => this.#createPromise(targetName));
    }
    has(targetName) {
        return this.#map.has(targetName);
    }
    #createPromise(targetName) {
        return new BuildPromise(this, this.#setStatusCallback, targetName, this.#writeToConsole);
    }
}
Object.freeze(BuildPromiseSet.prototype);
Object.freeze(BuildPromiseSet);
//# sourceMappingURL=BuildPromise.mjs.map