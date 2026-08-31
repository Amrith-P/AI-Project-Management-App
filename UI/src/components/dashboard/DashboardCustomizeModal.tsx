import React from 'react';
import { X, Layout, Eye, EyeOff, Check } from 'lucide-react';

export interface WidgetConfig {
  id: string;
  name: string;
  description: string;
  visible: boolean;
}

interface DashboardCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: WidgetConfig[];
  onToggleWidget: (id: string) => void;
}

export const DashboardCustomizeModal: React.FC<DashboardCustomizeModalProps> = ({
  isOpen,
  onClose,
  widgets,
  onToggleWidget,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Customize Dashboard</h3>
              <p className="text-xs text-slate-400">Toggle visible widgets & layout</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Widgets List */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              onClick={() => onToggleWidget(widget.id)}
              className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                widget.visible
                  ? 'bg-slate-800/80 border-indigo-500/50 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="space-y-0.5 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{widget.name}</p>
                <p className="text-xs text-slate-400 truncate">{widget.description}</p>
              </div>

              <button
                className={`p-2 rounded-lg transition-colors ${
                  widget.visible
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
          >
            <Check className="w-4 h-4" /> Save Layout
          </button>
        </div>
      </div>
    </div>
  );
};
