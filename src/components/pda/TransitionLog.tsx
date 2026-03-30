import { SimulationStep } from '@/lib/pda-types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

interface TransitionLogProps {
  steps: SimulationStep[];
  currentStepIndex: number;
  accepted: boolean | null;
}

export function TransitionLog({ steps, currentStepIndex, accepted }: TransitionLogProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="text-xs font-mono text-muted-foreground mb-2">Transition Log</div>
      <ScrollArea className="flex-1 pr-2">
        <div className="flex flex-col gap-1">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: i <= currentStepIndex ? 1 : 0.3, x: 0 }}
              className={`text-xs font-mono p-2 rounded border ${
                i === currentStepIndex
                  ? 'border-state-current/50 bg-state-current/10 text-state-current'
                  : i < currentStepIndex
                  ? 'border-border bg-secondary/50 text-foreground'
                  : 'border-transparent text-muted-foreground'
              }`}
            >
              <span className="text-muted-foreground mr-1">{i}.</span> {step.description}
            </motion.div>
          ))}
        </div>
      </ScrollArea>
      {accepted !== null && currentStepIndex >= steps.length - 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mt-2 p-3 rounded-lg font-mono text-sm font-bold text-center ${
            accepted
              ? 'bg-primary/10 text-primary border border-primary/30'
              : 'bg-destructive/10 text-destructive border border-destructive/30'
          }`}
        >
          {accepted ? '✓ STRING ACCEPTED' : '✗ STRING REJECTED'}
        </motion.div>
      )}
    </div>
  );
}
