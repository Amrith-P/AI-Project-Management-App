import React, { useEffect, useState } from 'react';
import { Plus, X, ListPlus } from 'lucide-react';
import { API_BASE_URL } from '../../utils/config';

interface CustomFieldsManagerModalProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomFieldsManagerModal: React.FC<CustomFieldsManagerModalProps> = ({
  projectId,
  isOpen,
  onClose,
}) => {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [fieldType, setFieldType] = useState('Text');
  const [optionsStr, setOptionsStr] = useState('');

  const fetchFields = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/custom-fields/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFields(data);
      }
    } catch (err) {
      console.error('Error fetching custom fields:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && projectId) fetchFields();
  }, [isOpen, projectId]);

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const options = optionsStr ? optionsStr.split(',').map((s) => s.trim()) : [];

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/custom-fields`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          name,
          fieldType,
          options,
        }),
      });

      if (res.ok) {
        setName('');
        setOptionsStr('');
        fetchFields();
      }
    } catch (err) {
      console.error('Error adding custom field:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ListPlus className="w-5 h-5 text-indigo-400" /> Project Custom Fields
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add New Field Form */}
        <form onSubmit={handleAddField} className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Add Custom Field</h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Field Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Customer ID, Severity"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Type</label>
              <select
                value={fieldType}
                onChange={(e) => setFieldType(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Text">Text</option>
                <option value="Number">Number</option>
                <option value="Dropdown">Dropdown</option>
                <option value="Date">Date</option>
              </select>
            </div>
          </div>

          {fieldType === 'Dropdown' && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Options (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. Low, Medium, High, Critical"
                value={optionsStr}
                onChange={(e) => setOptionsStr(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Field
          </button>
        </form>

        {/* Existing Custom Fields List */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Custom Fields ({fields.length})</h4>
          {loading ? (
            <p className="text-xs text-slate-500 italic">Loading fields...</p>
          ) : fields.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No custom fields created for this project.</p>
          ) : (
            <div className="space-y-1.5">
              {fields.map((f) => (
                <div
                  key={f.id}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{f.name}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                      {f.fieldType}
                    </span>
                  </div>
                  {f.options && f.options.length > 0 && (
                    <span className="text-[10px] text-slate-500 truncate max-w-[150px]">
                      {f.options.join(', ')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
