import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchAIProjectInsight } from '../../store/slices/aiSlice';
import { Sparkles, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, Activity } from 'lucide-react';

interface AIInsightsWidgetProps {
  projectId: number;
}

export const AIInsightsWidget: React.FC<AIInsightsWidgetProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentInsight, isFetchingInsight } = useSelector((state: RootState) => state.ai);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchAIProjectInsight(projectId));
    }
  }, [dispatch, projectId]);

  const handleRefresh = () => {
    if (projectId) {
      dispatch(fetchAIProjectInsight(projectId));
    }
  };

  if (isFetchingInsight && !currentInsight) {
    return (
      <div className="bg-gradient-to-br from-white to-indigo-50/40 rounded-2xl p-6 border border-indigo-100 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-indigo-200 rounded w-1/3"></div>
          <div className="h-5 bg-indigo-200 rounded w-1/6"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
      </div>
    );
  }

  if (!currentInsight) return null;

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 rounded-2xl p-6 border border-indigo-100 shadow-sm space-y-5 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md">
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              AI Project Health & Insights
            </h3>
            <p className="text-xs text-gray-500">Real-time status breakdown & recommendations</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-xl shadow-xs">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-gray-800">{currentInsight.healthScore}% Health Score</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isFetchingInsight}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
            title="Refresh Insights"
          >
            <RefreshCw className={`w-4 h-4 ${isFetchingInsight ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Box */}
      <div className="p-4 bg-white/80 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed shadow-xs flex items-start gap-3">
        <div className="pt-0.5">
          <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-gray-900 text-xs uppercase tracking-wider">AI Assessment</span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getRiskBadge(currentInsight.riskLevel)}`}>
              {currentInsight.riskLevel} Risk
            </span>
          </div>
          <p className="text-sm text-gray-700">{currentInsight.statusSummary}</p>
        </div>
      </div>

      {/* Grid: Risks & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Risks */}
        <div className="p-4 bg-red-50/40 rounded-xl border border-red-100">
          <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Key Risks & Watchpoints
          </h4>
          <ul className="space-y-1.5">
            {currentInsight.keyRisks.map((risk, idx) => (
              <li key={idx} className="text-xs text-red-800 flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Actions */}
        <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100">
          <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <ArrowRight className="w-4 h-4 text-emerald-600" />
            Recommended Next Actions
          </h4>
          <ul className="space-y-1.5">
            {currentInsight.recommendedActions.map((action, idx) => (
              <li key={idx} className="text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
