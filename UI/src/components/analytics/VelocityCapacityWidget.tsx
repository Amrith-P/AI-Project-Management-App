import React, { useEffect, useState } from 'react';
import { Zap, TrendingUp, Users, Clock, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/apiHeaders';

interface VelocityCapacityWidgetProps {
  projectId?: number | string;
}

export const VelocityCapacityWidget: React.FC<VelocityCapacityWidgetProps> = ({ projectId }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCapacity();
  }, [projectId]);

  const fetchCapacity = async () => {
    try {
      setIsLoading(true);
      const res = await axios.post(
        'http://localhost:5001/api/ai/predict-capacity',
        { projectId: projectId || 'all' },
        getAuthHeaders()
      );
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch AI capacity forecast:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-pulse">
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="h-16 bg-slate-100 dark:bg-slate-800/50 rounded-xl mb-4"></div>
        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
      </div>
    );
  }

  if (!data) return null;

  const getBurnoutColor = (level: string) => {
    if (level === 'High') return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800';
    if (level === 'Moderate') return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              AI Predictive Capacity & Velocity Forecast
            </h3>
            <p className="text-xs text-slate-500">Monte Carlo sprint velocity forecast & team workload risk score</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getBurnoutColor(data.burnoutLevel)} flex items-center gap-1.5`}>
          <ShieldAlert className="w-3.5 h-3.5" /> Burnout Risk: {data.burnoutLevel} ({data.burnoutRiskScore}%)
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Users className="w-4 h-4 text-indigo-500" /> Active Team
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{data.teamSize} devs</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Clock className="w-4 h-4 text-purple-500" /> Remaining Hours
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{data.totalEstHours} hrs</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Est. Time to Done
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">~{data.estimatedWeeksToCompletion} wks</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Zap className="w-4 h-4 text-amber-500" /> Weekly Capacity
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{data.weeklyCapacityHours} hrs/wk</p>
        </div>
      </div>

      {/* Completion Probabilities */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Monte Carlo Completion Probabilities
        </h4>
        <div className="space-y-2">
          {data.forecastProbabilities?.map((p: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800/60 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{p.date}</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{p.weeks}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
