import StateMachine_DFA from "#stage_utilities/source/stateMachines/dfa-states.mjs";

type MethodDecoratorState = (
  "initial" |
  "argumentsTrap" |
  "bodyTrap" |
  "returnTrap" |
  "prePostCondition"
);

const MethodDecoratorAcceptStates: ReadonlySet<MethodDecoratorState> = new Set<MethodDecoratorState>([
  "prePostCondition",
  "argumentsTrap",
  "bodyTrap",
  "returnTrap",
]);

const MethodDecoratorStateTransitions: readonly [MethodDecoratorState, MethodDecoratorState][] = [
  ["initial", "returnTrap"],
  ["initial", "bodyTrap"],
  ["initial", "argumentsTrap"],
  ["initial", "prePostCondition"],

  ["returnTrap", "returnTrap"],
  ["returnTrap", "bodyTrap"],
  ["returnTrap", "argumentsTrap"],
  ["returnTrap", "prePostCondition"],

  ["bodyTrap", "bodyTrap"],
  ["bodyTrap", "argumentsTrap"],
  ["bodyTrap", "prePostCondition"],

  ["argumentsTrap", "argumentsTrap"],
  ["argumentsTrap", "prePostCondition"],

  ["prePostCondition", "prePostCondition"],
];

export default function buildMethodStates(): StateMachine_DFA<MethodDecoratorState>
{
  return new StateMachine_DFA<
    MethodDecoratorState
  >
  (
    "initial",
    MethodDecoratorAcceptStates,
    MethodDecoratorStateTransitions
  );
}
