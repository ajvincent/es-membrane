import AwaitedMap, {
  type ReadonlyAwaitedMap
} from "./AwaitedMap.js";

import {
  Deferred,
  SingletonPromise,
  PromiseAllParallel,
} from "./PromiseTypes.js";

class ValueWithDependencies<ValueType>
{
  readonly #name: string;
  readonly #dependencies: Set<string>;
  readonly #resolverMap: ReadonlyMap<string, ValueWithDependencies<ValueType>>;

  readonly #startPromise: Promise<void>;
  readonly #valuePromise: Promise<ValueType>;
  readonly #runPromise: SingletonPromise<ValueType>;

  constructor(
    name: string,
    startPromise: Promise<void>,
    resolverMap: ReadonlyMap<string, ValueWithDependencies<ValueType>>,
    valuePromise: Promise<ValueType>,
    dependencies: string[]
  )
  {
    this.#name = name;
    this.#startPromise = startPromise;
    this.#resolverMap = resolverMap;
    this.#valuePromise = valuePromise;
    this.#runPromise = new SingletonPromise(async () => this.#run());
    this.#dependencies = new Set(dependencies);

    void(this.#name); // it's here for debugging purposes
  }

  addDependencies(
    dependencies: string[]
  ): void
  {
    dependencies.forEach(dep => this.#dependencies.add(dep));
  }

  async run(): Promise<ValueType>
  {
    return await this.#runPromise.run();
  }

  async #run(): Promise<ValueType>
  {
    await this.#startPromise;

    const values = Array.from(this.#dependencies).map(
      dependency => this.#resolverMap.get(dependency)!
    );
    await PromiseAllParallel(values, value => value.run());

    return await this.#valuePromise;
  }
}

/**
 * A helper class for when one key has dependencies on other keys.
 */
export default
class DependencyTracker<ValueType>
{
  readonly #dependenciesMap = new Map<string, ValueWithDependencies<ValueType>>;
  readonly #awaitedMap = new AwaitedMap<string, ValueType>;
  readonly #unresolvedNames = new Set<string>;
  readonly #unresolvedDependencies = new Set<string>;

  readonly #startDeferred = new Deferred<void>;
  readonly #runPromise = new SingletonPromise(async () => this.#run());

  #started = false;

  readonly awaitedMap: ReadonlyAwaitedMap<string, ValueType> = this.#awaitedMap;

  get unresolvedNames(): ReadonlySet<string>
  {
    return new Set(this.#unresolvedNames);
  }

  get unresolvedDependencies(): ReadonlySet<string>
  {
    return new Set(this.#unresolvedDependencies);
  }

  addPromise(
    name: string,
    promise: Promise<ValueType>,
    dependencies: string[] = [],
  ): void
  {
    if (this.#started)
      throw new Error("This dependency tracker has already started resolving dependencies.");

    if (this.#dependenciesMap.has(name))
      throw new Error(`The name ${JSON.stringify(name)} is already known.`);

    const withDependencies = new ValueWithDependencies<ValueType>(
      name, this.#startDeferred.promise, this.#dependenciesMap, promise, dependencies
    );
    this.#dependenciesMap.set(name, withDependencies);
    this.#unresolvedNames.add(name);
    this.#unresolvedDependencies.add(name);

    this.#awaitedMap.set(name, this.#wrapPromise(name, withDependencies.run()));

    dependencies.forEach(dep => this.#unresolvedDependencies.add(dep));
  }

  async #wrapPromise(
    name: string,
    promise: Promise<ValueType>
  ): Promise<ValueType>
  {
    const result = await promise;
    this.#unresolvedDependencies.delete(name);
    this.#unresolvedNames.delete(name);
    return result;
  }

  addDependencies(
    name: string,
    dependencies: string[] = []
  ): void
  {
    if (this.#started)
      throw new Error("This dependency tracker has already started resolving dependencies.");

    const withDependencies = this.#dependenciesMap.get(name);
    if (!withDependencies)
      throw new Error(`The name ${JSON.stringify(name)} is not yet known.`);

    withDependencies.addDependencies(dependencies);
    dependencies.forEach(dep => this.#unresolvedDependencies.add(dep));
  }

  async run(): Promise<ReadonlyMap<string, ValueType>>
  {
    if (!this.#started) {
      if (this.#unresolvedNames.size !== this.#unresolvedDependencies.size)
        throw new Error("unresolved names doesn't match unresolved dependencies");

      this.#unresolvedNames.forEach(name => {
        if (!this.#unresolvedDependencies.has(name))
          throw new Error("unresolved names doesn't match unresolved dependencies");
      });

      this.#started = true;
      this.#startDeferred.resolve();
    }

    return await this.#runPromise.run();
  }

  async #run(): Promise<ReadonlyMap<string, ValueType>>
  {
    return await this.#awaitedMap.allResolved();
  }
}
