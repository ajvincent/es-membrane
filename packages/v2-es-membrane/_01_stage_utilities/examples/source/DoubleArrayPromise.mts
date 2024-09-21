import {
  PromiseAllSequence,
  SingletonPromise,
} from "../../source/PromiseTypes.mjs";

export type DoubleArrayPromiseType = {
  run() : Promise<number[]>;
};

export default class DoubleArrayPromise implements DoubleArrayPromiseType
{
  #count: number;
  #runPromise = new SingletonPromise(() => this.#run());

  constructor(count: number) {
    this.#count = count;
  }

  async run() : Promise<number[]>
  {
    return await this.#runPromise.run();
  }

  async #run() : Promise<number[]> {
    const inputs: number[] = [];
    for (let i = 0; i < this.#count; i++) {
      inputs.push(i);
    }

    return await PromiseAllSequence<number, number>(
      inputs,
      input => Promise.resolve(input * 2)
    );
  }
}
