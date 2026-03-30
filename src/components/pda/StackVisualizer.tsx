import { motion, AnimatePresence } from 'framer-motion';

interface StackVisualizerProps {
  stack: string[];
  previousStack?: string[];
}

export function StackVisualizer({ stack, previousStack }: StackVisualizerProps) {
  const displayStack = [...stack].reverse(); // top of stack first

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xs font-mono text-muted-foreground mb-1">Stack (top ↑)</div>
      <div className="relative w-24 min-h-[120px] border-l-2 border-r-2 border-b-2 border-muted-foreground/30 rounded-b-md flex flex-col-reverse items-center gap-1 p-2">
        <AnimatePresence mode="popLayout">
          {displayStack.reverse().map((symbol, i) => (
            <motion.div
              key={`${i}-${symbol}`}
              layout
              initial={{ scale: 0.5, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full py-1.5 rounded text-center font-mono text-sm font-semibold bg-stack-item/20 text-stack-item border border-stack-item/30"
            >
              {symbol}
            </motion.div>
          ))}
        </AnimatePresence>
        {displayStack.length === 0 && (
          <div className="text-xs text-muted-foreground italic">empty</div>
        )}
      </div>
    </div>
  );
}
