import React, { useState, useEffect } from 'react';
import {
  Satellite,
  MapPin,
  ZoomIn,
  ZoomOut,
  Layers,
  ExternalLink,
  ShieldCheck,
  Search,
  Compass,
} from 'lucide-react';

interface SatelliteRoofViewerProps {
  address: string;
  city: string;
  state: string;
  zip: string;
  totalSquares: number;
  onAddressChange?: (newAddress: { address: string; city: string; state: string; zip: string }) => void;
}

const QUICK_CITIES = [
  { name: 'Austin, TX', address: '4910 Whispering Valley Dr', city: 'Austin', state: 'TX', zip: '78759' },
  { name: 'Dallas, TX', address: '3812 Monticello Ave', city: 'Dallas', state: 'TX', zip: '78705' },
  { name: 'Houston, TX', address: '1420 Heights Blvd', city: 'Houston', state: 'TX', zip: '77008' },
  { name: 'San Antonio, TX', address: '210 Alamo Plaza', city: 'San Antonio', state: 'TX', zip: '78205' },
  { name: 'Denver, CO', address: '1720 Wynkoop St', city: 'Denver', state: 'CO', zip: '80202' },
  { name: 'Tampa, FL', address: '401 Bayshore Blvd', city: 'Tampa', state: 'FL', zip: '33606' },
  { name: 'Miami, FL', address: '1100 Biscayne Blvd', city: 'Miami', state: 'FL', zip: '33132' },
  { name: 'Phoenix, AZ', address: '4400 E Camelback Rd', city: 'Phoenix', state: 'AZ', zip: '85018' },
];

export const SatelliteRoofViewer: React.FC<SatelliteRoofViewerProps> = ({
  address,
  city,
  state,
  zip,
  totalSquares,
  onAddressChange,
}) => {
  const [searchInput, setSearchInput] = useState(`${address ? `${address}, ` : ''}${city || 'Austin'}, ${state || 'TX'} ${zip || ''}`.trim());
  const [activeQuery, setActiveQuery] = useState(`${address ? `${address}, ` : ''}${city || 'Austin'}, ${state || 'TX'} ${zip || ''}`.trim());
  const [zoomLevel, setZoomLevel] = useState(19);
  const [viewMode, setViewMode] = useState<'satellite' | 'hybrid' | 'streets'>('satellite');

  // Keep search input synced when parent props update
  useEffect(() => {
    const combined = `${address ? `${address}, ` : ''}${city || 'Austin'}, ${state || 'TX'} ${zip || ''}`.trim();
    setSearchInput(combined);
    setActiveQuery(combined);
  }, [address, city, state, zip]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const query = searchInput.trim();
    setActiveQuery(query);

    // If query has no street number, adjust zoom to city level
    const hasStreetNumber = /\d+/.test(query.split(',')[0] || '');
    if (!hasStreetNumber) {
      setZoomLevel(15);
    } else {
      setZoomLevel(19);
    }

    // Try to parse address parts if callback exists
    if (onAddressChange) {
      const parts = query.split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        const street = hasStreetNumber ? parts[0] : '';
        const cityPart = hasStreetNumber ? parts[1] : parts[0];
        const stateZipPart = hasStreetNumber ? parts[2] || '' : parts[1] || '';
        const stateZipMatch = stateZipPart.match(/([A-Za-z]{2})\s*(\d{5})?/);

        onAddressChange({
          address: street || address,
          city: cityPart || city,
          state: stateZipMatch?.[1]?.toUpperCase() || state,
          zip: stateZipMatch?.[2] || zip,
        });
      } else if (parts.length === 1) {
        onAddressChange({
          address: '',
          city: parts[0],
          state: state || 'TX',
          zip: zip || '',
        });
      }
    }
  };

  const handleSelectQuickCity = (qc: (typeof QUICK_CITIES)[0]) => {
    const full = `${qc.address}, ${qc.city}, ${qc.state} ${qc.zip}`;
    setSearchInput(full);
    setActiveQuery(full);
    setZoomLevel(19);
    if (onAddressChange) {
      onAddressChange({
        address: qc.address,
        city: qc.city,
        state: qc.state,
        zip: qc.zip,
      });
    }
  };

  // Google Maps embed URL
  const mapTypeParam = viewMode === 'satellite' ? 'k' : viewMode === 'hybrid' ? 'h' : 'm';
  const encodedQuery = encodeURIComponent(activeQuery);
  const mapSrc = `https://maps.google.com/maps?q=${encodedQuery}&t=${mapTypeParam}&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold shrink-0">
            <Satellite className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>High-Res Satellite Roof Aerial View</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Live Imagery
              </span>
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[280px] sm:max-w-md">{activeQuery}</span>
            </p>
          </div>
        </div>

        {/* View & Zoom Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 1, 21))}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Zoom In (Closer to Shingles)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 1, 12))}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Zoom Out (Wider View)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() =>
              setViewMode((m) => (m === 'satellite' ? 'hybrid' : m === 'hybrid' ? 'streets' : 'satellite'))
            }
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <Layers className="w-3 h-3 text-emerald-400" />
            <span>
              {viewMode === 'satellite' ? 'Satellite' : viewMode === 'hybrid' ? 'Hybrid Roads' : 'Street Map'}
            </span>
          </button>
          <a
            href={`https://maps.google.com/?q=${encodedQuery}&t=k`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Open in Google Maps / Google Earth"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
          </a>
        </div>
      </div>

      {/* Interactive Address & City Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search any street address or city (e.g. 3812 Monticello Ave, Dallas, TX or Tampa, FL)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black shrink-0 transition-all shadow-md shadow-emerald-500/20"
          >
            Locate Roof
          </button>
        </div>
      </form>

      {/* Quick City Jump Selector */}
      <div className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
          <Compass className="w-3 h-3 text-emerald-400" /> Quick City:
        </span>
        {QUICK_CITIES.map((qc) => (
          <button
            key={qc.name}
            type="button"
            onClick={() => handleSelectQuickCity(qc)}
            className={`px-2.5 py-1 rounded-lg shrink-0 border transition-all ${
              activeQuery.toLowerCase().includes(qc.city.toLowerCase())
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {qc.name}
          </button>
        ))}
      </div>

      {/* Map Embed Container with HUD Overlay */}
      <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-emerald-950/80 bg-slate-950 shadow-inner">
        <iframe
          title="Satellite Roof Imagery"
          src={mapSrc}
          className="w-full h-full border-0 filter brightness-95 contrast-105"
          loading="lazy"
          allowFullScreen
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
            <ShieldCheck className="w-3 h-3" /> Zoom Level {zoomLevel}x
          </span>
        </div>
      </div>
    </div>
  );
};

