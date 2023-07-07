export default class StateMachine_DFA<State extends string> {
  #currentState: State;
  #acceptStates: ReadonlySet<State>;
  #transitionsHashed: ReadonlySet<string>;
  #result: boolean | undefined = undefined;

  static #hash(this: void, startState: string, nextState: string): string {
    return JSON.stringify([startState, nextState]);
  }

  constructor(
    startState: State,
    acceptStates: ReadonlySet<State>,
    transitions: ReadonlyArray<[State, State]>
  )
  {
    this.#currentState = startState;
    this.#acceptStates = new Set<State>(acceptStates);
    const transitionsHashed = new Set<string>;
    const foundStates = new Set<State>;

    transitions.forEach(([currentState, nextState]) => {
      foundStates.add(currentState);
      foundStates.add(nextState);
      transitionsHashed.add(StateMachine_DFA.#hash(currentState, nextState));
    });

    this.#transitionsHashed = transitionsHashed;

    if (!foundStates.has(startState))
      throw new Error("start state does not match any transition state");
    if (this.#acceptStates.has(startState))
      this.#result = true;
  }

  get currentState(): State {
    return this.#currentState;
  }

  get result(): boolean | undefined {
    return this.#result;
  }

  setNextState(nextState: State): void {
    if (this.#result === false) {
      throw new Error("state machine has already rejected");
    }

    const stateHash = StateMachine_DFA.#hash(this.#currentState, nextState);
    if (this.#transitionsHashed.has(stateHash)) {
      this.#currentState = nextState;
      if (this.#acceptStates.has(nextState))
        this.#result = true;
      else
        this.#result = undefined;
    }
    else {
      this.#result = false;
      throw new Error(`invalid new state from current state: ${stateHash}`);
    }
  }
}
