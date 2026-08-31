import React, { useEffect, useState } from 'react';
import { Clock, DollarSign, PieChart, FileSpreadsheet } from 'lucide-react';
import { API_BASE_URL } from '../../utils/config';

interface TimeTrackingReportCardProps {
  projectId: number;
}

export const TimeTrackingReportCard: React.FC<TimeTrackingReportCardProps> = ({ projectId }) => {
  const [report, setReport] = useState<{
    totalHours: string;
    billableHours: string;
    nonBillableHours: string;
    logsCount: number;
  } | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/time-logs/analytics/project/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setReport(data);
        }
      } catch (err) {
        console.error('Failed to fetch time report:', err);
      }
    };
    if (projectId) fetchReport();
  }, [projectId]);

  if (!report) return null;

  const total = parseFloat(report.totalHours) || 1;
  const billablePct = Math.round(((parseFloat(report.billableHours) || 0) / total) * 100);

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Time Tracking & Billing Analytics</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total logged billable vs non-billable team hours</p>
          </div>
        </div>

        <button
          onClick={() => alert(`Exported Time Sheet Report (${report.logsCount} entries)`)}
          className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600" /> Export Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
          <span className="text-xs font-medium text-gray-400 block">Total Logged Time</span>
          <span className="text-xl font-extrabold text-gray-900 dark:text-white mt-1 block">
            {report.totalHours} hrs
          </span>
          <span className="text-[11px] text-gray-500">{report.logsCount} logged entries</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Billable Hours
          </span>
          <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1 block">
            {report.billableHours} hrs
          </span>
          <span className="text-[11px] text-emerald-600/80">{billablePct}% of total time</span>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50">
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <PieChart className="w-3.5 h-3.5" /> Non-Billable Hours
          </span>
          <span className="text-xl font-extrabold text-amber-700 dark:text-amber-300 mt-1 block">
            {report.nonBillableHours} hrs
          </span>
          <span className="text-[11px] text-amber-600/80">{100 - billablePct}% overhead</span>
        </div>
      </div>
    </div>
  );
};
