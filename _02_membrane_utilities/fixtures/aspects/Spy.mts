import type { NumberStringVoid } from "../NumberStringVoid.mjs";
import SpyBase from "../SpyBase.mjs";

export default
class NumberStringSpy
extends SpyBase
implements NumberStringVoid
{
  static #spyCount = 0;
  static reset() : void {
    this.#spyCount = 0;
  }

  #count = 0;
  repeatForward(s: string, n: number): void {
    this.getSpy("repeatForward")(NumberStringSpy.#spyCount++, this.#count++, s, n);
  }
  repeatBack(n: number, s: string): void {
    this.getSpy("repeatBack")(NumberStringSpy.#spyCount++, this.#count++, n, s);
  }
}
