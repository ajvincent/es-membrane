describe("Receivers in Reflect", function() {
  var alpha, beta, ALPHA, BETA;
  beforeEach(function() {
    ALPHA = {
      value: "A"
    };
    BETA  = {
      value: "B"
    };

    alpha = {
      get upper() {
        return this._upper;
      },
      set upper(val) {
        this._upper = val;
      },
      _upper: ALPHA,
      value: "a",
    };

    beta = {
      _upper: BETA,
      value: "b"
    };
  });

  afterEach(function() {
    alpha = null;
    beta = null;
    ALPHA = null;
    BETA = null;
  });

  it("are where property lookups happen", function() {
    expect(Reflect.get(alpha, "upper", beta)).toBe(BETA);
  });

  it("are where property setter invocations happen", function() {
    const X = {};
    Reflect.set(alpha, "upper", X, beta);
    expect(beta._upper).toBe(X);
    expect(alpha._upper).toBe(ALPHA);
  });
});
