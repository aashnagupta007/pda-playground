import {
  PDAConfig,
  PDATransition,
  SimulationStep,
  ComputationPath,
  EPSILON,
} from './pda-types';

function checkAcceptance(
  config: PDAConfig,
  stateId: string,
  inputIndex: number,
  inputLength: number,
  stack: string[]
): boolean {
  if (inputIndex < inputLength) return false;
  const state = config.states.find(s => s.id === stateId);
  const mode = config.acceptanceMode || 'final-state';
  const byFinalState = !!state?.isAccepting;
  const byEmptyStack = stack.length === 0;
  if (mode === 'final-state') return byFinalState;
  if (mode === 'empty-stack') return byEmptyStack;
  return byFinalState || byEmptyStack; // 'both'
}

interface Configuration {
  stateId: string;
  inputIndex: number;
  stack: string[];
  steps: SimulationStep[];
}

function getApplicableTransitions(
  config: PDAConfig,
  stateId: string,
  inputSymbol: string | null,
  stackTop: string | undefined
): PDATransition[] {
  return config.transitions.filter((t) => {
    if (t.fromState !== stateId) return false;
    const inputMatch = t.inputSymbol === EPSILON || t.inputSymbol === inputSymbol;
    const stackMatch =
      t.stackTop === EPSILON || t.stackTop === stackTop;
    return inputMatch && stackMatch;
  });
}

function applyTransition(
  transition: PDATransition,
  stack: string[]
): string[] {
  const newStack = [...stack];
  // Pop stack top if transition specifies it
  if (transition.stackTop !== EPSILON && newStack.length > 0) {
    newStack.pop();
  }
  // Push symbols (reversed so first char ends on top)
  if (transition.stackPush !== EPSILON) {
    const symbols = transition.stackPush.split('').reverse();
    newStack.push(...symbols);
  }
  return newStack;
}

export function simulatePDA(
  config: PDAConfig,
  inputString: string
): ComputationPath[] {
  const paths: ComputationPath[] = [];
  const maxSteps = 500;

  const initial: Configuration = {
    stateId: config.startState,
    inputIndex: 0,
    stack: [config.initialStackSymbol],
    steps: [
      {
        stateId: config.startState,
        inputIndex: 0,
        stack: [config.initialStackSymbol],
        transitionUsed: null,
        description: `Start at ${config.startState} with stack [${config.initialStackSymbol}]`,
      },
    ],
  };

  const queue: Configuration[] = [initial];
  let iterations = 0;

  while (queue.length > 0 && iterations < maxSteps) {
    iterations++;
    const current = queue.shift()!;
    const { stateId, inputIndex, stack, steps } = current;

    const inputSymbol =
      inputIndex < inputString.length ? inputString[inputIndex] : null;
    const stackTop = stack.length > 0 ? stack[stack.length - 1] : undefined;

    const transitions = getApplicableTransitions(
      config,
      stateId,
      inputSymbol,
      stackTop
    );

    if (transitions.length === 0) {
      // Dead end - check if accepted
      const state = config.states.find((s) => s.id === stateId);
      const accepted = checkAcceptance(config, stateId, inputIndex, inputString.length, stack);
      paths.push({ steps, accepted });
      continue;
    }

    for (const t of transitions) {
      const newStack = applyTransition(t, stack);
      const newInputIndex =
        t.inputSymbol === EPSILON ? inputIndex : inputIndex + 1;

      const consumedSymbol = t.inputSymbol === EPSILON ? 'ε' : inputString[inputIndex];
      const popSym = t.stackTop === EPSILON ? 'ε' : (stackTop ?? 'ε');
      const pushSym = t.stackPush === EPSILON ? 'ε' : t.stackPush;
      const description = `δ(${stateId}, ${consumedSymbol}, ${popSym}) → (${t.toState}, ${pushSym})`;

      const newStep: SimulationStep = {
        stateId: t.toState,
        inputIndex: newInputIndex,
        stack: [...newStack],
        transitionUsed: t,
        description,
      };

      const newConfig: Configuration = {
        stateId: t.toState,
        inputIndex: newInputIndex,
        stack: newStack,
        steps: [...steps, newStep],
      };

      // Check if this is a terminal config
      const newInputSymbol =
        newInputIndex < inputString.length ? inputString[newInputIndex] : null;
      const newStackTop =
        newStack.length > 0 ? newStack[newStack.length - 1] : undefined;
      const nextTransitions = getApplicableTransitions(
        config,
        t.toState,
        newInputSymbol,
        newStackTop
      );

      if (nextTransitions.length === 0) {
        const accepted = checkAcceptance(config, t.toState, newInputIndex, inputString.length, newStack);
        paths.push({ steps: [...steps, newStep], accepted });
      } else {
        queue.push(newConfig);
      }
    }
  }

  return paths.length > 0 ? paths : [{ steps: initial.steps, accepted: false }];
}
