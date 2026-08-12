import AwaitedMap from "#utilities/source/AwaitedMap.js";

export type PromiseResolver = () => void;

/**
 * A helper class for when one key has dependencies on other keys.
 *
 * @remarks
 * I use this to handle the `extends` property of the interfaces.
 */
export default
class DependencyTracker
{
  readonly #resolverMap = new Map<string, PromiseResolver>;
  readonly #promiseMap = new AwaitedMap<string, void>;

  /**
   * @param names - the set of known names to depend on.
   */
  constructor(names: readonly string[])
  {
    names.forEach(name => {
      const promise = new Promise<void>(resolve => {
        this.#resolverMap.set(name, resolve);
      });
      this.#promiseMap.set(name, promise);
    });
  }

  /**
   *
   * @param name - the target name to resolve
   * @param dependentNames - names the target depends on.
   * @param callback - the true operation for the target.
   */
  async resolve<T>(
    name: string,
    dependentNames: readonly string[],
    callback: () => Promise<T>,
  ) : Promise<T>
  {
    await Promise.all(dependentNames.map(
      extendName => this.#promiseMap.get(extendName) as Promise<unknown>
    ));

    const result = await callback();

    (this.#resolverMap.get(name)!)();
    return result;
  }
}
