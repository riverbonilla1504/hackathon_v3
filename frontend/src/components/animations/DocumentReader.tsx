'use client';

import { useState, useEffect } from 'react';
import { FileText, BookOpen, Sparkles } from 'lucide-react';

interface DocumentLine {
  id: number;
  text: string;
  delay: number;
}

const documentLines: DocumentLine[] = [
  { id: 1, text: 'Understanding the fundamentals...', delay: 0 },
  { id: 2, text: 'Analyzing complex patterns...', delay: 1500 },
  { id: 3, text: 'Processing information...', delay: 3000 },
  { id: 4, text: 'Generating insights...', delay: 4500 },
  { id: 5, text: 'Completing analysis...', delay: 6000 },
];

export default function DocumentReader() {
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [completedLines, setCompletedLines] = useState<Set<number>>(new Set());
  const [isReading, setIsReading] = useState(true);

  useEffect(() => {
    if (!isReading) return;

    const timeouts: NodeJS.Timeout[] = [];

    documentLines.forEach((line) => {
      // Show line
      const showTimeout = setTimeout(() => {
        setActiveLine(line.id);
      }, line.delay);

      // Complete line
      const completeTimeout = setTimeout(() => {
        setActiveLine(null);
        setCompletedLines((prev) => new Set([...prev, line.id]));
      }, line.delay + 1200);

      timeouts.push(showTimeout, completeTimeout);
    });

    // Restart animation
    const restartTimeout = setTimeout(() => {
      setCompletedLines(new Set());
      setActiveLine(null);
    }, 8000);

    timeouts.push(restartTimeout);

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isReading]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-xl">
        {/* Document Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">Document Analysis</h3>
            <p className="text-sm text-muted-foreground">Processing in progress...</p>
          </div>
          <div className="ml-auto">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </div>
        </div>

        {/* Document Content */}
        <div className="space-y-3">
          {documentLines.map((line) => {
            const isActive = activeLine === line.id;
            const isCompleted = completedLines.has(line.id);

            return (
              <div
                key={line.id}
                className={`flex items-center gap-3 transition-all duration-500 ${
                  isActive
                    ? 'translate-x-2 opacity-100'
                    : isCompleted
                    ? 'opacity-60'
                    : 'opacity-30'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-primary scale-150 animate-pulse'
                      : isCompleted
                      ? 'bg-primary/50'
                      : 'bg-muted-foreground/30'
                  }`}
                />
                <div className="flex-1">
                  <div
                    className={`h-4 rounded transition-all duration-500 ${
                      isActive
                        ? 'bg-primary/20 w-full'
                        : isCompleted
                        ? 'bg-muted-foreground/10 w-full'
                        : 'bg-muted-foreground/5 w-3/4'
                    }`}
                  />
                </div>
                {isActive && (
                  <BookOpen className="w-4 h-4 text-primary animate-bounce" />
                )}
              </div>
            );
          })}
        </div>

        {/* Reading Indicator */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-150" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-300" />
            </div>
            <span>Reading document...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

