import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, PenTool, ShieldCheck } from 'lucide-react';

interface SignaturePadProps {
  onSave: (dataUrl: string, signerName: string) => void;
  initialSignerName?: string;
  isCompleted?: boolean;
  existingSignatureUrl?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  initialSignerName = '',
  isCompleted = false,
  existingSignatureUrl,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [signerName, setSignerName] = useState(initialSignerName);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#10b981'; // Trusted emerald green digital security ink
    ctx.lineWidth = 2.5;

    if (existingSignatureUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasDrawn(true);
      };
      img.src = existingSignatureUrl;
    }
  }, [existingSignatureUrl]);

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isCompleted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isCompleted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isCompleted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl, signerName || 'Authorized Property Owner');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
              <span>On-Site E-Sign Approval</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </h4>
            <p className="text-xs text-slate-400">Homeowner or authorized agent digital signature</p>
          </div>
        </div>
        {isCompleted && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <Check className="w-3.5 h-3.5" /> Legally Executed
          </span>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Signer Full Legal Name</label>
        <input
          type="text"
          value={signerName}
          disabled={isCompleted}
          onChange={(e) => setSignerName(e.target.value)}
          placeholder="e.g. Robert Miller"
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-60"
        />
      </div>

      <div className="relative border-2 border-dashed border-emerald-950/80 rounded-2xl bg-slate-950 overflow-hidden mb-3">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`w-full h-44 touch-none cursor-crosshair ${isCompleted ? 'pointer-events-none opacity-80' : ''}`}
        />
        {!hasDrawn && !isCompleted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-emerald-800/80 text-xs font-medium">
            Sign with finger, stylus, or cursor above the line
          </div>
        )}
        <div className="absolute bottom-5 left-8 right-8 border-b border-emerald-950/80 pointer-events-none flex justify-between text-[10px] text-slate-600 pt-1">
          <span>X (Authorized Signer)</span>
          <span>Date: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
        By providing an electronic signature, I certify that I am the legal property owner or authorized representative, agree to the itemized scope of work and warranty specifications, and authorize commencement upon deposit receipt.
      </p>

      {!isCompleted && (
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <Eraser className="w-3.5 h-3.5" /> Clear
          </button>
          <button
            type="button"
            disabled={!hasDrawn || !signerName.trim()}
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" /> Save Signature & Lock In
          </button>
        </div>
      )}
    </div>
  );
};
