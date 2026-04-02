export interface PDAState {
  id: string;
  label: string;
  x: number;
  y: number;
  isStart: boolean;
  isAccepting: boolean;
}

export interface PDATransition {
  id: string;
  fromState: string;
  toState: string;
  inputSymbol: string; // ε for epsilon
  stackTop: string; // ε for any/empty
  stackPush: string; // ε for no push, or string of symbols to push (first char pushed last)
}

export type AcceptanceMode = 'final-state' | 'empty-stack' | 'both';

export interface PDAConfig {
  id: string;
  name: string;
  states: PDAState[];
  transitions: PDATransition[];
  inputAlphabet: string[];
  stackAlphabet: string[];
  startState: string;
  initialStackSymbol: string;
  acceptanceMode: AcceptanceMode;
}

export interface SimulationStep {
  stateId: string;
  inputIndex: number;
  stack: string[];
  transitionUsed: PDATransition | null;
  description: string;
}

export interface SimulationResult {
  steps: SimulationStep[];
  accepted: boolean;
  inputString: string;
}

// For nondeterministic PDA - a computation path
export interface ComputationPath {
  steps: SimulationStep[];
  accepted: boolean;
}

export interface SimulationState {
  currentStepIndex: number;
  result: SimulationResult | null;
  allPaths: ComputationPath[];
  isRunning: boolean;
  speed: number;
}

export const EPSILON = 'ε';
