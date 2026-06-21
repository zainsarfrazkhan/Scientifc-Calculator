import { Trash2, History, RotateCcw, Copy, Check, CornerDownLeft } from 'lucide-react';
import { HistoryItem } from '../types';
import { useState } from 'react';
import { playHapticClick } from '../utils/audio';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelectExpression: (expr: string) => void;
  onSelectResult: (result: string) => void;
  onClearHistory: () => void;
}

export default function HistoryPanel({
  history,
  onSelectExpression,
  onSelectResult,
  onClearHistory,
}: HistoryPanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#080a0e] p-4 rounded-2xl border border-white/5 text-slate-300 shadow-2xl justify-between overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-2 text-cyan-400">
              <History size={16} />
              Calculation History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Loads calculations from previous sessions.</p>
          </div>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="p-1 px-2 text-[10px] uppercase font-mono tracking-wider border border-red-500/20 bg-red-900/10 hover:bg-red-900/25 text-red-400 rounded-lg hover:text-red-200 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Wipe calculations"
            >
              <Trash2 size={12} />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* List of past item calculations */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-slate-500 font-mono text-center">
              <History size={36} className="text-slate-700 mb-3 animate-pulse" />
              <span className="text-xs font-semibold">No recorded calculations</span>
              <p className="text-[10px] text-slate-600 mt-1 max-w-[180px]">Your evaluations and outcomes will populate here automatically.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="bg-[#0a0c10]/40 hover:bg-[#0a0c10]/80 border border-white/5 p-3.5 rounded-xl flex flex-col gap-2 transition-all relative group"
              >
                {/* Visual Indicators of exact hour/min */}
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                  <span>{item.timestamp}</span>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        playHapticClick('standard');
                        handleCopy(item.id, `${item.expression} = ${item.result}`);
                      }}
                      className="p-1 hover:text-cyan-400 hover:bg-[#05070a] rounded transition-colors cursor-pointer"
                      title="Copy formula & result"
                    >
                      {copiedId === item.id ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                    </button>
                  </div>
                </div>

                {/* Mathematical inputs formula */}
                <div className="text-[12px] font-mono whitespace-pre-wrap text-slate-300 font-medium select-all break-all">
                  {item.expression}
                </div>

                {/* Calculated Result Output */}
                <div className="flex items-center justify-between mt-1.5 border-t border-white/5 pt-2.5">
                  <span className="text-[10px] text-cyan-500 font-bold font-mono">Result:</span>
                  <span className="text-xs font-bold font-mono text-cyan-400 select-all truncate max-w-[80%]">
                    {item.result}
                  </span>
                </div>

                {/* Hover Quick Actions */}
                <div className="grid grid-cols-2 gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 text-[10px] font-mono">
                  <button
                    onClick={() => {
                      playHapticClick('standard');
                      onSelectExpression(item.expression);
                    }}
                    className="flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-[#05070a] border border-white/5 hover:border-cyan-500/30 hover:text-cyan-400 text-slate-400 cursor-pointer transition-colors"
                    title="Load formula expression to workspace"
                  >
                    <RotateCcw size={11} />
                    <span>Load Formula</span>
                  </button>
                  <button
                    onClick={() => {
                      playHapticClick('standard');
                      onSelectResult(item.result);
                    }}
                    className="flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-[#05070a] border border-white/5 hover:border-cyan-500/30 hover:text-cyan-400 text-slate-400 cursor-pointer transition-colors"
                    title="Insert result value into workspace"
                  >
                    <CornerDownLeft size={11} />
                    <span>Insert Result</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
