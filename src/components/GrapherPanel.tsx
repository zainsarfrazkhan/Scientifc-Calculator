import React, { useRef, useEffect, useState } from 'react';
import { create, all } from 'mathjs';
import { ZoomIn, ZoomOut, RotateCcw, AlertCircle, Plus, Sparkles, Move } from 'lucide-react';
import { playHapticClick } from '../utils/audio';

const math = create(all);

interface GrapherPanelProps {
  onInsertToInput: (expr: string) => void;
}

export default function GrapherPanel({ onInsertToInput }: GrapherPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // States for two plot functions
  const [func1, setFunc1] = useState<string>('sin(x)');
  const [func2, setFunc2] = useState<string>('cos(x) * x / 2');

  // Multi-curve flags
  const [showFunc2, setShowFunc2] = useState<boolean>(true);

  // Plot boundaries (view port coordinates)
  const [xMin, setXMin] = useState<number>(-10);
  const [xMax, setXMax] = useState<number>(10);
  const [yMin, setYMin] = useState<number>(-10);
  const [yMax, setYMax] = useState<number>(10);

  // Status/Errors
  const [error1, setError1] = useState<string | null>(null);
  const [error2, setError2] = useState<string | null>(null);

  // Crosshair tracing state
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [intersectPoints, setIntersectPoints] = useState<{ xVal: number; yVal1?: number; yVal2?: number } | null>(null);

  // For dragging/panning
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle changes to Bounds
  const handleResetView = () => {
    setXMin(-10);
    setXMax(10);
    setYMin(-10);
    setYMax(10);
  };

  const handleZoom = (factor: number) => {
    const xCenter = (xMin + xMax) / 2;
    const yCenter = (yMin + yMax) / 2;
    const xHalfRange = ((xMax - xMin) / 2) * factor;
    const yHalfRange = ((yMax - yMin) / 2) * factor;

    setXMin(xCenter - xHalfRange);
    setXMax(xCenter + xHalfRange);
    setYMin(yCenter - yHalfRange);
    setYMax(yCenter + yHalfRange);
  };

  // Compile expressions safely
  const evalCompiled = (compiledExpr: any, x: number): number => {
    try {
      const scope = { x };
      const res = compiledExpr.evaluate(scope);
      if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
        return res;
      }
      return NaN;
    } catch {
      return NaN;
    }
  };

  // Main canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI retina screens
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // Clear canvas
    ctx.fillStyle = '#05070a'; // custom dark void back
    ctx.fillRect(0, 0, width, height);

    // Helpers to map graph coordinates to canvas screen pixels
    const toScreenX = (x: number) => {
      return ((x - xMin) / (xMax - xMin)) * width;
    };

    const toScreenY = (y: number) => {
      return height - ((y - yMin) / (yMax - yMin)) * height;
    };

    // Helpers to map screen pixels to graph coordinates
    const toGraphX = (pixelX: number) => {
      return xMin + (pixelX / width) * (xMax - xMin);
    };

    const toGraphY = (pixelY: number) => {
      return yMin + ((height - pixelY) / height) * (yMax - yMin);
    };

    // Compile functions first
    let compiled1: any = null;
    let compiled2: any = null;

    try {
      if (func1.trim()) {
        compiled1 = math.compile(func1);
        setError1(null);
      }
    } catch (e: any) {
      setError1(e.message || 'Invalid Expression');
    }

    try {
      if (func2.trim() && showFunc2) {
        compiled2 = math.compile(func2);
        setError2(null);
      }
    } catch (e: any) {
      setError2(e.message || 'Invalid Expression');
    }

    // 1. Draw grid lines (Adaptive spacing)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'; // high contrast white grid lines
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b'; // slate-500 for numbers
    ctx.font = '10px JetBrains Mono, monospace';

    const rawDiffX = xMax - xMin;
    let step = 1;
    if (rawDiffX > 100) step = 20;
    else if (rawDiffX > 50) step = 10;
    else if (rawDiffX > 20) step = 5;
    else if (rawDiffX > 5) step = 1;
    else if (rawDiffX > 1) step = 0.2;
    else step = 0.05;

    // Find starting values aligned to step
    const startX = Math.floor(xMin / step) * step;
    const endX = Math.ceil(xMax / step) * step;

    // Vertical grid lines (constant X)
    for (let xG = startX; xG <= endX; xG += step) {
      const scrX = toScreenX(xG);
      ctx.beginPath();
      ctx.moveTo(scrX, 0);
      ctx.lineTo(scrX, height);
      ctx.stroke();

      // Label X
      if (Math.abs(xG) > 1e-10) {
        const yAxisScreen = toScreenY(0);
        const yLabelPos = yAxisScreen > height - 15 ? height - 5 : yAxisScreen < 15 ? 15 : yAxisScreen + 12;
        ctx.fillText(xG.toFixed(1).replace('.0', ''), scrX - 8, yLabelPos);
      }
    }

    const startY = Math.floor(yMin / step) * step;
    const endY = Math.ceil(yMax / step) * step;

    // Horizontal grid lines (constant Y)
    for (let yG = startY; yG <= endY; yG += step) {
      const scrY = toScreenY(yG);
      ctx.beginPath();
      ctx.moveTo(0, scrY);
      ctx.lineTo(width, scrY);
      ctx.stroke();

      // Label Y
      if (Math.abs(yG) > 1e-10) {
        const xAxisScreen = toScreenX(0);
        const xLabelPos = xAxisScreen < 5 ? 5 : xAxisScreen > width - 25 ? width - 30 : xAxisScreen + 6;
        ctx.fillText(yG.toFixed(1).replace('.0', ''), xLabelPos, scrY + 3);
      }
    }

    // 2. Draw Axes (X & Y)
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)'; // glowing cyan primary axes
    ctx.lineWidth = 1.5;

    // Y axis (x=0)
    if (xMin <= 0 && xMax >= 0) {
      ctx.beginPath();
      ctx.moveTo(toScreenX(0), 0);
      ctx.lineTo(toScreenX(0), height);
      ctx.stroke();
    }

    // X axis (y=0)
    if (yMin <= 0 && yMax >= 0) {
      ctx.beginPath();
      ctx.moveTo(0, toScreenY(0));
      ctx.lineTo(width, toScreenY(0));
      ctx.stroke();
    }

    // Origin label
    if (xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0) {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('0', toScreenX(0) - 12, toScreenY(0) + 12);
    }

    // 3. Draw Function Curves
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Curve 1 (Cyan)
    if (compiled1) {
      ctx.strokeStyle = '#06b6d4'; // cyan-500
      ctx.lineWidth = 3;
      ctx.beginPath();
      let isFirst = true;

      // Scan every pixel across the screen width
      for (let sX = 0; sX < width; sX++) {
        const gX = toGraphX(sX);
        const gY = evalCompiled(compiled1, gX);

        if (!isNaN(gY)) {
          const sY = toScreenY(gY);
          // Check if coordinate fits on screen slightly padded
          if (sY >= -50 && sY <= height + 50) {
            if (isFirst) {
              ctx.moveTo(sX, sY);
              isFirst = false;
            } else {
              ctx.lineTo(sX, sY);
            }
          } else {
            isFirst = true; // reset path segment
          }
        } else {
          isFirst = true;
        }
      }
      ctx.stroke();
    }

    // Curve 2 (Amber)
    if (compiled2 && showFunc2) {
      ctx.strokeStyle = '#f59e0b'; // amber-500
      ctx.lineWidth = 3;
      ctx.beginPath();
      let isFirst = true;

      for (let sX = 0; sX < width; sX++) {
        const gX = toGraphX(sX);
        const gY = evalCompiled(compiled2, gX);

        if (!isNaN(gY)) {
          const sY = toScreenY(gY);
          if (sY >= -50 && sY <= height + 50) {
            if (isFirst) {
              ctx.moveTo(sX, sY);
              isFirst = false;
            } else {
              ctx.lineTo(sX, sY);
            }
          } else {
            isFirst = true;
          }
        } else {
          isFirst = true;
        }
      }
      ctx.stroke();
    }

    // 4. Draw cursor tracking crosshairs
    if (hoverPosition) {
      const gX = toGraphX(hoverPosition.x);
      const sX = hoverPosition.x;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;

      // Vertical helper line
      ctx.beginPath();
      ctx.moveTo(sX, 0);
      ctx.lineTo(sX, height);
      ctx.stroke();

      // Recalculate intersections
      const pts: { xVal: number; yVal1?: number; yVal2?: number } = { xVal: gX };

      // Curve 1 tracing
      if (compiled1) {
        const gY1 = evalCompiled(compiled1, gX);
        if (!isNaN(gY1)) {
          pts.yVal1 = gY1;
          const sY1 = toScreenY(gY1);

          // Draw neon dot
          ctx.beginPath();
          ctx.arc(sX, sY1, 6, 0, 2 * Math.PI);
          ctx.fillStyle = '#06b6d4';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.setLineDash([]);
          ctx.stroke();
        }
      }

      // Curve 2 tracing
      if (compiled2 && showFunc2) {
        const gY2 = evalCompiled(compiled2, gX);
        if (!isNaN(gY2)) {
          pts.yVal2 = gY2;
          const sY2 = toScreenY(gY2);

          // Draw neon dot
          ctx.beginPath();
          ctx.arc(sX, sY2, 6, 0, 2 * Math.PI);
          ctx.fillStyle = '#f59e0b';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.setLineDash([]);
          ctx.stroke();
        }
      }

      setIntersectPoints(pts);
      ctx.setLineDash([]); // Reset line dash
    } else {
      setIntersectPoints(null);
    }
  }, [func1, func2, showFunc2, xMin, xMax, yMin, yMax, hoverPosition]);

  // Handle Resize using ResizeObserver as instructed
  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    const observer = new ResizeObserver((entries) => {
      // Force repaint
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        // Trigger render simply by touching bounds in dependency
        setXMin(p => p);
      }
    });

    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  // Pan controls
  const handlePan = (dxPixel: number, dyPixel: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const xDiff = xMax - xMin;
    const yDiff = yMax - yMin;

    const xShift = (dxPixel / canvas.width) * xDiff;
    const yShift = (dyPixel / canvas.height) * yDiff;

    setXMin(prev => prev - xShift);
    setXMax(prev => prev - xShift);
    setYMin(prev => prev + yShift);
    setYMax(prev => prev + yShift);
  };

  // Mouse pan triggers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return; // Only left click drag
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Relative mouse position
    const rect = canvas.getBoundingClientRect();
    const xPos = e.clientX - rect.left;
    const yPos = e.clientY - rect.top;

    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      handlePan(dx, dy);
      setDragStart({ x: e.clientX, y: e.clientY });
    }

    setHoverPosition({ x: xPos, y: yPos });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    setHoverPosition(null);
  };

  // Mouse wheel zoom triggers
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.15 : 0.85;
    handleZoom(zoomFactor);
  };

  return (
    <div className="flex flex-col h-full bg-[#080a0e] p-4 rounded-2xl border border-white/5 text-slate-300 shadow-2xl">
      {/* Description Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2 text-cyan-400">
            <Sparkles size={16} />
            Interactive 2D Graphing Plotter
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Plot bounds dynamically. Drag coordinates to Pan: scroll wheel to zoom.</p>
        </div>
        <div className="flex bg-[#0a0c10] border border-white/5 rounded-lg p-0.5 font-mono">
          <button
            onClick={() => {
              playHapticClick('standard');
              handleZoom(0.8);
            }}
            className="p-1 px-2 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={() => {
              playHapticClick('standard');
              handleZoom(1.2);
            }}
            className="p-1 px-2 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <button
            onClick={() => {
              playHapticClick('standard');
              handleResetView();
            }}
            className="p-1 px-2 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Reset Scope"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Function Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Function 1 */}
        <div className="bg-[#0a0c10] p-2.5 rounded-lg border border-white/5 flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-cyan-400 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block shadow-[0_0_6px_rgba(6,182,212,0.4)]"></span>
              f(x)
            </span>
            <button
              onClick={() => {
                playHapticClick('standard');
                onInsertToInput(func1);
              }}
              className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors uppercase font-mono tracking-wider cursor-pointer"
            >
              [Paste to Clc]
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={func1}
              onChange={(e) => setFunc1(e.target.value)}
              className={`w-full bg-[#05070a] border ${
                error1 ? 'border-red-500/40 text-red-100' : 'border-white/5 text-slate-100'
              } rounded p-1.5 pl-3 text-xs font-mono focus:outline-none focus:border-cyan-500/50`}
              placeholder="e.g. sin(x) + cos(2*x)"
            />
            {error1 && (
              <span className="absolute right-2 top-2 text-red-400" title={error1}>
                <AlertCircle size={14} className="animate-pulse" />
              </span>
            )}
          </div>
        </div>

        {/* Function 2 */}
        <div className="bg-[#0a0c10] p-2.5 rounded-lg border border-white/5 flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-amber-500 flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={showFunc2}
                onChange={(e) => {
                  playHapticClick('standard');
                  setShowFunc2(e.target.checked);
                }}
                className="rounded text-amber-500 bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer"
              />
              <span className={`w-2.5 h-2.5 rounded-full ${showFunc2 ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]' : 'bg-slate-600'} inline-block`}></span>
              g(x)
            </span>
            {showFunc2 && (
              <button
                onClick={() => {
                  playHapticClick('standard');
                  onInsertToInput(func2);
                }}
                className="text-[10px] text-slate-500 hover:text-amber-500 transition-colors uppercase font-mono tracking-wider cursor-pointer"
              >
                [Paste to Clc]
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              value={func2}
              onChange={(e) => setFunc2(e.target.value)}
              disabled={!showFunc2}
              className={`w-full bg-[#05070a] border ${
                error2 && showFunc2 ? 'border-red-500/40 text-red-100' : 'border-white/5 text-slate-100'
              } rounded p-1.5 pl-3 text-xs font-mono focus:outline-none focus:border-amber-400 disabled:opacity-40`}
              placeholder="e.g. 0.5 * x^2 - 3"
            />
            {error2 && showFunc2 && (
              <span className="absolute right-2 top-2 text-red-400" title={error2}>
                <AlertCircle size={14} className="animate-pulse" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Graph Area */}
      <div className="flex-1 relative min-h-[220px] bg-[#05070a] rounded-xl overflow-hidden border border-white/5 shadow-inner">
        {/* Canvas Container with ResizeObserver attachment */}
        <div ref={containerRef} className="absolute inset-0 w-full h-full">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair absolute top-0 left-0"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onWheel={handleWheel}
          />
        </div>

        {/* Hover coordinate overlays */}
        {intersectPoints && (
          <div className="absolute top-3 left-3 bg-[#0a0c10]/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10 shadow-xl pointer-events-none text-xs font-mono flex flex-col gap-1 z-10">
            <div className="text-[11px] text-slate-500 border-b border-white/5 pb-1 mb-1">Cursor Tracking:</div>
            <div>
              <span className="text-slate-400">X:</span>{' '}
              <span className="text-slate-300 font-medium">{intersectPoints.xVal.toFixed(4)}</span>
            </div>
            {intersectPoints.yVal1 !== undefined && (
              <div className="text-cyan-400 text-[11px]">
                <span className="text-cyan-500/80">f(x):</span>{' '}
                <span className="font-medium">{intersectPoints.yVal1.toFixed(4)}</span>
              </div>
            )}
            {intersectPoints.yVal2 !== undefined && showFunc2 && (
              <div className="text-amber-400 text-[11px]">
                <span className="text-amber-500/80">g(x):</span>{' '}
                <span className="font-medium">{intersectPoints.yVal2.toFixed(4)}</span>
              </div>
            )}
          </div>
        )}

        {/* Visual Cue for panning */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-[#0a0c10]/80 backdrop-blur-sm p-1.5 px-2.5 rounded-md text-[10px] text-slate-500 font-mono pointer-events-none">
          <Move size={12} className="text-cyan-500" />
          <span>DRAG PAN / SCROLL ZOOM</span>
        </div>
      </div>

      {/* Bound Readouts & Manual Boundaries settings */}
      <div className="mt-3 grid grid-cols-4 gap-2 text-[10px] font-mono text-slate-500 bg-[#0a0c10]/60 p-2 rounded-lg border border-white/5">
        <div className="flex flex-col">
          <span>X-Range Min</span>
          <input
            type="number"
            step="any"
            value={parseFloat(xMin.toFixed(2))}
            onChange={(e) => setXMin(parseFloat(e.target.value) || -10)}
            className="bg-transparent text-slate-200 border-none p-0 focus:ring-0 font-mono w-full font-semibold focus:outline-none focus:text-cyan-400"
          />
        </div>
        <div className="flex flex-col">
          <span>X-Range Max</span>
          <input
            type="number"
            step="any"
            value={parseFloat(xMax.toFixed(2))}
            onChange={(e) => setXMax(parseFloat(e.target.value) || 10)}
            className="bg-transparent text-slate-200 border-none p-0 focus:ring-0 font-mono w-full font-semibold focus:outline-none focus:text-cyan-400"
          />
        </div>
        <div className="flex flex-col">
          <span>Y-Range Min</span>
          <input
            type="number"
            step="any"
            value={parseFloat(yMin.toFixed(2))}
            onChange={(e) => setYMin(parseFloat(e.target.value) || -10)}
            className="bg-transparent text-slate-200 border-none p-0 focus:ring-0 font-mono w-full font-semibold focus:outline-none focus:text-cyan-400"
          />
        </div>
        <div className="flex flex-col">
          <span>Y-Range Max</span>
          <input
            type="number"
            step="any"
            value={parseFloat(yMax.toFixed(2))}
            onChange={(e) => setYMax(parseFloat(e.target.value) || 10)}
            className="bg-transparent text-slate-200 border-none p-0 focus:ring-0 font-mono w-full font-semibold focus:outline-none focus:text-cyan-400"
          />
        </div>
      </div>
    </div>
  );
}
