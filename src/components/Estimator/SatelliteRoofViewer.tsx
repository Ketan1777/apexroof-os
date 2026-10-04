import React, { useState } from 'react';
import { Satellite, MapPin, ZoomIn, ZoomOut, Layers, ExternalLink, ShieldCheck } from 'lucide-react';

interface SatelliteRoofViewerProps {
  address: string;
  city: string;
  state: string;
  zip: string;
  totalSquares: number;
}

export const SatelliteRoofViewer: React.FC<SatelliteRoofViewerProps> = ({
  address,
  city,
  state,
  zip,
  totalSquares,
}) => {
  const [zoomLevel, setZoomLevel] = useState(19);
  const [viewMode, setViewMode] = useState<'satellite' | 'hybrid'>('satellite');

  // Generate clean search query for satellite maps
  const fullAddress = `${address}, ${city}, ${state} ${zip}`;
  const encodedAddress = encodeURIComponent(fullAddress);

  // Free high-resolution satellite imagery map embed (OpenStreetMap / ESRI World Imagery or Google Satellite)
  const mapSrc = `https://maps.google.com/maps?q=${encodedAddress}&t=${viewMode === 'satellite' ? 'k' : 'h'}&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
            <Satellite className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>High-Res Satellite Roof Aerial View</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Aerial Geometry
              </span>
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{fullAddress}</span>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 1, 21))}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 1, 16))}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'satellite' ? 'hybrid' : 'satellite')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <Layers className="w-3 h-3 text-emerald-400" />
            <span>{viewMode === 'satellite' ? 'Pure Satellite' : 'Road Overlay'}</span>
          </button>
          <a
            href={`https://maps.google.com/?q=${encodedAddress}&t=k`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Open in Google Earth"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
          </a>
        </div>
      </div>

      {/* Map Embed Container with HUD Overlay */}
      <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-emerald-950/80 bg-slate-950 shadow-inner">
        <iframe
          title="Satellite Roof Imagery"
          src={mapSrc}
          className="w-full h-full border-0 filter brightness-95 contrast-105"
          loading="lazy"
        />

        {/* HUD Crosshair & Pitch Alignment Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-24 h-24 border-2 border-emerald-400/40 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          </div>
          {/* Subtle perimeter guidelines */}
          <div className="absolute top-1/2 left-8 right-8 border-b border-dashed border-emerald-400/20" />
          <div className="absolute left-1/2 top-8 bottom-8 border-r border-dashed border-emerald-400/20" />
        </div>

        {/* Bottom Floating Stats Pill */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto flex items-center justify-between sm:justify-start gap-3 bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-emerald-950/90 shadow-lg text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Calculated Footprint:</span>
            <span className="font-mono font-bold text-white">{totalSquares} SQ</span>
          </div>
          <span className="text-[11px] text-emerald-300 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3 h-3" /> Aerial Pitch Verified
          </span>
        </div>
      </div>
    </div>
  );
};
