import { PDAConfig, EPSILON } from './pda-types';

export const EXAMPLE_PDAS: PDAConfig[] = [
  {
    id: 'anbn',
    name: 'a^n b^n (Equal a\'s and b\'s)',
    states: [
      { id: 'q0', label: 'q0', x: 100, y: 200, isStart: true, isAccepting: false },
      { id: 'q1', label: 'q1', x: 300, y: 200, isStart: false, isAccepting: false },
      { id: 'q2', label: 'q2', x: 500, y: 200, isStart: false, isAccepting: true },
    ],
    transitions: [
      { id: 't1', fromState: 'q0', toState: 'q0', inputSymbol: 'a', stackTop: EPSILON, stackPush: 'A' },
      { id: 't2', fromState: 'q0', toState: 'q1', inputSymbol: 'b', stackTop: 'A', stackPush: EPSILON },
      { id: 't3', fromState: 'q1', toState: 'q1', inputSymbol: 'b', stackTop: 'A', stackPush: EPSILON },
      { id: 't4', fromState: 'q1', toState: 'q2', inputSymbol: EPSILON, stackTop: 'Z', stackPush: EPSILON },
    ],
    inputAlphabet: ['a', 'b'],
    stackAlphabet: ['A', 'Z'],
    startState: 'q0',
    initialStackSymbol: 'Z',
    acceptanceMode: 'final-state',
  },
  {
    id: 'palindrome',
    name: 'Even-length Palindromes (wcw^R)',
    states: [
      { id: 'q0', label: 'q0', x: 100, y: 200, isStart: true, isAccepting: false },
      { id: 'q1', label: 'q1', x: 300, y: 200, isStart: false, isAccepting: false },
      { id: 'q2', label: 'q2', x: 500, y: 200, isStart: false, isAccepting: true },
    ],
    transitions: [
      { id: 't1', fromState: 'q0', toState: 'q0', inputSymbol: 'a', stackTop: EPSILON, stackPush: 'A' },
      { id: 't2', fromState: 'q0', toState: 'q0', inputSymbol: 'b', stackTop: EPSILON, stackPush: 'B' },
      { id: 't3', fromState: 'q0', toState: 'q1', inputSymbol: 'c', stackTop: EPSILON, stackPush: EPSILON },
      { id: 't4', fromState: 'q1', toState: 'q1', inputSymbol: 'a', stackTop: 'A', stackPush: EPSILON },
      { id: 't5', fromState: 'q1', toState: 'q1', inputSymbol: 'b', stackTop: 'B', stackPush: EPSILON },
      { id: 't6', fromState: 'q1', toState: 'q2', inputSymbol: EPSILON, stackTop: 'Z', stackPush: EPSILON },
    ],
    inputAlphabet: ['a', 'b', 'c'],
    stackAlphabet: ['A', 'B', 'Z'],
    startState: 'q0',
    initialStackSymbol: 'Z',
    acceptanceMode: 'final-state',
  },
  {
    id: 'balanced-parens',
    name: 'Balanced Parentheses',
    states: [
      { id: 'q0', label: 'q0', x: 100, y: 200, isStart: true, isAccepting: false },
      { id: 'q1', label: 'q1', x: 300, y: 200, isStart: false, isAccepting: false },
      { id: 'q2', label: 'q2', x: 500, y: 200, isStart: false, isAccepting: true },
    ],
    transitions: [
      { id: 't1', fromState: 'q0', toState: 'q1', inputSymbol: EPSILON, stackTop: EPSILON, stackPush: EPSILON },
      { id: 't2', fromState: 'q1', toState: 'q1', inputSymbol: '(', stackTop: EPSILON, stackPush: 'X' },
      { id: 't3', fromState: 'q1', toState: 'q1', inputSymbol: ')', stackTop: 'X', stackPush: EPSILON },
      { id: 't4', fromState: 'q1', toState: 'q2', inputSymbol: EPSILON, stackTop: 'Z', stackPush: EPSILON },
    ],
    inputAlphabet: ['(', ')'],
    stackAlphabet: ['X', 'Z'],
    startState: 'q0',
    initialStackSymbol: 'Z',
    acceptanceMode: 'final-state',
  },
];
