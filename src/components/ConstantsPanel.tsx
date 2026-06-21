import { useState } from 'react';
import { physicalConstants } from '../data/constants';
import { Compass, Search, Copy, Check, Plus, HelpCircle } from 'lucide-react';
import { PhysicalConstant } from '../types';
import { playHapticClick } from '../utils/audio';

interface ConstantsPanelProps {
  onInsertConstant: (symbol: string) => void;
}

export default function ConstantsPanel({ onInsertConstant }: ConstantsPanelProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);

  // Filter calculations
  const filteredConstants = physicalConstants.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCopyValue = (c: PhysicalConstant) => {
    navigator.clipboard.writeText(c.value.toString());
    setCopiedSymbol(c.symbol);
    setTimeout(() => setCopiedSymbol(null), 1500);
  };

  const categories = ['All', 'Physics', 'Chemistry', 'Cosmology', 'Mathematics'];

  return (
    <div className="flex flex-col h-full bg-[#080a0e] p-4 rounded-2xl border border-white/5 text-slate-300 shadow-2xl justify-between overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-2 text-cyan-400">
              <Compass size={16} />
              Scientific Constants Reference
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Quickly query standard parameters. Tap [+] to insert into your expressions.</p>
          </div>
        </div>

        {/* Search controls */}
        <div className="flex gap-2 items-center bg-[#0a0c10] border border-white/5 rounded-xl px-3 py-1.5 mb-3 group focus-within:border-cyan-500/50 transition-colors">
          <Search size={14} className="text-slate-500 group-focus-within:text-cyan-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs w-full text-white placeholder-slate-600 focus:outline-none"
            placeholder="Search constants (e.g. Planck, c, Avogadro)..."
          />
        </div>

        {/* Categories Tab selector */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-white/5 mb-3 text-[10px] whitespace-nowrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                playHapticClick('standard');
                setSelectedCategory(cat);
              }}
              className={`p-1.5 px-3 rounded-lg border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-medium'
                  : 'bg-[#0a0c10]/40 border-white/5 text-slate-500 hover:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dynamic Lists */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {filteredConstants.length === 0 ? (
            <div className="text-center text-slate-500 text-xs py-8 font-mono">No matching physical constants found.</div>
          ) : (
            filteredConstants.map((c) => (
              <div
                key={c.symbol}
                className="bg-[#0a0c10]/40 hover:bg-[#0a0c10]/80 border border-white/5 p-3 rounded-xl transition-all flex flex-col gap-2 relative group"
              >
                {/* Symbol badge & Name */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#05070a] border border-white/5 p-1 px-2.5 rounded-md font-mono text-xs font-bold text-cyan-400 select-all shadow-[inset_0_0_8px_rgba(6,182,212,0.05)]">
                      {c.symbol}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-slate-200 leading-tight">{c.name}</span>
                      <span className="text-[9px] text-slate-500 font-mono tracking-wider">{c.category}</span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* Copy precise numerical value */}
                    <button
                      onClick={() => {
                        playHapticClick('standard');
                        handleCopyValue(c);
                      }}
                      className="p-1 px-1.5 bg-[#05070a] hover:bg-white/5 border border-white/5 rounded-md text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      title="Copy exact value"
                    >
                      {copiedSymbol === c.symbol ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                    </button>
                    {/* Injects symbol into clc input */}
                    <button
                      onClick={() => {
                        playHapticClick('standard');
                        onInsertConstant(c.symbol);
                      }}
                      className="p-1 px-2 bg-cyan-950/20 hover:bg-cyan-950/40 border border-cyan-500/20 hover:border-cyan-500/45 rounded-md text-cyan-400 font-bold transition-all text-[9px] font-mono uppercase tracking-wider flex items-center gap-1 shadow-sm cursor-pointer"
                      title="Insert symbol into expression"
                    >
                      <Plus size={11} />
                      <span className="text-[10px]">Insert</span>
                    </button>
                  </div>
                </div>

                {/* Sub data text values */}
                <div className="grid grid-cols-1 gap-1 text-[10px] font-mono border-t border-white/5 pt-2 text-slate-500">
                  <div className="flex items-baseline justify-between select-all">
                    <span>Precision value:</span>
                    <span className="text-slate-400 font-medium font-mono text-[10.5px] text-right break-all">
                      {c.value.toExponential(7)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between font-mono text-[9px]">
                    <span>Units:</span>
                    <span className="text-slate-500 font-mono italic text-[9.5px] text-right">{c.unit}</span>
                  </div>
                </div>

                {/* Constant explanation Tooltip on Hover */}
                <p className="text-[9.5px] text-slate-500 leading-snug mt-1 italic border-l border-cyan-500/30 pl-2">
                  {c.description}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
