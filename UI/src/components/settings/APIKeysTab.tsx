import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Copy, Check, ShieldCheck, Terminal } from 'lucide-react';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/apiHeaders';

interface ApiKeyRecord {
  id: number;
  name: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt?: string;
  createdAt: string;
  rawKey?: string;
}

export const APIKeysTab: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [keyName, setKeyName] = useState('');
  const [newGeneratedKey, setNewGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('http://localhost:5001/api/api-keys', getAuthHeaders());
      setKeys(res.data || []);
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!keyName.trim()) return;
    try {
      setIsGenerating(true);
      const res = await axios.post(
        'http://localhost:5001/api/api-keys',
        { name: keyName.trim(), scopes: ['read', 'write'] },
        getAuthHeaders()
      );
      if (res.data && res.data.rawKey) {
        setNewGeneratedKey(res.data.rawKey);
        setKeyName('');
        fetchKeys();
      }
    } catch (err) {
      console.error('Failed to generate API key:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevokeKey = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5001/api/api-keys/${id}`, getAuthHeaders());
      setKeys(keys.filter(k => k.id !== id));
    } catch (err) {
      console.error('Failed to revoke API key:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-600" /> Personal Access Tokens & API Keys
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Generate Bearer tokens for authenticating scripts and third-party tools against the REST API.
          </p>
        </div>
      </div>

      {/* Generated Token Secret Banner */}
      {newGeneratedKey && (
        <div className="bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold text-sm">
            <span className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> New Secret API Key Generated</span>
            <button onClick={() => setNewGeneratedKey(null)} className="text-xs hover:underline">Close</button>
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            Please copy this API key now. You will <strong>not</strong> be able to see it again!
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={newGeneratedKey}
              className="flex-1 font-mono text-xs p-2.5 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 rounded-lg text-slate-900 dark:text-white select-all"
            />
            <button
              onClick={() => copyToClipboard(newGeneratedKey)}
              className="px-3.5 py-2.5 bg-emerald-600 text-white font-medium text-xs rounded-lg hover:bg-emerald-700 transition flex items-center gap-1.5"
            >
              {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedKey ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Generate Form */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3">
        <input
          type="text"
          placeholder="Key Name / Usage Description (e.g. CI/CD Deployment Script)"
          value={keyName}
          onChange={(e) => setKeyName(e.target.value)}
          className="flex-1 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
        />
        <button
          onClick={handleGenerateKey}
          disabled={isGenerating || !keyName.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> {isGenerating ? 'Generating...' : 'Generate Token'}
        </button>
      </div>

      {/* Active Keys Table */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Active API Keys ({keys.length})
        </h4>
        {isLoading ? (
          <div className="text-center py-6 text-slate-400 text-xs">Loading API keys...</div>
        ) : keys.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/30 rounded-xl text-slate-500 text-xs border border-dashed border-slate-200 dark:border-slate-800">
            No API keys generated yet.
          </div>
        ) : (
          <div className="space-y-2">
            {keys.map((k) => (
              <div key={k.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center text-sm">
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {k.name}
                    <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                      {k.keyPrefix}
                    </span>
                  </h5>
                  <p className="text-xs text-slate-500 mt-1">
                    Created on {new Date(k.createdAt).toLocaleDateString()} {k.lastUsedAt ? `• Last used ${new Date(k.lastUsedAt).toLocaleDateString()}` : '• Never used'}
                  </p>
                </div>
                <button
                  onClick={() => handleRevokeKey(k.id)}
                  className="p-2 text-slate-400 hover:text-red-500 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Revoke Token"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive cURL Code Snippet Explorer */}
      <div className="bg-slate-900 text-slate-200 p-4 rounded-xl space-y-2 font-mono text-xs">
        <div className="flex items-center gap-2 text-indigo-400 font-bold border-b border-slate-800 pb-2">
          <Terminal className="w-4 h-4" /> Usage Example (cURL)
        </div>
        <pre className="overflow-x-auto text-slate-300">
{`curl -X GET "http://localhost:5001/api/projects" \\
  -H "Authorization: Bearer pat_your_secret_token_here"`}
        </pre>
      </div>

    </div>
  );
};
