import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calculator,
  Compass,
  Scale,
  Grid3X3,
  History,
  Sparkles,
  ChevronRight,
  RotateCcw,
  Delete,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { ActiveTab, HistoryItem } from './types';
import { evaluateExpression } from './utils/mathEvaluator';
import { playHapticClick } from './utils/audio';

// Auxiliary Tabs Components
import GrapherPanel from './components/GrapherPanel';
import ConverterPanel from './components/ConverterPanel';
import MatrixPanel from './components/MatrixPanel';
import ConstantsPanel from './components/ConstantsPanel';
import HistoryPanel from './components/HistoryPanel';

export default function App() {
  // Main Workspace States
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDegree, setIsDegree] = useState<boolean>(false);
  const [ans, setAns] = useState<number>(0);

  // Active Auxiliary Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>('standard');

  // History Sync State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Clipboard Copied visual
  const [copied, setCopied] = useState<boolean>(false);

  // Help tooltip toggle
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Live clock
  const [timeStr, setTimeStr] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('scientific_calc_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error reading calculation history', e);
    }

    // Initialize clock
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save history helper
  const saveHistory = (expr: string, resVal: string) => {
    try {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        expression: expr,
        result: resVal,
        timestamp,
      };
      const updated = [newItem, ...history].slice(0, 50); // Keep last 50
      setHistory(updated);
      localStorage.setItem('scientific_calc_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving history item', e);
    }
  };

  const handleClearHistory = () => {
    playHapticClick('delete');
    setHistory([]);
    localStorage.removeItem('scientific_calc_history');
  };

  // Expression evaluation trigger
  const handleEvaluate = () => {
    if (!expression.trim()) {
      playHapticClick('error');
      return;
    }

    const evalResult = evaluateExpression(expression, {
      isDegree,
      ans,
    });

    if (evalResult.success) {
      playHapticClick('success');
      setResult(evalResult.result);
      setErrorMsg(null);
      if (evalResult.numericValue !== undefined && !isNaN(evalResult.numericValue)) {
        setAns(evalResult.numericValue);
      }
      saveHistory(expression, evalResult.result);
    } else {
      playHapticClick('error');
      setErrorMsg(evalResult.error || 'Evaluation Error');
    }
  };

  // Keyboard insertions
  const appendToken = (token: string, isFunc: boolean = false) => {
    playHapticClick('standard');
    setExpression((prev) => {
      let updated = prev;
      if (isFunc) {
        updated += `${token}(`;
      } else {
        updated += token;
      }
      return updated;
    });

    // Auto focus and position cursor if appropriate
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  };

  const handleBackspace = () => {
    playHapticClick('delete');
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleClearAll = () => {
    playHapticClick('delete');
    setExpression('');
    setResult('');
    setErrorMsg(null);
  };

  const handleCopyResult = () => {
    if (!result) return;
    playHapticClick('standard');
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle direct key triggers for computer keyboard binding
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEvaluate();
    } else if (e.key === 'Escape') {
      handleClearAll();
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] font-sans text-slate-300 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* World-Class Header bar */}
      <header className="bg-[#080a0e]/80 border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-950/40">
              <Calculator size={20} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5 leading-none">
                Precise Scientific Workspace
                <span className="bg-cyan-500/10 text-cyan-400 font-mono text-[9px] px-1.5 py-0.5 rounded-full border border-cyan-500/20">v4.0</span>
              </h1>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-mono">High-Fidelity Engineering Calculator</p>
            </div>
          </div>

          {/* Quick Real-Time Status Telemetry Indicators (Clean / humble) */}
          <div className="flex items-center gap-4 text-xs font-mono">
            {/* Degree vs Radian Indicator badge */}
            <div className="flex bg-[#0a0c10] border border-white/5 p-0.5 rounded-lg px-2 items-center gap-1.5 shadow-sm text-[10.5px]">
              <span className="text-slate-500">Angle Mode:</span>
              <button
                onClick={() => {
                  playHapticClick('standard');
                  setIsDegree(!isDegree);
                }}
                className={`font-semibold cursor-pointer rounded px-1.5 py-0.5 transition-colors uppercase ${
                  isDegree ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'
                }`}
              >
                {isDegree ? 'Degrees' : 'Radians'}
              </button>
            </div>

            {/* Live Clock indicator */}
            <div className="bg-[#0a0c10]/60 p-1.5 px-3 rounded-lg border border-white/5 text-slate-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
              <span>Local: {timeStr}</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Responsive Grid Desk Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: THE MATHEMATICAL ENGINE DISPLAY AND KEYPAD workspace (Occupies 7/12 grid layout of desktop) */}
        <section className="lg:col-span-7 flex flex-col gap-5">
          
          {/* Scientific Screen Display */}
          <div className="bg-[#080a0e] rounded-2xl border border-white/5 p-5 shadow-2xl relative overflow-hidden flex flex-col justify-end min-h-[170px] group transition-all">
            
            {/* Visual ambient decoration for luxury feel */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-cyan-600/5 to-transparent rounded-full blur-2xl pointer-events-none"></div>

            {/* Error or Live state indicator bar */}
            <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={11} className="text-cyan-400/80" />
                Active Math Core
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    playHapticClick('standard');
                    setShowHelp(!showHelp);
                  }}
                  className="text-slate-500 hover:text-slate-300 flex items-center gap-1 hover:underline cursor-pointer"
                  title="Keyboard formulas quick guides"
                >
                  <HelpCircle size={12} />
                  <span>Cheat Sheet</span>
                </button>
              </div>
            </div>

            {/* Expression Typing Area */}
            <div className="relative mt-5 mb-2">
              <input
                ref={inputRef}
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-b border-white/5 p-1.5 pb-2.5 text-lg md:text-xl font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 text-left"
                placeholder="Type formula (e.g. sin(pi/3) * ln(2) + ans)..."
                autoComplete="off"
                spellCheck="false"
              />
              {expression && (
                <button
                  onClick={() => setExpression('')}
                  className="absolute right-2 top-2 p-1 text-slate-500 hover:text-white rounded transition-colors"
                  title="Clear Expression"
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>

            {/* Final Answer / Calculated Display row */}
            <AnimatePresence mode="popLayout">
              {errorMsg ? (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-red-400 font-sans text-xs bg-red-950/10 border border-red-900/30 p-2.5 rounded-lg mt-2"
                >
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span className="font-mono">{errorMsg}</span>
                </motion.div>
              ) : (
                !!result && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between mt-2 pt-2 border-t border-white/5"
                  >
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#10b981] font-semibold">Evaluated Output</span>
                    <div className="flex items-center gap-3 max-w-full">
                      {/* Copy outcome action */}
                      <button
                        onClick={handleCopyResult}
                        className="p-1.5 bg-[#05070a] hover:bg-white/5 border border-white/5 rounded-md text-slate-500 hover:text-white cursor-pointer transition-colors"
                        title="Copy final value"
                      >
                        {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                      </button>

                      <span className="text-xl md:text-2xl font-bold font-mono text-[#06b6d4] tracking-tight break-all">
                        {result}
                      </span>
                    </div>
                  </motion.div>
                )
              )}
            </AnimatePresence>

            {/* Helper status text */}
            {!result && !errorMsg && (
              <span className="text-xs text-slate-500 italic mt-3 font-mono">
                Press [=] on keypad or hit [Enter] on computer keyboard to compute.
              </span>
            )}
          </div>

          {/* Cheat Sheet Help Card */}
          <AnimatePresence>
            {showHelp && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#080a0e] rounded-xl border border-white/5 p-4 overflow-hidden text-xs font-mono text-slate-400 space-y-2.5"
              >
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="font-bold text-slate-200">KEYBOARD CHEAT SHEET FORMULAS</span>
                  <button onClick={() => setShowHelp(false)} className="text-slate-500 hover:text-white hover:underline cursor-pointer">
                    [Close]
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
                  <div>Trigonometry: <span className="text-cyan-400">sin(x)</span></div>
                  <div>Logarithm base 10: <span className="text-cyan-400">log(x)</span></div>
                  <div>Natural log: <span className="text-cyan-400">ln(e)</span></div>
                  <div>Power operations: <span className="text-cyan-400">x^y</span></div>
                  <div>Square / Cube: <span className="text-cyan-400">x^2, x^3</span></div>
                  <div>Factorial function: <span className="text-cyan-400">5!</span></div>
                  <div>Roots: <span className="text-cyan-400">sqrt(16), cbrt(8)</span></div>
                  <div>Abs value: <span className="text-cyan-400">abs(-5)</span></div>
                  <div>Modulus (remainder): <span className="text-cyan-400">10 % 3</span></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Master Keypad Grid */}
          <div className="bg-[#080a0e] rounded-2xl border border-white/5 p-5 shadow-2xl">
            
            {/* Scientific and Advanced Algebra Trigonometric tab rows */}
            <div className="mb-4 pb-4 border-b border-white/5">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block mb-2 font-semibold">TRIGONOMETRIC & ADVANCED MATHS</span>
              <div className="grid grid-cols-5 gap-1.5">
                {/* Mode Trig Redefined wrappers */}
                <button
                  onClick={() => appendToken('sin', true)}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 p-2.5 text-xs text-cyan-400 font-mono rounded-lg transition-all font-semibold active:scale-95 cursor-pointer text-center"
                >
                  sin
                </button>
                <button
                  onClick={() => appendToken('cos', true)}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 p-2.5 text-xs text-cyan-400 font-mono rounded-lg transition-all font-semibold active:scale-95 cursor-pointer text-center"
                >
                  cos
                </button>
                <button
                  onClick={() => appendToken('tan', true)}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 p-2.5 text-xs text-cyan-400 font-mono rounded-lg transition-all font-semibold active:scale-95 cursor-pointer text-center"
                >
                  tan
                </button>
                <button
                  onClick={() => appendToken('asin', true)}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 p-2.5 text-xs text-[#06b6d4]/80 font-mono rounded-lg transition-all active:scale-95 cursor-pointer text-center"
                >
                  sin⁻¹
                </button>
                <button
                  onClick={() => appendToken('acos', true)}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 p-2.5 text-xs text-[#06b6d4]/80 font-mono rounded-lg transition-all active:scale-95 cursor-pointer text-center"
                >
                  cos⁻¹
                </button>

                <button
                  onClick={() => appendToken('sinh', true)}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 p-2.5 text-xs text-[#06b6d4]/80 font-mono rounded-lg transition-all active:scale-95 cursor-pointer text-center"
                >
                  sinh
                </button>
                <button
                  onClick={() => appendToken('cosh', true)}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 p-2.5 text-xs text-[#06b6d4]/80 font-mono rounded-lg transition-all active:scale-95 cursor-pointer text-center"
                >
                  cosh
                </button>
                <button
                  onClick={() => appendToken('tanh', true)}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 p-2.5 text-xs text-[#06b6d4]/80 font-mono rounded-lg transition-all active:scale-95 cursor-pointer text-center"
                >
                  tanh
                </button>
                <button
                  onClick={() => appendToken('atan', true)}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 p-2.5 text-xs text-[#06b6d4]/80 font-mono rounded-lg transition-all active:scale-95 cursor-pointer text-center"
                >
                  tan⁻¹
                </button>
                <button
                  onClick={() => appendToken('log', true)}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 p-2.5 text-xs text-cyan-400 font-mono rounded-lg transition-all font-semibold active:scale-95 cursor-pointer text-center"
                  title="Base 10 logarithm"
                >
                  log₁₀
                </button>

                {/* Exponential mathematical functions */}
                <button
                  onClick={() => appendToken('ln', true)}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 p-2.5 text-xs text-cyan-400 font-mono rounded-lg transition-all font-semibold active:scale-95 cursor-pointer text-center"
                  title="Natural logarithm (base e)"
                >
                  ln
                </button>
                <button
                  onClick={() => appendToken('^')}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 p-2.5 text-xs text-cyan-400 font-mono rounded-lg transition-all font-semibold active:scale-95 cursor-pointer text-center"
                >
                  xʸ
                </button>
                <button
                  onClick={() => appendToken('^2')}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 p-2.5 text-xs text-[#06b6d4]/80 font-mono rounded-lg transition-all active:scale-95 cursor-pointer text-center"
                >
                  x²
                </button>
                <button
                  onClick={() => appendToken('^3')}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 p-2.5 text-xs text-[#06b6d4]/80 font-mono rounded-lg transition-all active:scale-95 cursor-pointer text-center"
                >
                  x³
                </button>
                <button
                  onClick={() => appendToken('sqrt', true)}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 p-2.5 text-xs text-cyan-400 font-mono rounded-lg transition-all font-semibold active:scale-95 cursor-pointer text-center"
                >
                  √
                </button>

                <button
                  onClick={() => appendToken('cbrt', true)}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 p-2.5 text-xs text-[#06b6d4]/80 font-mono rounded-lg transition-all active:scale-95 cursor-pointer text-center"
                >
                  ³√
                </button>
                <button
                  onClick={() => appendToken('abs', true)}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 p-2.5 text-xs text-[#06b6d4]/80 font-mono rounded-lg transition-all active:scale-95 cursor-pointer text-center"
                >
                  abs
                </button>
                <button
                  onClick={() => appendToken('!')}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 p-2.5 text-xs text-[#06b6d4]/80 font-mono rounded-lg transition-all active:scale-95 cursor-pointer text-center font-bold"
                >
                  n!
                </button>
                <button
                  onClick={() => appendToken(' % ')}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 p-2.5 text-xs text-[#06b6d4]/80 font-mono rounded-lg transition-all active:scale-95 cursor-pointer text-center"
                >
                  %
                </button>
                <button
                  onClick={() => appendToken('random()')}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 p-2.5 text-xs text-[#06b6d4]/80 font-mono rounded-lg transition-all active:scale-95 cursor-pointer text-center"
                  title="Random float [0, 1)"
                >
                  rand
                </button>
              </div>
            </div>

            {/* Standard Keypad & Operations Grid */}
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block mb-2 font-semibold">Standard Calculator Grid</span>
              <div className="grid grid-cols-4 gap-2">
                {/* Row 1 */}
                <button
                  onClick={() => appendToken('(')}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 p-3.5 text-sm text-slate-300 font-semibold font-mono rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                >
                  (
                </button>
                <button
                  onClick={() => appendToken(')')}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 p-3.5 text-sm text-slate-300 font-semibold font-mono rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                >
                  )
                </button>
                <button
                  onClick={handleClearAll}
                  className="bg-red-950/15 hover:bg-red-900/20 border border-red-500/20 p-3.5 text-sm text-red-400 hover:text-red-300 font-bold font-mono rounded-xl transition-all active:scale-95 cursor-pointer text-center uppercase tracking-wider"
                >
                  AC
                </button>
                <button
                  onClick={handleBackspace}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 p-3.5 text-sm text-amber-500 hover:text-amber-400 font-mono rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Delete size={16} />
                </button>

                {/* Row 2 */}
                <button
                  onClick={() => appendToken('7')}
                  className="bg-[#0a0c10]/30 hover:bg-white/5 border border-white/5 p-4 text-base text-slate-100 font-bold font-mono rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                >
                  7
                </button>
                <button
                  onClick={() => appendToken('8')}
                  className="bg-[#0a0c10]/30 hover:bg-white/5 border border-white/5 p-4 text-base text-slate-100 font-bold font-mono rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                >
                  8
                </button>
                <button
                  onClick={() => appendToken('9')}
                  className="bg-[#0a0c10]/30 hover:bg-white/5 border border-white/5 p-4 text-base text-slate-100 font-bold font-mono rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                >
                  9
                </button>
                <button
                  onClick={() => appendToken(' / ')}
                  className="bg-[#0a0c10]/65 hover:bg-white/5 border border-white/5 text-amber-500 font-bold p-4 text-sm font-mono rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                >
                  ÷
                </button>

                {/* Row 3 */}
                <button
                  onClick={() => appendToken('4')}
                  className="bg-[#0a0c10]/30 hover:bg-white/5 border border-white/5 p-4 text-base text-slate-100 font-bold font-mono rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                >
                  4
                </button>
                <button
                  onClick={() => appendToken('5')}
                  className="bg-[#0a0c10]/30 hover:bg-white/5 border border-white/5 p-4 text-base text-slate-100 font-bold font-mono rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                >
                  5
                </button>
                <button
                  onClick={() => appendToken('6')}
                  className="bg-[#0a0c10]/30 hover:bg-white/5 border border-white/5 p-4 text-base text-slate-100 font-bold font-mono rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                >
                  6
                </button>
                <button
                  onClick={() => appendToken(' * ')}
                  className="bg-[#0a0c10]/65 hover:bg-white/5 border border-white/5 text-amber-500 font-bold p-4 text-sm font-mono rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                >
                  ×
                </button>

                {/* Row 4 */}
                <button
                  onClick={() => appendToken('1')}
                  className="bg-[#0a0c10]/30 hover:bg-white/5 border border-white/5 p-4 text-base text-slate-100 font-bold font-mono rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                >
                  1
                </button>
                <button
                  onClick={() => appendToken('2')}
                  className="bg-[#0a0c10]/30 hover:bg-white/5 border border-white/5 p-4 text-base text-slate-100 font-bold font-mono rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                >
                  2
                </button>
                <button
                  onClick={() => appendToken('3')}
                  className="bg-[#0a0c10]/30 hover:bg-white/5 border border-white/5 p-4 text-base text-slate-100 font-bold font-mono rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                >
                  3
                </button>
                <button
                  onClick={() => appendToken(' - ')}
                  className="bg-[#0a0c10]/65 hover:bg-white/5 border border-white/5 text-amber-500 font-bold p-4 text-sm font-mono rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                >
                  −
                </button>

                {/* Row 5 */}
                <button
                  onClick={() => appendToken('0')}
                  className="bg-[#0a0c10]/30 hover:bg-white/5 border border-white/5 p-4 text-base text-slate-100 font-bold font-mono rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                >
                  0
                </button>
                <button
                  onClick={() => appendToken('.')}
                  className="bg-[#0a0c10]/30 hover:bg-white/5 border border-white/5 p-4 text-base text-slate-100 font-bold font-mono rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                >
                  .
                </button>
                <button
                  onClick={() => appendToken('ans')}
                  className="bg-[#0a0c10]/50 hover:bg-white/5 border border-white/5 text-xs text-slate-300 font-mono rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                  title="Insert Previous Value"
                >
                  ANS
                </button>
                <button
                  onClick={() => appendToken(' + ')}
                  className="bg-[#0a0c10]/65 hover:bg-white/5 border border-white/5 text-amber-500 font-bold p-4 text-sm font-mono rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                >
                  +
                </button>
              </div>

              {/* Huge Equals Button */}
              <button
                onClick={handleEvaluate}
                className="w-full mt-3 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 active:brightness-90 border border-cyan-400/25 text-white font-bold rounded-xl text-md flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] font-mono"
              >
                <span>=</span>
                <span className="text-xs font-sans tracking-wide text-cyan-100">(EVALUATE)</span>
              </button>
            </div>

          </div>

        </section>

        {/* RIGHT COLUMN: AUXILIARY TABULATED DESK CONTAINING GRAPHER, MATRICES, CONSTANTS AND HISTORY LOG (Occupies 5/12 grid of desktop) */}
        <section className="lg:col-span-5 flex flex-col gap-4 h-full lg:sticky lg:top-20">
          
          {/* Custom Bento Tab Trigger Selector Row */}
          <nav className="grid grid-cols-5 gap-1.5 bg-[#080a0e] p-1.5 rounded-xl border border-white/5">
            <button
              onClick={() => {
                playHapticClick('tab');
                setActiveTab('standard');
              }}
              className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'standard'
                  ? 'bg-[#0a0c10] text-[#06b6d4] border border-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Welcome screen"
            >
              <Calculator size={15} />
              <span className="text-[9px] font-mono leading-none">Status</span>
            </button>
            <button
              onClick={() => {
                playHapticClick('tab');
                setActiveTab('grapher');
              }}
              className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'grapher'
                  ? 'bg-[#0a0c10] text-[#06b6d4] border border-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Interactive 2D graph plotter"
            >
              <TrendingUp size={15} />
              <span className="text-[9px] font-mono leading-none">Grapher</span>
            </button>
            <button
              onClick={() => {
                playHapticClick('tab');
                setActiveTab('converter');
              }}
              className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'converter'
                  ? 'bg-[#0a0c10] text-[#06b6d4] border border-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Physical Unit Converter"
            >
              <Scale size={15} />
              <span className="text-[9px] font-mono leading-none">Convert</span>
            </button>
            <button
              onClick={() => {
                playHapticClick('tab');
                setActiveTab('matrix');
              }}
              className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-[#0a0c10] text-[#06b6d4] border border-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Matrix Properties Calculations"
            >
              <Grid3X3 size={15} />
              <span className="text-[9px] font-mono leading-none">Matrices</span>
            </button>
            <button
              onClick={() => {
                playHapticClick('tab');
                setActiveTab('constants');
              }}
              className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'constants'
                  ? 'bg-[#0a0c10] text-[#06b6d4] border border-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Constants Index"
            >
              <Compass size={15} />
              <span className="text-[9px] font-mono leading-none">Physical</span>
            </button>
          </nav>

          {/* Auxiliary Panel Render Board */}
          <div className="flex-1 min-h-[380px] h-[520px]">
            {activeTab === 'standard' && (
              <div className="flex flex-col h-full bg-[#080a0e] p-5 rounded-2xl border border-white/5 text-slate-100 shadow-2xl justify-between overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#06b6d4]/90 text-sm font-semibold border-b border-white/5 pb-2.5">
                    <Sparkles size={16} />
                    <span>Scientific Calculation Board</span>
                  </div>
                  
                  <div className="space-y-3 text-xs leading-relaxed text-slate-500 font-mono">
                    <p>Welcome to your world-class mathematical console. You can insert expressions via clicking keypad keys, typing directly, or accessing our integrated physics databases.</p>
                    <p>Each auxiliary workspace on your right fits standard laboratory requirements:</p>
                    <ul className="space-y-1.5 pl-3 list-disc text-cyan-500/50 text-[11px]">
                      <li><strong className="text-slate-400">Grapher</strong>: Compile, trace intersections and plot multiple equations.</li>
                      <li><strong className="text-slate-400">Convert</strong>: Translate physical scales (Length, Mass, Speed, Temp vs).</li>
                      <li><strong className="text-slate-400">Matrices</strong>: Evaluate transpositions, determinant scopes & inverse formulas.</li>
                      <li><strong className="text-slate-400">Physical</strong>: Query fundamental molecular, cosmic and algebraic constants.</li>
                    </ul>
                  </div>

                  {/* Math Telemtry Quick Metrics */}
                  <div className="bg-[#0a0c10]/60 p-3.5 rounded-xl border border-white/5 font-mono text-[11px] grid grid-cols-2 gap-y-2 gap-x-2 text-slate-500">
                    <div>Last Output state (ans):</div>
                    <div className="text-right text-cyan-400 font-bold truncate">{ans}</div>
                    <div>Angle Convention:</div>
                    <div className="text-right text-amber-500 uppercase font-bold">{isDegree ? 'Degrees' : 'Radians'}</div>
                    <div>Session Logs:</div>
                    <div className="text-right text-white font-medium">{history.length} Calculations</div>
                  </div>
                </div>

                {/* mini calculations logger embedded */}
                <div className="mt-4 border-t border-white/5 pt-3">
                  <span className="text-[10px] text-slate-600 uppercase font-mono tracking-widest flex items-center gap-1.5 mb-2.5 font-bold">
                    <History size={11} className="text-[#06b6d4]/90" />
                    Session Activity Snapshot
                  </span>
                  
                  {history.length === 0 ? (
                    <p className="text-[10px] text-slate-755 font-mono italic text-center py-4">No evaluations recorded yet.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {history.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            playHapticClick('standard');
                            setExpression(item.expression);
                            setResult(item.result);
                            setErrorMsg(null);
                          }}
                          className="bg-[#0a0c10]/40 hover:bg-[#0a0c10]/90 border border-white/5 p-2 rounded-lg flex flex-col gap-0.5 text-[10px] cursor-pointer transition-colors"
                        >
                          <div className="text-slate-400 font-mono truncate">{item.expression}</div>
                          <div className="text-right font-mono font-semibold text-cyan-400 truncate">= {item.result}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'grapher' && (
              <GrapherPanel onInsertToInput={(expr) => setExpression(expr)} />
            )}

            {activeTab === 'converter' && (
              <ConverterPanel onInsertToInput={(val) => appendToken(val)} />
            )}

            {activeTab === 'matrix' && (
              <MatrixPanel onInsertToInput={(val) => appendToken(val)} />
            )}

            {activeTab === 'constants' && (
              <ConstantsPanel onInsertConstant={(symbol) => appendToken(symbol)} />
            )}
          </div>

          {/* Separate history panel overlay selector if desired or toggle to tab */}
          {activeTab !== 'standard' && (
            <button
              onClick={() => {
                playHapticClick('tab');
                setActiveTab('standard');
              }}
              className="w-full py-2 bg-[#080a0e] hover:bg-[#0a0c10]/80 border border-white/5 text-slate-500 hover:text-slate-300 rounded-xl text-xs flex items-center justify-center gap-1.5 font-mono cursor-pointer transition-all"
            >
              <History size={13} />
              <span>Show Session Log Dashboard</span>
            </button>
          )}

          {/* Stetch or render separate history panel for ease of use */}
          {activeTab === 'standard' && history.length > 3 && (
            <div className="h-[210px] bg-[#080a0e] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
              <HistoryPanel
                history={history}
                onSelectExpression={(expr) => {
                  setExpression(expr);
                  setErrorMsg(null);
                }}
                onSelectResult={(resVal) => {
                  appendToken(resVal);
                }}
                onClearHistory={handleClearHistory}
              />
            </div>
          )}

        </section>

      </main>

      {/* World-Class footer */}
      <footer className="mt-auto py-5 bg-[#080a0e] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center text-[10px] font-mono text-slate-500 space-y-1">
          <span>High-Precision Real-time Equation Solver Engine. Underpinned by standard IEEE 754 Floating-Point Precision constraints.</span>
          <p>© 2026 World Class Scientific Calculator. Designed with slate-bento accents.</p>
        </div>
      </footer>

    </div>
  );
}
