import StateMachine_DFA from "../../source/stateMachines/dfa-states.mjs";

describe("StateMachine_DFA", () => {
  type State = "one" | "two" | "three";
  let dfa: null | StateMachine_DFA<State>;
  afterEach(() => dfa = null);

  it("can initialize to an accept state, and reject on a move to an unknown state", () => {
    dfa = new StateMachine_DFA<State>("one", new Set<State>(["one"]), [["one", "one"]]);
    expect(dfa.result).toBe(true);
    expect(dfa.currentState).toBe("one");

    expect(
      () => dfa?.setNextState("two")
    ).toThrowError(`invalid new state from current state: ["one","two"]`);
    expect(dfa.result).toBe(false);
    expect(dfa.currentState).toBe("one");

    expect(
      () => dfa?.setNextState("two")
    ).toThrowError(`state machine has already rejected`);
    expect(dfa.result).toBe(false);
    expect(dfa.currentState).toBe("one");
  });

  it("can initialize to an unresolved state, and reject on a move to an unknown state", () => {
    dfa = new StateMachine_DFA<State>("one", new Set<State>, [["one", "one"]]);
    expect(dfa.result).toBe(undefined);
    expect(dfa.currentState).toBe("one");

    expect(
      () => dfa?.setNextState("two")
    ).toThrowError(`invalid new state from current state: ["one","two"]`);
    expect(dfa.result).toBe(false);
    expect(dfa.currentState).toBe("one");

    expect(
      () => dfa?.setNextState("two")
    ).toThrowError(`state machine has already rejected`);
    expect(dfa.result).toBe(false);
    expect(dfa.currentState).toBe("one");

    expect(
      () => dfa?.setNextState("two")
    ).toThrowError(`state machine has already rejected`);
  });

  it("throws when the initial state does not appear as a transition state", () => {
    expect(
      () => new StateMachine_DFA<State>("one", new Set<State>(["one"]), [])
    ).toThrowError("start state does not match any transition state");
  });

  it("can transition from an unresolved state to an accept state", () => {
    dfa = new StateMachine_DFA<State>("one", new Set<State>(["two"]), [["one", "two"]]);
    dfa.setNextState("two");
    expect(dfa.result).toBe(true);
    expect(dfa.currentState).toBe("two");
  });

  it("can transition from an unresolved state to another unresolved state", () => {
    dfa = new StateMachine_DFA<State>("one", new Set<State>([]), [["one", "two"]]);
    dfa.setNextState("two");
    expect(dfa.result).toBe(undefined);
    expect(dfa.currentState).toBe("two");
  });

  it("can transition from an accept state to another accept state", () => {
    dfa = new StateMachine_DFA<State>("one", new Set<State>(["one", "two"]), [["one", "two"]]);
    dfa.setNextState("two");
    expect(dfa.result).toBe(true);
    expect(dfa.currentState).toBe("two");
  });

  it("can transition from an accept state to an unresolved state", () => {
    dfa = new StateMachine_DFA<State>("one", new Set<State>(["one"]), [["one", "two"]]);
    dfa.setNextState("two");
    expect(dfa.result).toBe(undefined);
    expect(dfa.currentState).toBe("two");
  });

  it("throws when transitioning from a known state to an unreachable state", () => {
    dfa = new StateMachine_DFA<State>("one", new Set<State>(["three"]), [
      ["one", "two"],
      ["two", "three"],
    ]);

    dfa.setNextState("two");
    expect(dfa.result).toBe(undefined);
    expect(dfa.currentState).toBe("two");

    dfa.setNextState("three");
    expect(dfa.result).toBe(true);
    expect(dfa.currentState).toBe("three");

    expect(
      () => dfa?.setNextState("one")
    ).toThrowError(`invalid new state from current state: ["three","one"]`);
    expect(dfa.result).toBe(false);
    expect(dfa.currentState).toBe("three");

    expect(
      () => dfa?.setNextState("one")
    ).toThrowError("state machine has already rejected");
    expect(dfa.result).toBe(false);
    expect(dfa.currentState).toBe("three");
  });
});
