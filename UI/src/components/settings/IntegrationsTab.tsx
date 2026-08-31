import React, { useEffect, useState } from 'react';
import { GitBranch, MessageSquare, Link, Trash2, CheckCircle, Copy } from 'lucide-react';
import { API_BASE_URL } from '../../utils/config';

interface Webhook {
  id: number;
  provider: string;
  webhookUrl: string;
  secret: string;
  createdAt: string;
}

export const IntegrationsTab: React.FC = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [slackUrl, setSlackUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const githubWebhookEndpoint = `${API_BASE_URL}/webhooks/github`;

  const fetchWebhooks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/webhooks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWebhooks(data);
      }
    } catch (err) {
      console.error('Failed to fetch webhooks:', err);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleCopyGithubUrl = () => {
    navigator.clipboard.writeText(githubWebhookEndpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddSlackWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slackUrl) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider: 'slack',
          webhookUrl: slackUrl,
          events: ['high-priority-risk', 'task-done'],
        }),
      });

      if (res.ok) {
        setSlackUrl('');
        fetchWebhooks();
      }
    } catch (err) {
      console.error('Failed to save Slack webhook:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebhook = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/webhooks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchWebhooks();
    } catch (err) {
      console.error('Failed to delete webhook:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Integrations & Developer Webhooks</h2>
        <p className="text-sm text-slate-400">Connect GitHub commits & Slack notifications directly to your projects</p>
      </div>

      {/* GitHub Integration Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800 text-white">
            <GitBranch className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">GitHub Repository Webhook</h3>
            <p className="text-xs text-slate-400">Auto-update tasks via commit messages (e.g., `#TASK-12 close` or `#TASK-12 wip`)</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payload URL</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={githubWebhookEndpoint}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none"
            />
            <button
              onClick={handleCopyGithubUrl}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Set Payload URL in GitHub Repo Settings &rarr; Webhooks (Content-type: application/json).
          </p>
        </div>
      </div>

      {/* Slack Integration Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-500/30">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Slack Outbound Webhook</h3>
            <p className="text-xs text-slate-400">Receive real-time alerts when AI detects high risks or critical tasks complete</p>
          </div>
        </div>

        <form onSubmit={handleAddSlackWebhook} className="flex gap-2">
          <input
            type="url"
            placeholder="https://hooks.slack.com/services/..."
            value={slackUrl}
            onChange={(e) => setSlackUrl(e.target.value)}
            required
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center gap-2 shrink-0 transition-colors"
          >
            <Link className="w-4 h-4" /> Add Webhook
          </button>
        </form>

        {/* Existing Active Webhooks */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Outbound Webhooks</h4>
          {webhooks.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No webhooks added yet.</p>
          ) : (
            <div className="space-y-2">
              {webhooks.map((hook) => (
                <div
                  key={hook.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold uppercase text-[10px]">
                      {hook.provider}
                    </span>
                    <span className="text-slate-300 font-mono truncate">{hook.webhookUrl}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteWebhook(hook.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
