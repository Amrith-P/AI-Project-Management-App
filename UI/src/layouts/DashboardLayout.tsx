import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { AICopilotDrawer } from '../components/ai/AICopilotDrawer';

export const DashboardLayout: React.FC = () => {
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 w-0 overflow-hidden relative">
        <Navbar onToggleAiCopilot={() => setIsAiCopilotOpen(!isAiCopilotOpen)} />
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 md:px-8">
            <Outlet />
          </div>
        </main>
        
        {/* Global AI Copilot Drawer */}
        <AICopilotDrawer
          isOpen={isAiCopilotOpen}
          onClose={() => setIsAiCopilotOpen(false)}
        />
      </div>
    </div>
  );
};
