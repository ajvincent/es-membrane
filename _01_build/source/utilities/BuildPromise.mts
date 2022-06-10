import { SingletonPromise } from "./PromiseTypes.mjs";
import { DefaultMap } from "./DefaultMap.mjs";

type setStatusCallback = (value: string) => void

export class BuildPromise
{
  #ownerSet: Readonly<BuildPromiseSet>;

  /** @type {string[]} @constant */
  #subtargets: string[] = [];

  /** @type {Function[]} @constant */
  #tasks: (() => void)[] = [];

  #runPromise: Readonly<SingletonPromise<void>>;

  /** @constant */
  target: string;

  #setStatus: setStatusCallback;

  /**
   * @callback setStatusCallback
   * @param {string} value
   * @returns {void}
   */

  /** @type {boolean} @constant */
  #writeToConsole: Readonly<boolean>;

  /**
   * @param {BuildPromiseSet}   ownerSet       The set owning this.
   * @param {setStatusCallback} setStatus      Friend-like access to the owner set's #status property.
   * @param {string}            target         The build target.
   * @param {boolean}           writeToConsole True if we should write to the console.
   */
  constructor(
    ownerSet: BuildPromiseSet,
    setStatus: setStatusCallback,
    target: string,
    writeToConsole: boolean,
  )
  {
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

  /** @type {string} */
  #description = "";

  /** @type {string} */
  get description(): string
  {
    return this.#description;
  }
  set description(value: string)
  {
    if (this.#description)
      throw new Error(`Description already set for target "${this.target}"`);
    if (this.#ownerSet.status !== "not started")
      throw new Error("Build step has started");
    this.#description = value;
  }

  /**
   * @param {Function} callback The task.
   */
  addTask(callback: (() => void)): void
  {
    if (this.#ownerSet.status !== "not started")
      throw new Error("Build step has started");
    this.#tasks.push(callback);
  }

  /**
   * @param {string} target The subtarget.
   */
  addSubtarget(target: string): void
  {
    if (target === "main")
      throw new Error("Cannot include main target");

    if (target === this.target)
      throw new Error("Cannot include this as its own subtarget");

    if (this.#subtargets.includes(target))
      throw new Error(`${target} is already a subtarget of ${this.target}`);

    if (this === this.#ownerSet.main)
    {
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

    this.#subtargets.push(target);
  }

  /** @type {string[]} */
  get deepTargets(): string[]
  {
    const targets = this.#subtargets.slice();
    for (let i = 0; i < targets.length; i++) {
      targets.push(...this.#ownerSet.get(targets[i]).deepTargets);
    }
    return Array.from(new Set(targets));
  }

  async run(): Promise<void>
  {
    await this.#runPromise.run();
  }

  async #run(): Promise<void>
  {
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

  markReady(): void
  {
    if (this.#status === "not started")
      this.#status = "ready";
  }

  markClosed(): void
  {
    if (this.#status !== "errored")
      this.#status = "closed";
  }

  get status(): string
  {
    return this.#status;
  }

  /** @type {Map<string, BuildPromise>} @constant */
  #map: DefaultMap<string, BuildPromise> = new DefaultMap;

  /** @type {BuildPromise} @constant */
  main: Readonly<BuildPromise>;

  #setStatusCallback: setStatusCallback;

  /** @type {boolean} @constant */
  #writeToConsole;

  constructor(writeToConsole = false)
  {
    this.#setStatusCallback = (value: string): void => {
      this.#status = value;
    };
    this.#writeToConsole = writeToConsole;
    this.main = this.get("main");
  }

  /**
   * @param {string} targetName The target name.
   * @returns {BuildPromise} The build promise.
   */
  get(targetName: string) : BuildPromise
  {
    return this.#map.getDefault(
      targetName,
      () => this.#createPromise(targetName)
    );
  }

  has(targetName: string) : boolean
  {
    return this.#map.has(targetName);
  }

  #createPromise(targetName: string) : BuildPromise
  {
    return new BuildPromise(this, this.#setStatusCallback, targetName, this.#writeToConsole)
  }
}

Object.freeze(BuildPromiseSet.prototype);
Object.freeze(BuildPromiseSet);
