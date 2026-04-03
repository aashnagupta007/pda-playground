import { useState, useCallback, useEffect, useRef } from 'react';
import { PDAConfig, SimulationStep, ComputationPath } from '@/lib/pda-types';
import { simulatePDA } from '@/lib/pda-engine';
import { EXAMPLE_PDAS } from '@/lib/pda-examples';
import { PDAGraph } from '@/components/pda/PDAGraph';
import { StackVisualizer } from '@/components/pda/StackVisualizer';
import { TransitionLog } from '@/components/pda/TransitionLog';
import { InputTape } from '@/components/pda/InputTape';
import { PDABuilder } from '@/components/pda/PDABuilder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, SkipForward, SkipBack, RotateCcw, Pause, ChevronRight } from 'lucide-react';
import { AcceptanceMode } from '@/lib/pda-types';
import { motion } from 'framer-motion';

const PDASimulator = () => {
  const [config, setConfig] = useState<PDAConfig>(EXAMPLE_PDAS[0]);
  const [inputString, setInputString] = useState('aabb');
  const [paths, setPaths] = useState<ComputationPath[]>([]);
  const [selectedPathIndex, setSelectedPathIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(800);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentPath = paths[selectedPathIndex];
  const currentStep = currentPath?.steps[currentStepIndex];
  const isSimulated = paths.length > 0;




  const runSimulation = useCallback(() => {
    const result = simulatePDA(config, inputString);
    setPaths(result);
    setSelectedPathIndex(0);
    setCurrentStepIndex(0);
    setIsRunning(false);
  }, [config, inputString]);

  const reset = useCallback(() => {
    setPaths([]);
    setCurrentStepIndex(-1);
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const stepForward = useCallback(() => {
    if (!currentPath) return;
    setCurrentStepIndex(prev => Math.min(prev + 1, currentPath.steps.length - 1));
  }, [currentPath]);

  const stepBackward = useCallback(() => {
    setCurrentStepIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const updateAcceptanceMode = useCallback((mode: AcceptanceMode) => {
    setConfig(prev => ({ ...prev, acceptanceMode: mode }));
    reset();
  }, [reset]);

  const autoRun = useCallback(() => {
    if (!isSimulated) {
      runSimulation();
    }
    setIsRunning(true);
  }, [isSimulated, runSimulation]);

  const pauseRun = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (isRunning && currentPath) {
      intervalRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= currentPath.steps.length - 1) {
            setIsRunning(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
  }, [isRunning, currentPath, speed]);

  const acceptingPaths = paths.filter(p => p.accepted);
  const rejectingPaths = paths.filter(p => !p.accepted);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold font-mono text-primary tracking-tight">PDA Simulator</h1>
          <span className="text-xs text-muted-foreground font-mono">Pushdown Automaton</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-xs font-mono text-muted-foreground">Acceptance:</Label>
            <Select value={config.acceptanceMode} onValueChange={(v: AcceptanceMode) => updateAcceptanceMode(v)}>
              <SelectTrigger className="h-7 w-32 text-xs font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="final-state" className="text-xs font-mono">Final State</SelectItem>
                <SelectItem value="empty-stack" className="text-xs font-mono">Empty Stack</SelectItem>
                <SelectItem value="both" className="text-xs font-mono">Either</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs font-mono text-muted-foreground">Speed:</Label>
            <Select value={speed.toString()} onValueChange={v => setSpeed(parseInt(v))}>
              <SelectTrigger className="h-7 w-24 text-xs font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1200" className="text-xs font-mono">Slow</SelectItem>
                <SelectItem value="800" className="text-xs font-mono">Normal</SelectItem>
                <SelectItem value="400" className="text-xs font-mono">Fast</SelectItem>
                <SelectItem value="150" className="text-xs font-mono">Turbo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Input bar */}
      <div className="border-b border-border px-4 py-2 flex items-center gap-3 bg-card/50 flex-wrap">
        <div className="flex items-center gap-2">
          <Label className="text-xs font-mono text-muted-foreground">Input:</Label>
          <Input
            value={inputString}
            onChange={e => { setInputString(e.target.value); reset(); }}
            className="h-8 w-40 text-sm font-mono"
            placeholder="Enter string..."
          />
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" onClick={runSimulation} className="h-8 text-xs font-mono gap-1">
            <Play className="w-3.5 h-3.5" /> Run
          </Button>
          <Button size="sm" variant="outline" onClick={stepBackward} disabled={!isSimulated || currentStepIndex <= 0} className="h-8 text-xs font-mono gap-1">
            <SkipBack className="w-3.5 h-3.5" /> Prev
          </Button>
          <Button size="sm" variant="outline" onClick={stepForward} disabled={!isSimulated || currentStepIndex >= (currentPath?.steps.length ?? 0) - 1} className="h-8 text-xs font-mono gap-1">
            <SkipForward className="w-3.5 h-3.5" /> Step
          </Button>
          {isRunning ? (
            <Button size="sm" variant="outline" onClick={pauseRun} className="h-8 text-xs font-mono gap-1">
              <Pause className="w-3.5 h-3.5" /> Pause
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={autoRun} disabled={!isSimulated && config.states.length === 0} className="h-8 text-xs font-mono gap-1">
              <ChevronRight className="w-3.5 h-3.5" /> Auto
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={reset} className="h-8 text-xs font-mono gap-1">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
        </div>
        {isSimulated && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs font-mono text-muted-foreground">
              {paths.length} path{paths.length > 1 ? 's' : ''}
              {acceptingPaths.length > 0 && <span className="text-primary ml-1">({acceptingPaths.length} accepting)</span>}
            </span>
            {paths.length > 1 && (
              <Select value={selectedPathIndex.toString()} onValueChange={v => { setSelectedPathIndex(parseInt(v)); setCurrentStepIndex(0); }}>
                <SelectTrigger className="h-7 w-32 text-xs font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paths.map((p, i) => (
                    <SelectItem key={i} value={i.toString()} className="text-xs font-mono">
                      Path {i + 1} {p.accepted ? '✓' : '✗'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </div>

      {/* Input tape */}
      {isSimulated && currentStep && (
        <div className="border-b border-border px-4 py-2 flex justify-center bg-card/30">
          <InputTape input={inputString} currentIndex={currentStep.inputIndex} />
        </div>
      )}

      {/* Main content - split screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left - Graph + Builder */}
        <div className="flex-1 flex flex-col border-r border-border min-w-0">
          <div className="h-[35%] min-h-[180px] relative">
            <PDAGraph
              config={config}
              currentStateId={currentStep?.stateId}
              activeTransitionId={currentStep?.transitionUsed?.id}
            />
          </div>
          <div className="border-t border-border p-3 bg-card/50 flex-1 overflow-auto">
            <PDABuilder config={config} onConfigChange={(c) => { setConfig(c); reset(); }} />
          </div>
        </div>

        {/* Right - Stack + Log */}
        <motion.div
          className="w-72 lg:w-80 flex flex-col bg-card/30 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Stack */}
          <div className="border-b border-border p-4 flex justify-center">
            <StackVisualizer
              stack={currentStep?.stack ?? [config.initialStackSymbol]}
            />
          </div>

          {/* Log */}
          <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
            {isSimulated && currentPath ? (
              <TransitionLog
                steps={currentPath.steps}
                currentStepIndex={currentStepIndex}
                accepted={currentStepIndex >= currentPath.steps.length - 1 ? currentPath.accepted : null}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground font-mono">
                Run simulation to see logs
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PDASimulator;
