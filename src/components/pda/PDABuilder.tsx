import { useState, useRef } from 'react';
import { PDAConfig, PDAState, PDATransition, EPSILON } from '@/lib/pda-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, Upload } from 'lucide-react';
import { EXAMPLE_PDAS } from '@/lib/pda-examples';

interface PDABuilderProps {
  config: PDAConfig;
  onConfigChange: (config: PDAConfig) => void;
}

let stateCounter = 0;
let transCounter = 0;

export function PDABuilder({ config, onConfigChange }: PDABuilderProps) {
  const [showBuilder, setShowBuilder] = useState(false);
  const transitionsEndRef = useRef<HTMLDivElement>(null);

  const addState = () => {
    const id = `q${config.states.length}`;
    stateCounter++;
    const newState: PDAState = {
      id,
      label: id,
      x: 100 + (config.states.length % 4) * 150,
      y: 150 + Math.floor(config.states.length / 4) * 120,
      isStart: config.states.length === 0,
      isAccepting: false,
    };
    onConfigChange({
      ...config,
      states: [...config.states, newState],
      startState: config.states.length === 0 ? id : config.startState,
    });
  };

  const removeState = (id: string) => {
    const states = config.states.filter(s => s.id !== id);
    const transitions = config.transitions.filter(t => t.fromState !== id && t.toState !== id);
    onConfigChange({ ...config, states, transitions });
  };

  const toggleAccepting = (id: string) => {
    const states = config.states.map(s => s.id === id ? { ...s, isAccepting: !s.isAccepting } : s);
    onConfigChange({ ...config, states });
  };

  const setStartState = (id: string) => {
    const states = config.states.map(s => ({ ...s, isStart: s.id === id }));
    onConfigChange({ ...config, states, startState: id });
  };

  const addTransition = () => {
    if (config.states.length < 1) return;
    transCounter++;
    const t: PDATransition = {
      id: `t${Date.now()}`,
      fromState: config.states[0].id,
      toState: config.states[0].id,
      inputSymbol: 'a',
      stackTop: EPSILON,
      stackPush: EPSILON,
    };
    onConfigChange({ ...config, transitions: [...config.transitions, t] });
    setTimeout(() => transitionsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const updateTransition = (id: string, field: keyof PDATransition, value: string) => {
    const transitions = config.transitions.map(t => t.id === id ? { ...t, [field]: value } : t);
    onConfigChange({ ...config, transitions });
  };

  const removeTransition = (id: string) => {
    onConfigChange({ ...config, transitions: config.transitions.filter(t => t.id !== id) });
  };

  const loadExample = (exampleId: string) => {
    const example = EXAMPLE_PDAS.find(e => e.id === exampleId);
    if (example) onConfigChange({ ...example });
  };

  const saveToLocalStorage = () => {
    const saved = JSON.parse(localStorage.getItem('pda-configs') || '[]');
    const name = prompt('Name this PDA:', config.name);
    if (!name) return;
    const toSave = { ...config, id: Date.now().toString(), name };
    saved.push(toSave);
    localStorage.setItem('pda-configs', JSON.stringify(saved));
    alert('Saved!');
  };

  const loadFromLocalStorage = () => {
    const saved: PDAConfig[] = JSON.parse(localStorage.getItem('pda-configs') || '[]');
    if (saved.length === 0) { alert('No saved PDAs found.'); return; }
    const name = prompt(`Available: ${saved.map(s => s.name).join(', ')}\nEnter name to load:`);
    const found = saved.find(s => s.name === name);
    if (found) onConfigChange(found);
    else alert('Not found.');
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => setShowBuilder(!showBuilder)} className="font-mono text-xs">
          {showBuilder ? 'Hide Builder' : 'Edit PDA'}
        </Button>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={saveToLocalStorage} title="Save">
            <Save className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={loadFromLocalStorage} title="Load">
            <Upload className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Example loader */}
      <div className="flex gap-2 items-center">
        <Label className="text-xs font-mono text-muted-foreground whitespace-nowrap">Examples:</Label>
        <Select onValueChange={loadExample}>
          <SelectTrigger className="h-7 text-xs font-mono">
            <SelectValue placeholder="Load example..." />
          </SelectTrigger>
          <SelectContent>
            {EXAMPLE_PDAS.map(e => (
              <SelectItem key={e.id} value={e.id} className="text-xs font-mono">{e.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showBuilder && (
        <div className="max-h-[60vh] overflow-auto">
          <div className="flex flex-col gap-4 pr-3">
            {/* States */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-mono text-muted-foreground">States</Label>
                <Button variant="outline" size="sm" onClick={addState} className="h-6 text-xs">
                  <Plus className="w-3 h-3 mr-1" /> State
                </Button>
              </div>
              <div className="flex flex-col gap-1">
                {config.states.map(s => (
                  <div key={s.id} className="flex items-center gap-2 bg-secondary/50 rounded p-2">
                    <span className="font-mono text-xs font-semibold w-8">{s.label}</span>
                    <Button
                      variant={s.isStart ? 'default' : 'ghost'}
                      size="sm"
                      className="h-5 text-[10px] px-1.5"
                      onClick={() => setStartState(s.id)}
                    >
                      Start
                    </Button>
                    <Button
                      variant={s.isAccepting ? 'default' : 'ghost'}
                      size="sm"
                      className="h-5 text-[10px] px-1.5"
                      onClick={() => toggleAccepting(s.id)}
                    >
                      Accept
                    </Button>
                    <Button variant="ghost" size="sm" className="h-5 ml-auto" onClick={() => removeState(s.id)}>
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Transitions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-mono text-muted-foreground">Transitions</Label>
                <Button variant="outline" size="sm" onClick={addTransition} className="h-6 text-xs" disabled={config.states.length === 0}>
                  <Plus className="w-3 h-3 mr-1" /> Transition
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {config.transitions.map(t => (
                  <div key={t.id} className="bg-secondary/50 rounded p-2 flex flex-col gap-1.5">
                    <div className="flex gap-1.5 items-center flex-wrap">
                      <span className="text-[10px] text-muted-foreground font-mono">δ(</span>
                      <Select value={t.fromState} onValueChange={v => updateTransition(t.id, 'fromState', v)}>
                        <SelectTrigger className="h-6 w-16 text-xs font-mono"><SelectValue /></SelectTrigger>
                        <SelectContent>{config.states.map(s => <SelectItem key={s.id} value={s.id} className="text-xs font-mono">{s.label}</SelectItem>)}</SelectContent>
                      </Select>
                      <span className="text-[10px] text-muted-foreground">,</span>
                      <Input value={t.inputSymbol} onChange={e => updateTransition(t.id, 'inputSymbol', e.target.value || EPSILON)} className="h-6 w-10 text-xs font-mono text-center p-0" />
                      <span className="text-[10px] text-muted-foreground">,</span>
                      <Input value={t.stackTop} onChange={e => updateTransition(t.id, 'stackTop', e.target.value || EPSILON)} className="h-6 w-10 text-xs font-mono text-center p-0" />
                      <span className="text-[10px] text-muted-foreground font-mono">)→(</span>
                      <Select value={t.toState} onValueChange={v => updateTransition(t.id, 'toState', v)}>
                        <SelectTrigger className="h-6 w-16 text-xs font-mono"><SelectValue /></SelectTrigger>
                        <SelectContent>{config.states.map(s => <SelectItem key={s.id} value={s.id} className="text-xs font-mono">{s.label}</SelectItem>)}</SelectContent>
                      </Select>
                      <span className="text-[10px] text-muted-foreground">,</span>
                      <Input value={t.stackPush} onChange={e => updateTransition(t.id, 'stackPush', e.target.value || EPSILON)} className="h-6 w-12 text-xs font-mono text-center p-0" />
                      <span className="text-[10px] text-muted-foreground font-mono">)</span>
                      <Button variant="ghost" size="sm" className="h-5 ml-auto" onClick={() => removeTransition(t.id)}>
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  ))}
                </div>
                <div ref={transitionsEndRef} />
            </div>

            {/* Initial stack symbol */}
            <div className="flex items-center gap-2">
              <Label className="text-xs font-mono text-muted-foreground whitespace-nowrap">Stack start:</Label>
              <Input
                value={config.initialStackSymbol}
                onChange={e => onConfigChange({ ...config, initialStackSymbol: e.target.value || 'Z' })}
                className="h-7 w-12 text-xs font-mono text-center"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
