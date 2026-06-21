import { useState } from 'react';
import { create, all } from 'mathjs';
import { Grid3X3, Copy, Import, AlertCircle, RefreshCw, Check } from 'lucide-react';
import { playHapticClick } from '../utils/audio';

const math = create(all);

interface MatrixPanelProps {
  onInsertToInput: (expr: string) => void;
}

export default function MatrixPanel({ onInsertToInput }: MatrixPanelProps) {
  const [size, setSize] = useState<2 | 3>(2);
  const [matrixData, setMatrixData] = useState<number[][]>([
    [1, 2, 0],
    [3, 4, 0],
    [0, 0, 1],
  ]);

  // Calculations states
  const [determinant, setDeterminant] = useState<number | null>(null);
  const [transposedMatrix, setTransposedMatrix] = useState<number[][] | null>(null);
  const [inverseMatrix, setInverseMatrix] = useState<number[][] | null>(null);
  const [squaredMatrix, setSquaredMatrix] = useState<number[][] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Update a single matrix coordinate cell
  const handleCellChange = (row: number, col: number, rawVal: string) => {
    const val = parseFloat(rawVal);
    const updated = matrixData.map((currRow, rIdx) => {
      if (rIdx !== row) return currRow;
      return currRow.map((currVal, cIdx) => {
        if (cIdx !== col) return currVal;
        return isNaN(val) ? 0 : val;
      });
    });
    setMatrixData(updated);
    clearResults();
  };

  const getSubMatrix = () => {
    return matrixData.slice(0, size).map(row => row.slice(0, size));
  };

  const clearResults = () => {
    setDeterminant(null);
    setTransposedMatrix(null);
    setInverseMatrix(null);
    setSquaredMatrix(null);
    setErrorMsg(null);
  };

  // Matrix actions
  const handleCalculate = () => {
    try {
      setErrorMsg(null);
      const sub = getSubMatrix();

      // Determinant
      const detVal = math.det(sub);
      setDeterminant(parseFloat(detVal.toFixed(6)));

      // Transpose
      const transVal = math.transpose(sub);
      setTransposedMatrix(transVal as unknown as number[][]);

      // Inverse (only non-singular)
      if (Math.abs(detVal) < 1e-9) {
        setInverseMatrix(null);
      } else {
        const invVal = math.inv(sub);
        setInverseMatrix(invVal as unknown as number[][]);
      }

      // Square A^2
      const sqVal = math.multiply(sub, sub);
      setSquaredMatrix(sqVal as unknown as number[][]);

    } catch (err: any) {
      setErrorMsg(err.message || 'Matrix calculation failed.');
    }
  };

  // Presets
  const setIdentity = () => {
    setMatrixData([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
    clearResults();
  };

  const setRandom = () => {
    const updated = matrixData.map(row =>
      row.map(() => Math.floor(Math.random() * 19) - 9) // integers -9 to 9
    );
    setMatrixData(updated);
    clearResults();
  };

  const clearMatrix = () => {
    setMatrixData([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);
    clearResults();
  };

  const handleCopyMatrix = (matrix: number[][]) => {
    navigator.clipboard.writeText(JSON.stringify(matrix));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#080a0e] p-4 rounded-2xl border border-white/5 text-slate-300 shadow-2xl justify-between overflow-y-auto">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-2 text-cyan-400">
              <Grid3X3 size={16} />
              Matrix Engineering engine
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Solve matrices up to 3x3 dimensions instantly.</p>
          </div>
          {/* Size Selector */}
          <div className="flex bg-[#05070a] border border-white/5 rounded-lg p-0.5 text-xs font-mono">
            <button
              onClick={() => {
                playHapticClick('standard');
                setSize(2);
                clearResults();
              }}
              className={`p-1 px-2.5 rounded transition-all cursor-pointer ${
                size === 2 ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              2x2
            </button>
            <button
              onClick={() => {
                playHapticClick('standard');
                setSize(3);
                clearResults();
              }}
              className={`p-1 px-2.5 rounded transition-all cursor-pointer ${
                size === 3 ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              3x3
            </button>
          </div>
        </div>

        {/* Matrix Presets & Controls */}
        <div className="flex gap-2 mb-4 text-xs font-mono">
          <button
            onClick={() => {
              playHapticClick('standard');
              setIdentity();
            }}
            className="flex-1 bg-[#0a0c10]/40 hover:bg-[#0a0c10]/80 border border-white/5 hover:border-white/10 py-1.5 rounded transition-all text-slate-400 hover:text-slate-200 cursor-pointer text-center"
          >
            [Identity]
          </button>
          <button
            onClick={() => {
              playHapticClick('standard');
              setRandom();
            }}
            className="flex-1 bg-[#0a0c10]/40 hover:bg-[#0a0c10]/80 border border-white/5 hover:border-white/10 py-1.5 rounded transition-all text-slate-400 hover:text-slate-200 cursor-pointer text-center"
          >
            [Random]
          </button>
          <button
            onClick={() => {
              playHapticClick('delete');
              clearMatrix();
            }}
            className="flex-1 bg-[#0a0c10]/40 hover:bg-[#0a0c10]/80 border border-white/5 hover:border-white/10 py-1.5 rounded transition-all text-slate-400 hover:text-slate-200 cursor-pointer text-center"
          >
            [Reset]
          </button>
        </div>

        {/* Dynamic Numerical Input grid */}
        <div className="bg-[#0a0c10]/40 border border-white/5 p-5 rounded-xl mb-4 flex flex-col items-center justify-center relative shadow-inner">
          <span className="text-[10px] text-slate-500 font-mono absolute top-2 left-3">Matrix A :</span>
          <div className="flex items-center gap-2">
            {/* Left Bracket visual */}
            <div className="w-2.5 h-20 border-l-2 border-t-2 border-b-2 border-slate-700 rounded-l"></div>

            {/* Input grid */}
            <div className={`grid gap-2 z-10`} style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
              {Array.from({ length: size }).map((_, rIdx) =>
                Array.from({ length: size }).map((_, cIdx) => (
                  <input
                    key={`cell-${rIdx}-${cIdx}`}
                    type="number"
                    value={matrixData[rIdx][cIdx]}
                    onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                    className="w-14 h-11 bg-[#05070a] border border-white/5 rounded-lg p-1 text-center font-mono text-xs focus:outline-none focus:border-cyan-500/50 focus:ring-0 focus:ring-transparent text-white shadow-[inset_0_0_8px_rgba(255,255,255,0.01)]"
                  />
                ))
              )}
            </div>

            {/* Right Bracket visual */}
            <div className="w-2.5 h-20 border-r-2 border-t-2 border-b-2 border-slate-700 rounded-r"></div>
          </div>
        </div>

        {/* Compute Buttons */}
        <button
          onClick={() => {
            // We evaluate on custom click handler logic which determines success/error in callback
            // But playing basic success on initial submit is satisfying, or we can play 'standard' or success since it is computed instantly
            playHapticClick('success');
            handleCalculate();
          }}
          className="w-full py-2.5 bg-cyan-950/20 hover:bg-cyan-950/40 border border-cyan-500/20 hover:border-cyan-500/40 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all mb-4 text-cyan-400 font-mono uppercase tracking-wider text-[10px]"
        >
          <RefreshCw size={13} className="animate-spin-slow" />
          <span>Compute Matrix Properties</span>
        </button>

        {/* Errors display */}
        {errorMsg && (
          <div className="flex items-start gap-2 text-xs bg-red-950/10 border border-red-900/30 p-3 rounded-lg text-red-400 font-sans mb-4">
            <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Results Workspace */}
      <div className="min-h-[140px] border-t border-white/5 pt-4">
        {determinant === null ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono text-center">
            Click Compute to calculate determinant, inverse, transpose, & squared matrices.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
            {/* Determinant Card */}
            <div className="bg-[#0a0c10]/40 p-2.5 rounded-lg border border-white/5 flex flex-col justify-between">
              <span className="text-slate-400">Det(A)</span>
              <span className="text-sm font-bold text-cyan-400 mt-1">{determinant}</span>
              <button
                onClick={() => {
                  playHapticClick('standard');
                  onInsertToInput(String(determinant));
                }}
                className="text-[9px] text-slate-500 hover:text-cyan-400 cursor-pointer mt-2 text-left"
              >
                [Paste to Calc]
              </button>
            </div>
 
            {/* Transpose Card */}
            <div className="bg-[#0a0c10]/40 p-2.5 rounded-lg border border-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-400">Transpose Aᵀ</span>
                <button
                  onClick={() => {
                    if (transposedMatrix) {
                      playHapticClick('standard');
                      handleCopyMatrix(transposedMatrix);
                    }
                  }}
                  className="text-slate-500 hover:text-cyan-400 cursor-pointer"
                  title="Copy transpose"
                >
                  <Copy size={11} />
                </button>
              </div>
              <div className="text-white text-[10px] break-all bg-[#05070a] p-1.5 rounded border border-white/5 text-center font-mono">
                {transposedMatrix ? JSON.stringify(transposedMatrix) : '-'}
              </div>
            </div>
 
            {/* Inverse Card */}
            <div className="bg-[#0a0c10]/40 p-2.5 rounded-lg border border-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-400">Inverse A⁻¹</span>
                <button
                  onClick={() => {
                    if (inverseMatrix) {
                      playHapticClick('standard');
                      handleCopyMatrix(inverseMatrix);
                    }
                  }}
                  disabled={!inverseMatrix}
                  className="text-slate-500 hover:text-cyan-400 disabled:opacity-30 cursor-pointer"
                  title="Copy inverse"
                >
                  <Copy size={11} />
                </button>
              </div>
              {inverseMatrix ? (
                <div className="text-white text-[10px] break-all bg-[#05070a] p-1.5 rounded border border-white/5 text-center font-mono">
                  {JSON.stringify(inverseMatrix.map(row => row.map(v => parseFloat(v.toFixed(3)))))}
                </div>
              ) : (
                <span className="text-[10px] text-red-400/80 text-center block mt-1">Singular Matrix (Det = 0)</span>
              )}
            </div>
 
            {/* Squared Matrix Card */}
            <div className="bg-[#0a0c10]/40 p-2.5 rounded-lg border border-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-400">Square A²</span>
                <button
                  onClick={() => {
                    if (squaredMatrix) {
                      playHapticClick('standard');
                      handleCopyMatrix(squaredMatrix);
                    }
                  }}
                  className="text-slate-500 hover:text-cyan-400 cursor-pointer"
                  title="Copy squared"
                >
                  <Copy size={11} />
                </button>
              </div>
              <div className="text-white text-[9px] break-all bg-[#05070a] p-1.5 rounded border border-white/5 text-center font-mono">
                {squaredMatrix ? JSON.stringify(squaredMatrix) : '-'}
              </div>
            </div>
          </div>
        )}
        {copied && (
          <div className="mt-3 text-center text-[10px] text-green-400 font-mono animate-fade-in">
            ✓ Copied Matrix representation to clipboard!
          </div>
        )}
      </div>
    </div>
  );
}
