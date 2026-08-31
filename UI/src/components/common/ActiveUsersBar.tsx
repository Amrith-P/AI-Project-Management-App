import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { Users } from 'lucide-react';

export const ActiveUsersBar: React.FC = () => {
  const { activeUsers, isConnected } = useSocket();

  if (!activeUsers || activeUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-700/60 backdrop-blur-md shadow-sm">
      <div className="relative flex items-center justify-center">
        <Users className="w-3.5 h-3.5 text-emerald-400" />
        <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
      </div>
      
      <span className="text-xs font-medium text-slate-300 mr-1">
        {activeUsers.length} Live
      </span>

      <div className="flex -space-x-2 overflow-hidden">
        {activeUsers.slice(0, 4).map((user, idx) => (
          <div
            key={user.id || idx}
            title={user.name || user.email}
            className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-800 bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-md"
          >
            {(user.name || user.email || 'U').charAt(0)}
          </div>
        ))}
        {activeUsers.length > 4 && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-[10px] font-medium text-slate-200 ring-2 ring-slate-800">
            +{activeUsers.length - 4}
          </div>
        )}
      </div>
    </div>
  );
};
