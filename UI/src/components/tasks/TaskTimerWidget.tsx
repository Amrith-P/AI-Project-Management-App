import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Plus, Check } from 'lucide-react';
import { API_BASE_URL } from '../../utils/config';

interface TaskTimerWidgetProps {
  taskId: number;
  onTimeLogged?: () => void;
}

export const TaskTimerWidget: React.FC<TaskTimerWidgetProps> = ({ taskId, onTimeLogged }) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [description, setDescription] = useState('');
  const [isBillable, setIsBillable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loggedSuccess, setLoggedSuccess] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogTime = async () => {
    const minsToLog = Math.max(1, Math.round(seconds / 60));
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/time-logs/task/${taskId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          durationMinutes: minsToLog,
          description: description || 'Worked on task',
          isBillable,
        }),
      });

      if (res.ok) {
        setLoggedSuccess(true);
        setIsRunning(false);
        setSeconds(0);
        setDescription('');
        setTimeout(() => setLoggedSuccess(false), 2000);
        if (onTimeLogged) onTimeLogged();
      }
    } catch (err) {
      console.error('Failed to log task time:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <Clock className="w-4 h-4 text-indigo-400" /> Task Time Tracker
        </div>
        <span className="font-mono text-lg font-bold text-indigo-400 tracking-wider">
          {formatTime(seconds)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsRunning(!isRunning)}
          className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-all ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isRunning ? 'Pause' : 'Start Timer'}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsRunning(false);
            setSeconds(0);
          }}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Reset Timer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {seconds > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800 animate-fade-in">
          <input
            type="text"
            placeholder="Log description (e.g. Code review, Bug fix)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
          />

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isBillable}
                onChange={(e) => setIsBillable(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              Billable Hours
            </label>

            <button
              type="button"
              onClick={handleLogTime}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              {loggedSuccess ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {loggedSuccess ? 'Logged!' : `Log (${Math.max(1, Math.round(seconds / 60))}m)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
