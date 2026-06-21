import { useState, useEffect } from 'react';
import { unitCategories, convertUnits } from '../data/units';
import { Scale, ArrowLeftRight, Copy, Import, Check, Calculator } from 'lucide-react';
import { playHapticClick } from '../utils/audio';

interface ConverterPanelProps {
  onInsertToInput: (expr: string) => void;
}

export default function ConverterPanel({ onInsertToInput }: ConverterPanelProps) {
  // Category State
  const [selectedCatId, setSelectedCatId] = useState<string>('length');

  // Value States
  const [sourceValueStr, setSourceValueStr] = useState<string>('1');
  const [sourceValue, setSourceValue] = useState<number>(1);

  // Unit States
  const [fromUnitSymbol, setFromUnitSymbol] = useState<string>('m');
  const [toUnitSymbol, setToUnitSymbol] = useState<string>('ft');

  // Coordinated Statuses
  const [copied, setCopied] = useState<boolean>(false);

  const activeCategory = unitCategories.find(c => c.id === selectedCatId) || unitCategories[0];

  // Update default units when Category changes
  useEffect(() => {
    if (activeCategory.units.length >= 2) {
      setFromUnitSymbol(activeCategory.units[0].symbol);
      setToUnitSymbol(activeCategory.units[1].symbol);
    }
  }, [selectedCatId]);

  // Handle number input changes
  useEffect(() => {
    const parsed = parseFloat(sourceValueStr);
    if (!isNaN(parsed)) {
      setSourceValue(parsed);
    } else {
      setSourceValue(0);
    }
  }, [sourceValueStr]);

  const convertedResult = convertUnits(sourceValue, fromUnitSymbol, toUnitSymbol, activeCategory);

  const handleSwap = () => {
    const temp = fromUnitSymbol;
    setFromUnitSymbol(toUnitSymbol);
    setToUnitSymbol(temp);
  };

  const handleCopyValue = () => {
    navigator.clipboard.writeText(convertedResult.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Human descriptive text for helper
  const getFormulaHelper = () => {
    if (activeCategory.id === 'temperature') {
      if (fromUnitSymbol === '°C' && toUnitSymbol === '°F') return 'Formula: (°C × 9/5) + 32';
      if (fromUnitSymbol === '°F' && toUnitSymbol === '°C') return 'Formula: (°F − 32) × 5/9';
      if (fromUnitSymbol === '°C' && toUnitSymbol === 'K') return 'Formula: °C + 273.15';
      if (fromUnitSymbol === 'K' && toUnitSymbol === '°C') return 'Formula: K − 273.15';
      if (fromUnitSymbol === 'K' && toUnitSymbol === '°F') return 'Formula: (K − 273.15) × 9/5 + 32';
      if (fromUnitSymbol === '°F' && toUnitSymbol === 'K') return 'Formula: (°F − 32) × 5/9 + 273.15';
      return 'Identical Units';
    }

    const fromUnit = activeCategory.units.find(u => u.symbol === fromUnitSymbol);
    const toUnit = activeCategory.units.find(u => u.symbol === toUnitSymbol);
    if (fromUnit && toUnit) {
      const ratio = fromUnit.factor / toUnit.factor;
      return `Ratio: 1 ${fromUnitSymbol} = ${ratio.toPrecision(6)} ${toUnitSymbol}`;
    }
    return '';
  };

  return (
    <div className="flex flex-col h-full bg-[#080a0e] p-4 rounded-2xl border border-white/5 text-slate-300 shadow-2xl justify-between">
      <div>
        {/* Category Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-2 text-cyan-400">
              <Scale size={16} />
              Scientific Unit Converter
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Quickly transform units of measurements with scientific accuracy.</p>
          </div>
        </div>

        {/* Categories grid selectors */}
        <div className="grid grid-cols-3 gap-1.5 mb-4 max-h-[120px] overflow-y-auto pr-1">
          {unitCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                playHapticClick('standard');
                setSelectedCatId(cat.id);
              }}
              className={`text-[11px] p-2 rounded-lg border text-center transition-all cursor-pointer ${
                selectedCatId === cat.id
                  ? 'bg-[#0a0c10] border-cyan-500/50 text-cyan-400 font-medium font-sans shadow-md'
                  : 'bg-[#0a0c10]/40 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {/* Source Number Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Input Value</label>
            <input
              type="text"
              inputMode="decimal"
              value={sourceValueStr}
              onChange={(e) => setSourceValueStr(e.target.value)}
              className="w-full bg-[#05070a] border border-white/5 rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-cyan-500/50"
              placeholder="Enter numerical value..."
            />
          </div>

          {/* Unit selection grids */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
            {/* From unit */}
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">From Unit</label>
              <select
                value={fromUnitSymbol}
                onChange={(e) => {
                  playHapticClick('standard');
                  setFromUnitSymbol(e.target.value);
                }}
                className="w-full bg-[#05070a] border border-white/5 text-slate-300 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-cyan-500/50"
              >
                {activeCategory.units.map((unit) => (
                  <option key={unit.symbol} value={unit.symbol}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button container */}
            <div className="flex items-center justify-center md:col-span-1 pt-3">
              <button
                onClick={() => {
                  playHapticClick('standard');
                  handleSwap();
                }}
                className="p-2 bg-[#05070a] border border-white/5 hover:border-cyan-500/50 hover:text-cyan-400 text-slate-400 rounded-lg transition-colors cursor-pointer"
                title="Swap Units"
              >
                <ArrowLeftRight size={14} />
              </button>
            </div>

            {/* To unit */}
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">To Unit</label>
              <select
                value={toUnitSymbol}
                onChange={(e) => {
                  playHapticClick('standard');
                  setToUnitSymbol(e.target.value);
                }}
                className="w-full bg-[#05070a] border border-white/5 text-slate-300 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-cyan-500/50"
              >
                {activeCategory.units.map((unit) => (
                  <option key={unit.symbol} value={unit.symbol}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Result Display and quick actions */}
      <div className="mt-5 pt-3 border-t border-white/5 flex flex-col gap-3">
        {/* Output Screen */}
        <div className="bg-[#05070a] border border-white/5 p-4 rounded-xl flex flex-col justify-between items-start gap-1 relative overflow-hidden shadow-inner shadow-[0_0_8px_rgba(6,182,212,0.03)]">
          <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Calculated Conversion</span>
          <div className="flex flex-wrap items-baseline gap-2 mt-1 w-full max-w-full">
            <span className="text-sm font-semibold truncate text-slate-400 max-w-[45%]">
              {sourceValue} {fromUnitSymbol}
            </span>
            <span className="text-xs text-cyan-500 font-bold font-mono">≈</span>
            <span className="text-lg font-bold font-mono text-cyan-400 truncate max-w-[50%]" title={convertedResult.toString()}>
              {typeof convertedResult === 'number' && !isNaN(convertedResult)
                ? parseFloat(convertedResult.toFixed(8))
                : '0'}{' '}
              {toUnitSymbol}
            </span>
          </div>

          <div className="text-[10px] text-slate-500 font-mono mt-2 flex items-center justify-between w-full">
            <span>{getFormulaHelper()}</span>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex gap-2.5">
          <button
            onClick={() => {
              playHapticClick('standard');
              handleCopyValue();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-[#05070a] border border-white/5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all text-xs cursor-pointer font-medium"
          >
            {copied ? (
              <>
                <Check size={14} className="text-green-400 animate-bounce" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Result</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              playHapticClick('standard');
              onInsertToInput(convertedResult.toString());
            }}
            className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-[#05070a] border border-white/5 hover:bg-white/5 hover:text-cyan-400 rounded-xl text-slate-400 transition-all text-xs cursor-pointer font-medium"
            title="Load into standard calculator"
          >
            <Import size={14} />
            <span>Paste to Calc</span>
          </button>
        </div>
      </div>
    </div>
  );
}
