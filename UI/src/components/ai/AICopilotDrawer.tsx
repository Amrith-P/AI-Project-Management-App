import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { smartPrioritizeTasks } from '../../store/slices/taskSlice';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/config';
import { 
  X, 
  Send, 
  Sparkles, 
  Zap, 
  FileText, 
  RefreshCw
} from 'lucide-react';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentProjectId?: number | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  actionCards?: any[];
  timestamp: string;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({ isOpen, onClose, currentProjectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentProject } = useSelector((state: RootState) => state.projects);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am your **AI Copilot**. I can help you analyze project risks, auto-prioritize task backlogs, draft release notes, or answer team queries.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async (customQuery?: string) => {
    const query = customQuery || inputText.trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customQuery) setInputText('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const targetProjectId = currentProjectId || (currentProject ? currentProject.id : null);
      const response = await axios.post(`${API_BASE_URL}/ai/chat`, {
        message: query,
        projectId: targetProjectId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.data.replyText || 'I processed your request.',
        actionCards: response.data.actionCards || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Sorry, I encountered an issue parsing your AI request. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAction = async (action: any) => {
    const targetProjectId = currentProjectId || (currentProject ? currentProject.id : null);
    if (!targetProjectId) {
      alert('Please open a specific project to run this action.');
      return;
    }

    if (action.type === 'smart_prioritize' || action.title?.includes('Prioritize')) {
      dispatch(smartPrioritizeTasks(Number(targetProjectId)));
      alert('Tasks auto-prioritized successfully by urgency and deadline!');
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-slide-left">
      
      {/* Drawer Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-5 text-white flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-inner">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base tracking-tight flex items-center gap-2">
              AI Copilot Assistant
            </h3>
            <p className="text-xs text-indigo-200">
              {currentProject ? `Context: ${currentProject.name}` : 'Workspace AI Co-Pilot'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Preset Prompts Pills */}
      <div className="p-3 bg-gray-50 border-b border-gray-200 flex gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => handleSendMessage('Summarize project status & bottlenecks')}
          className="text-xs bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full font-medium shrink-0 flex items-center gap-1.5 transition-all"
        >
          <Zap className="w-3.5 h-3.5" />
          Status Summary
        </button>
        <button
          onClick={() => handleSendMessage('Auto-prioritize backlog tasks')}
          className="text-xs bg-white text-purple-700 hover:bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full font-medium shrink-0 flex items-center gap-1.5 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Auto-Prioritize
        </button>
        <button
          onClick={() => handleSendMessage('Draft release notes for completed items')}
          className="text-xs bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-medium shrink-0 flex items-center gap-1.5 transition-all"
        >
          <FileText className="w-3.5 h-3.5" />
          Release Notes
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] text-gray-400 font-medium">{msg.timestamp}</span>
            </div>
            <div
              className={`p-4 rounded-2xl max-w-[88%] text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200/80 shadow-2xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Render Action Cards */}
              {msg.actionCards && msg.actionCards.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                  {msg.actionCards.map((card, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-indigo-200 shadow-2xs space-y-2">
                      <h5 className="font-semibold text-xs text-gray-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        {card.title || 'AI Suggested Action'}
                      </h5>
                      <button
                        onClick={() => handleExecuteAction(card)}
                        className="w-full py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Apply Action Now
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-gray-400 p-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
            AI Copilot is processing...
          </div>
        )}
      </div>

      {/* Footer Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask AI Copilot anything about your project..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
