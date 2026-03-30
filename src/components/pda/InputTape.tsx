import { EPSILON } from '@/lib/pda-types';

interface InputTapeProps {
  input: string;
  currentIndex: number;
}

export function InputTape({ input, currentIndex }: InputTapeProps) {
  const symbols = input.split('');

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xs font-mono text-muted-foreground">Input Tape</div>
      <div className="flex gap-0.5">
        {symbols.length === 0 ? (
          <div className="w-10 h-10 border border-border rounded flex items-center justify-center font-mono text-sm text-muted-foreground italic">
            {EPSILON}
          </div>
        ) : (
          symbols.map((s, i) => (
            <div
              key={i}
              className={`w-10 h-10 border rounded flex items-center justify-center font-mono text-sm font-semibold transition-all duration-300 ${
                i === currentIndex
                  ? 'border-state-current bg-state-current/20 text-state-current scale-110'
                  : i < currentIndex
                  ? 'border-primary/30 bg-primary/5 text-primary/60'
                  : 'border-border text-foreground'
              }`}
            >
              {s}
            </div>
          ))
        )}
        {/* End marker */}
        <div className={`w-10 h-10 border border-border/50 rounded flex items-center justify-center font-mono text-xs text-muted-foreground ${
          currentIndex >= symbols.length ? 'border-state-current bg-state-current/10' : ''
        }`}>
          ⊣
        </div>
      </div>
      <div className="text-xs text-muted-foreground font-mono">
        Position: {currentIndex}/{symbols.length}
      </div>
    </div>
  );
}
