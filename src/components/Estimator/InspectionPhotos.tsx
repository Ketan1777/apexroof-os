import React, { useState } from 'react';
import { Camera, Plus, Trash2 } from 'lucide-react';
import { InspectionPhoto } from '../../types';

interface InspectionPhotosProps {
  photos: InspectionPhoto[];
  onAddPhoto: (photo: InspectionPhoto) => void;
  onRemovePhoto: (id: string) => void;
}

const SAMPLE_PRESETS = [
  {
    label: 'Granular loss & hail impact strike (South Face)',
    severity: 'high' as const,
    notes: 'Direct 1.5" hail strike exposed fiberglass matting. Vulnerable to UV decay.',
    url: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Cracked rubber plumbing pipe boot flashing',
    severity: 'critical' as const,
    notes: 'Sun-rotted neoprene boot allows rainwater into ceiling drywall below bathroom.',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Wind lifted tab along rake edge',
    severity: 'medium' as const,
    notes: 'Adhesive seal failed. High risk of blow-off in next storm.',
    url: 'https://images.unsplash.com/photo-1505705694340-019e1e335916?auto=format&fit=crop&w=600&q=80',
  },
];

export const InspectionPhotos: React.FC<InspectionPhotosProps> = ({
  photos,
  onAddPhoto,
  onRemovePhoto,
}) => {
  const [customLabel, setCustomLabel] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [customSeverity, setCustomSeverity] = useState<'low' | 'medium' | 'high'>('high');

  const handleAddPreset = (preset: (typeof SAMPLE_PRESETS)[0]) => {
    const newPhoto: InspectionPhoto = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      url: preset.url,
      label: preset.label,
      severity: preset.severity === 'critical' ? 'high' : preset.severity,
      notes: preset.notes,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    onAddPhoto(newPhoto);
  };

  const handleAddCustom = () => {
    if (!customLabel.trim()) return;
    const newPhoto: InspectionPhoto = {
      id: `p_${Date.now()}`,
      url: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=600&q=80',
      label: customLabel,
      severity: customSeverity,
      notes: customNotes || 'Inspected on-site during initial roof walkthrough.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    onAddPhoto(newPhoto);
    setCustomLabel('');
    setCustomNotes('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              On-Site Damage & Inspection Gallery
            </h3>
            <p className="text-xs text-slate-400">Photos attached to customer proposal & insurance claims</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
          {photos.length} Damage Photos
        </span>
      </div>

      {/* Preset Quick Add Buttons for field efficiency */}
      <div className="mb-5 bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          ⚡ 1-Tap Common Roof Inspection Findings
        </span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAddPreset(preset)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 border border-slate-700/60 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              {preset.label.split('(')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-5">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col justify-between shadow-lg"
          >
            <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
              <img
                src={photo.url}
                alt={photo.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2.5 left-2.5">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md backdrop-blur-md ${
                    photo.severity === 'high'
                      ? 'bg-red-500/80 text-white'
                      : photo.severity === 'medium'
                      ? 'bg-emerald-500/90 text-slate-950'
                      : 'bg-teal-500/80 text-white'
                  }`}
                >
                  {photo.severity} Hazard
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemovePhoto(photo.id)}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-white transition-colors"
                title="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-2 right-2 text-[10px] bg-black/70 px-2 py-0.5 rounded text-slate-300">
                {photo.timestamp}
              </div>
            </div>

            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <h5 className="text-xs font-bold text-white leading-tight mb-1">{photo.label}</h5>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {photo.notes}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Input form */}
      <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row gap-3 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-slate-400 mb-1">Custom Issue Title</label>
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="e.g. Broken tile at eave rake edge..."
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="w-full md:w-36">
          <label className="block text-xs font-medium text-slate-400 mb-1">Severity</label>
          <select
            value={customSeverity}
            onChange={(e) => setCustomSeverity(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="low">Low Risk</option>
            <option value="medium">Medium Leak</option>
            <option value="high">Critical Damage</option>
          </select>
        </div>
        <button
          type="button"
          onClick={handleAddCustom}
          disabled={!customLabel.trim()}
          className="w-full md:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-40"
        >
          <Plus className="w-3.5 h-3.5" /> Log Issue
        </button>
      </div>
    </div>
  );
};
