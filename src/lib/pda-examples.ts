import { PDAConfig, EPSILON } from './pda-types';

export const EXAMPLE_PDAS: PDAConfig[] = [
  // ── a^n b^n by EMPTY STACK ──
  {
    id: 'anbn-es',
    name: 'a^n b^n (Empty Stack)',
    states: [
      { id: 'q0', label: 'q0', x: 100, y: 200, isStart: true, isAccepting: false },
      { id: 'q1', label: 'q1', x: 300, y: 200, isStart: false, isAccepting: false },
      { id: 'q2', label: 'q2', x: 500, y: 200, isStart: false, isAccepting: false },
    ],
    transitions: [
      { id: 't1', fromState: 'q0', toState: 'q1', inputSymbol: 'a', stackTop: 'Z', stackPush: 'XZ' },
      { id: 't2', fromState: 'q1', toState: 'q1', inputSymbol: 'a', stackTop: 'X', stackPush: 'XX' },
      { id: 't3', fromState: 'q1', toState: 'q2', inputSymbol: 'b', stackTop: 'X', stackPush: EPSILON },
      { id: 't4', fromState: 'q2', toState: 'q2', inputSymbol: 'b', stackTop: 'X', stackPush: EPSILON },
      { id: 't5', fromState: 'q2', toState: 'q2', inputSymbol: EPSILON, stackTop: 'Z', stackPush: EPSILON },
    ],
    inputAlphabet: ['a', 'b'],
    stackAlphabet: ['X', 'Z'],
    startState: 'q0',
    initialStackSymbol: 'Z',
    acceptanceMode: 'empty-stack',
  },
  // ── a^n b^n by FINAL STATE ──
  {
    id: 'anbn-fs',
    name: 'a^n b^n (Final State)',
    states: [
      { id: 'q0', label: 'q0', x: 100, y: 200, isStart: true, isAccepting: false },
      { id: 'q1', label: 'q1', x: 300, y: 200, isStart: false, isAccepting: false },
      { id: 'q2', label: 'q2', x: 500, y: 200, isStart: false, isAccepting: true },
    ],
    transitions: [
      { id: 't1', fromState: 'q0', toState: 'q0', inputSymbol: 'a', stackTop: 'Z', stackPush: 'XZ' },
      { id: 't2', fromState: 'q0', toState: 'q0', inputSymbol: 'a', stackTop: 'X', stackPush: 'XX' },
      { id: 't3', fromState: 'q0', toState: 'q1', inputSymbol: 'b', stackTop: 'X', stackPush: EPSILON },
      { id: 't4', fromState: 'q1', toState: 'q1', inputSymbol: 'b', stackTop: 'X', stackPush: EPSILON },
      { id: 't5', fromState: 'q1', toState: 'q2', inputSymbol: EPSILON, stackTop: 'Z', stackPush: 'Z' },
    ],
    inputAlphabet: ['a', 'b'],
    stackAlphabet: ['X', 'Z'],
    startState: 'q0',
    initialStackSymbol: 'Z',
    acceptanceMode: 'final-state',
  },
  // ── Palindromes wcw^R by EMPTY STACK (12 transitions) ──
  {
    id: 'palindrome-es',
    name: 'wcw^R Palindrome (Empty Stack)',
    states: [
      { id: 'q0', label: 'q0', x: 100, y: 200, isStart: true, isAccepting: false },
      { id: 'q1', label: 'q1', x: 350, y: 200, isStart: false, isAccepting: false },
    ],
    transitions: [
      // Push phase – read a/b onto stack with explicit stack-top cases
      { id: 't1', fromState: 'q0', toState: 'q0', inputSymbol: 'a', stackTop: 'Z', stackPush: 'XZ' },
      { id: 't2', fromState: 'q0', toState: 'q0', inputSymbol: 'b', stackTop: 'Z', stackPush: 'YZ' },
      { id: 't3', fromState: 'q0', toState: 'q0', inputSymbol: 'a', stackTop: 'X', stackPush: 'XX' },
      { id: 't4', fromState: 'q0', toState: 'q0', inputSymbol: 'a', stackTop: 'Y', stackPush: 'XY' },
      { id: 't5', fromState: 'q0', toState: 'q0', inputSymbol: 'b', stackTop: 'X', stackPush: 'YX' },
      { id: 't6', fromState: 'q0', toState: 'q0', inputSymbol: 'b', stackTop: 'Y', stackPush: 'YY' },
      // Center marker c – move to q1, keep stack unchanged
      { id: 't7', fromState: 'q0', toState: 'q1', inputSymbol: 'c', stackTop: 'Z', stackPush: 'Z' },
      { id: 't8', fromState: 'q0', toState: 'q1', inputSymbol: 'c', stackTop: 'X', stackPush: 'X' },
      { id: 't9', fromState: 'q0', toState: 'q1', inputSymbol: 'c', stackTop: 'Y', stackPush: 'Y' },
      // Pop/match phase
      { id: 't10', fromState: 'q1', toState: 'q1', inputSymbol: 'a', stackTop: 'X', stackPush: EPSILON },
      { id: 't11', fromState: 'q1', toState: 'q1', inputSymbol: 'b', stackTop: 'Y', stackPush: EPSILON },
      // Accept by empty stack – pop Z
      { id: 't12', fromState: 'q1', toState: 'q1', inputSymbol: EPSILON, stackTop: 'Z', stackPush: EPSILON },
    ],
    inputAlphabet: ['a', 'b', 'c'],
    stackAlphabet: ['X', 'Y', 'Z'],
    startState: 'q0',
    initialStackSymbol: 'Z',
    acceptanceMode: 'empty-stack',
  },
  // ── Palindromes wcw^R by FINAL STATE ──
  {
    id: 'palindrome-fs',
    name: 'wcw^R Palindrome (Final State)',
    states: [
      { id: 'q0', label: 'q0', x: 100, y: 200, isStart: true, isAccepting: false },
      { id: 'q1', label: 'q1', x: 350, y: 200, isStart: false, isAccepting: false },
      { id: 'q2', label: 'q2', x: 550, y: 200, isStart: false, isAccepting: true },
    ],
    transitions: [
      { id: 't1', fromState: 'q0', toState: 'q0', inputSymbol: 'a', stackTop: 'Z', stackPush: 'XZ' },
      { id: 't2', fromState: 'q0', toState: 'q0', inputSymbol: 'b', stackTop: 'Z', stackPush: 'YZ' },
      { id: 't3', fromState: 'q0', toState: 'q0', inputSymbol: 'a', stackTop: 'X', stackPush: 'XX' },
      { id: 't4', fromState: 'q0', toState: 'q0', inputSymbol: 'a', stackTop: 'Y', stackPush: 'XY' },
      { id: 't5', fromState: 'q0', toState: 'q0', inputSymbol: 'b', stackTop: 'X', stackPush: 'YX' },
      { id: 't6', fromState: 'q0', toState: 'q0', inputSymbol: 'b', stackTop: 'Y', stackPush: 'YY' },
      { id: 't7', fromState: 'q0', toState: 'q1', inputSymbol: 'c', stackTop: 'Z', stackPush: 'Z' },
      { id: 't8', fromState: 'q0', toState: 'q1', inputSymbol: 'c', stackTop: 'X', stackPush: 'X' },
      { id: 't9', fromState: 'q0', toState: 'q1', inputSymbol: 'c', stackTop: 'Y', stackPush: 'Y' },
      { id: 't10', fromState: 'q1', toState: 'q1', inputSymbol: 'a', stackTop: 'X', stackPush: EPSILON },
      { id: 't11', fromState: 'q1', toState: 'q1', inputSymbol: 'b', stackTop: 'Y', stackPush: EPSILON },
      // Final state: on seeing Z, go to accepting state q2 (keep Z on stack)
      { id: 't12', fromState: 'q1', toState: 'q2', inputSymbol: EPSILON, stackTop: 'Z', stackPush: 'Z' },
    ],
    inputAlphabet: ['a', 'b', 'c'],
    stackAlphabet: ['X', 'Y', 'Z'],
    startState: 'q0',
    initialStackSymbol: 'Z',
    acceptanceMode: 'final-state',
  },
  // ── Balanced Parentheses by EMPTY STACK ──
  {
    id: 'balanced-parens-es',
    name: 'Balanced Parentheses (Empty Stack)',
    states: [
      { id: 'q0', label: 'q0', x: 100, y: 200, isStart: true, isAccepting: false },
      { id: 'q1', label: 'q1', x: 300, y: 200, isStart: false, isAccepting: false },
      { id: 'q2', label: 'q2', x: 500, y: 200, isStart: false, isAccepting: false },
    ],
    transitions: [
      { id: 't1', fromState: 'q0', toState: 'q1', inputSymbol: '(', stackTop: 'Z', stackPush: 'XZ' },
      { id: 't2', fromState: 'q1', toState: 'q1', inputSymbol: '(', stackTop: 'X', stackPush: 'XX' },
      { id: 't3', fromState: 'q1', toState: 'q1', inputSymbol: ')', stackTop: 'X', stackPush: EPSILON },
      { id: 't4', fromState: 'q1', toState: 'q2', inputSymbol: EPSILON, stackTop: 'Z', stackPush: EPSILON },
    ],
    inputAlphabet: ['(', ')'],
    stackAlphabet: ['X', 'Z'],
    startState: 'q0',
    initialStackSymbol: 'Z',
    acceptanceMode: 'empty-stack',
  },
  // ── Balanced Parentheses by FINAL STATE ──
  {
    id: 'balanced-parens-fs',
    name: 'Balanced Parentheses (Final State)',
    states: [
      { id: 'q0', label: 'q0', x: 100, y: 200, isStart: true, isAccepting: false },
      { id: 'q1', label: 'q1', x: 300, y: 200, isStart: false, isAccepting: false },
      { id: 'q2', label: 'q2', x: 500, y: 200, isStart: false, isAccepting: true },
    ],
    transitions: [
      { id: 't1', fromState: 'q0', toState: 'q1', inputSymbol: '(', stackTop: 'Z', stackPush: 'XZ' },
      { id: 't2', fromState: 'q1', toState: 'q1', inputSymbol: '(', stackTop: 'X', stackPush: 'XX' },
      { id: 't3', fromState: 'q1', toState: 'q1', inputSymbol: ')', stackTop: 'X', stackPush: EPSILON },
      { id: 't4', fromState: 'q1', toState: 'q2', inputSymbol: EPSILON, stackTop: 'Z', stackPush: 'Z' },
    ],
    inputAlphabet: ['(', ')'],
    stackAlphabet: ['X', 'Z'],
    startState: 'q0',
    initialStackSymbol: 'Z',
    acceptanceMode: 'final-state',
  },
];
