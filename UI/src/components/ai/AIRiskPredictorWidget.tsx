import React, { useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, RefreshCw, Zap, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/config';

interface RiskData {
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  summary: string;
  warningItems: string[];
  recommendedFixes: string[];
}

interface AIRiskPredictorWidgetProps {
  projectId?: number | string;
}

export const AIRiskPredictorWidget: React.FC<AIRiskPredictorWidgetProps> = ({ projectId }) => {
  const [data, setData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [appliedFixes, setAppliedFixes] = useState<Record<number, boolean>>({});

  const fetchRiskAnalysis = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE_URL}/ai/risk-analysis`,
        { projectId: projectId || 'all' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(res.data);
    } catch (error) {
      console.error('Risk analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskAnalysis();
  }, [projectId]);

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse flex flex-col justify-between h-full min-h-[160px]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950 rounded-xl"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const healthScore = Math.max(0, 100 - data.riskScore);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical':
        return { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-900/50', badge: 'bg-red-600', ring: 'stroke-red-500' };
      case 'High':
        return { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-900/50', badge: 'bg-amber-500', ring: 'stroke-amber-500' };
      case 'Medium':
        return { bg: 'bg-yellow-50 dark:bg-yellow-950/30', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-900/50', badge: 'bg-yellow-500', ring: 'stroke-yellow-500' };
      default:
        return { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-900/50', badge: 'bg-emerald-500', ring: 'stroke-emerald-500' };
    }
  };

  const style = getRiskColor(data.riskLevel);

  const handleApplyFix = (idx: number) => {
    setAppliedFixes(prev => ({ ...prev, [idx]: true }));
  };

  return (
    <div className={`p-5 rounded-2xl border ${style.border} ${style.bg} shadow-sm transition-all hover:shadow-md relative overflow-hidden`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl text-white ${style.badge} shadow-sm flex-shrink-0 mt-0.5`}>
            {data.riskLevel === 'Low' ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">AI Health & Risk Predictor</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold text-white ${style.badge}`}>
                {data.riskLevel} Risk
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed max-w-xl">{data.summary}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-center">
          <div className="text-right">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Health Score</span>
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{healthScore}<span className="text-xs text-gray-400 dark:text-gray-500">/100</span></span>
          </div>

          <button
            onClick={fetchRiskAnalysis}
            className="p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 transition-colors shadow-xs"
            title="Re-evaluate Risk"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {(data.warningItems.length > 0 || data.recommendedFixes.length > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200/60 dark:border-gray-800/80 grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.warningItems.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Active Risk Factors
              </span>
              <ul className="space-y-1">
                {data.warningItems.map((item, idx) => (
                  <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.recommendedFixes.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Recommended Mitigations
              </span>
              <ul className="space-y-1">
                {data.recommendedFixes.map((fix, idx) => (
                  <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-center justify-between gap-2 bg-white/70 dark:bg-gray-800/80 p-1.5 rounded-lg border border-gray-200/40 dark:border-gray-700/50">
                    <span>{fix}</span>
                    <button
                      onClick={() => handleApplyFix(idx)}
                      disabled={appliedFixes[idx]}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-all flex items-center gap-1 flex-shrink-0 ${
                        appliedFixes[idx]
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
                      }`}
                    >
                      {appliedFixes[idx] ? <><CheckCircle2 className="w-3 h-3" /> Done</> : 'Acknowledge'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
