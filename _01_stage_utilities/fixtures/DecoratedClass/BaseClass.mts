export interface BaseClassFixtureStatic {
  y(): number;
}
export interface BaseClassFixtureInstance {
  x: number;
  get p() : number;
}

class BaseClassFixture implements BaseClassFixtureInstance
{
  static y(): number {
    return 5;
  }

  readonly x: number;
  constructor(x: number) {
    this.x = x;
  }

  get p(): number {
    return 3;
  }
}
void(BaseClassFixture as typeof BaseClassFixture & BaseClassFixtureStatic);

export default BaseClassFixture;
