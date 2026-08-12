import React, { useState, useEffect } from 'react';
import { X, Download, FileText, FileCode, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/config';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number | string;
  projectName: string;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({ isOpen, onClose, projectId, projectName }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [exportData, setExportData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchExport = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API_BASE_URL}/projects/${projectId}/export`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setExportData(res.data);
        } catch (err) {
          console.error('Failed to load export report:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchExport();
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const downloadMarkdown = () => {
    if (!exportData) return;
    const blob = new Blob([exportData.markdownReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Project_Report_${projectName.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    if (!exportData) return;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Project_Data_${projectName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl text-indigo-400">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Executive Report Export Suite</h2>
              <p className="text-xs text-indigo-200 mt-0.5">Export project blueprints, task breakdowns, & activity timelines.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
              <p className="text-xs font-semibold">Generating executive summary report...</p>
            </div>
          ) : !exportData ? (
            <div className="py-8 text-center text-red-500 text-xs">Failed to load export data.</div>
          ) : (
            <>
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                  Report Summary: {projectName}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Includes {exportData.tasks.length} tasks, {exportData.activities.length} activity audit logs, and complete completion velocity statistics.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={downloadMarkdown}
                  className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/30 transition-all text-left group"
                >
                  <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white">Markdown Report (.md)</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Formatted for GitHub, Notion, or documentation portals.</p>
                </button>

                <button
                  onClick={downloadJSON}
                  className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/30 transition-all text-left group"
                >
                  <FileCode className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white">JSON Blueprint (.json)</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Full structured data backup for API integrations.</p>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
