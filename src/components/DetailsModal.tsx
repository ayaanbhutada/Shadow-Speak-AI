import React, { useState } from 'react';
import { X, Volume2, Sparkles, MessageSquare, ArrowRight } from 'lucide-react';
import { PredictedResponse } from '../types';

interface DetailsModalProps {
  response: PredictedResponse | null;
  onClose: () => void;
  onSpeakText: (text: string) => void;
  onPrepareText: (text: string) => void;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({
  response,
  onClose,
  onSpeakText,
  onPrepareText,
}) => {
  if (!response) return null;

  const [customText, setCustomText] = useState(response.details || response.text);

  const handleSpeakShort = () => {
    onSpeakText(response.text);
    onClose();
  };

  const handleSpeakDetailed = () => {
    onSpeakText(customText);
    onClose();
  };

  const handlePrepare = () => {
    onPrepareText(customText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-slate-100 text-sm">Response Details & Variations</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Short Option ({response.tag})
            </span>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-lg font-extrabold text-cyan-300">
              "{response.text}"
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Expanded Detailed Version
            </span>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-base text-slate-100 font-semibold focus:outline-none focus:border-cyan-500 min-h-[90px]"
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/60 flex flex-wrap gap-2 justify-end">
          <button
            onClick={handlePrepare}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            Put in Ready Bar
          </button>
          <button
            onClick={handleSpeakShort}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/80 flex items-center gap-1.5"
          >
            <Volume2 className="w-3.5 h-3.5" /> Speak Short
          </button>
          <button
            onClick={handleSpeakDetailed}
            className="px-5 py-2 rounded-lg text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-md"
          >
            <Volume2 className="w-3.5 h-3.5" /> Speak Detailed
          </button>
        </div>
      </div>
    </div>
  );
};
