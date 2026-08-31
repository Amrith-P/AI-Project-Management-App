import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectById, clearCurrentProject } from '../../store/slices/projectSlice';
import type { RootState, AppDispatch } from '../../store';
import { 
  ArrowLeft, 
  Calendar, 
  Flag, 
  Tag,
  Eye,
  FolderKanban,
  AlertCircle,
  Zap,
  Download
} from 'lucide-react';
import { CreateProjectModal } from '../../components/projects/CreateProjectModal';
import { Board } from '../../components/board/Board';
import { AIAssistantModal } from '../../components/ai/AIAssistantModal';
import { AIInsightsWidget } from '../../components/ai/AIInsightsWidget';
import { AIRiskPredictorWidget } from '../../components/ai/AIRiskPredictorWidget';
import { GanttTimelineView } from '../../components/timeline/GanttTimelineView';
import { AutomationModal } from '../../components/automations/AutomationModal';
import { ExportReportModal } from '../../components/projects/ExportReportModal';
import { AISchedulerModal } from '../../components/ai/AISchedulerModal';
import { useSocket } from '../../context/SocketContext';
import { Sparkles as SparklesIcon } from 'lucide-react';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSchedulerModalOpen, setIsSchedulerModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'board' | 'timeline'>('overview');
  
  const dispatch = useDispatch<AppDispatch>();
  const { currentProject, isLoading, error } = useSelector((state: RootState) => state.projects);
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const user = useSelector((state: RootState) => state.auth.user);
  const { joinProjectRoom, leaveProjectRoom } = useSocket();

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
    }
    return () => {
      dispatch(clearCurrentProject());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (currentProject?.id && user) {
      joinProjectRoom(Number(currentProject.id), {
        id: user.id,
        name: user.full_name,
        email: user.email,
      });
      return () => {
        leaveProjectRoom(Number(currentProject.id));
      };
    }
  }, [currentProject?.id, user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border-blue-200';
      case 'Planning': return 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 border-purple-200';
      case 'Completed': return 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200 border-green-200';
      case 'On Hold': return 'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200 border-yellow-200';
      case 'Cancelled': return 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200 border-red-200';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !currentProject) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center gap-3 shadow-sm max-w-2xl mx-auto mt-8">
        <AlertCircle className="w-6 h-6" />
        <div>
          <h3 className="font-semibold text-lg">Error Loading Project</h3>
          <p>{error || 'Project not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header section */}
      <div className="flex flex-col gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <Link to="/projects" className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 transition-colors mb-4">
            <ArrowLeft className="mr-1 w-4 h-4" />
            Back to Projects
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: currentProject.color || '#4f46e5' }}
              >
                <FolderKanban className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {currentProject.name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Created {new Date(currentProject.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(currentProject.status)}`}>
                {currentProject.status}
              </span>

              {/* AI Auto-Schedule Button */}
              <button
                onClick={() => setIsSchedulerModalOpen(true)}
                className="inline-flex items-center px-3.5 py-2 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-bold transition-all shadow-2xs"
              >
                <SparklesIcon className="w-4 h-4 mr-1.5 text-purple-600 dark:text-purple-400" />
                AI Auto-Schedule
              </button>

              {/* AI Automations Button */}
              <button
                onClick={() => setIsAutomationModalOpen(true)}
                className="inline-flex items-center px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition-all shadow-2xs"
              >
                <Zap className="w-4 h-4 mr-1.5 text-indigo-600 dark:text-indigo-400" />
                AI Automations
              </button>

              {/* Export Executive Report Button */}
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="inline-flex items-center px-3.5 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
              >
                <Download className="w-4 h-4 mr-1.5 text-gray-500" />
                Export Report
              </button>

              <button 
                onClick={() => setIsAiModalOpen(true)}
                className="inline-flex items-center px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-sm text-xs font-bold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:-translate-y-0.5"
              >
                <span className="mr-1.5">✨</span>
                AI Breakdown
              </button>

              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-2xs text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('board')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'board'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Kanban Board
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'timeline'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Gantt Schedule
          </button>
        </nav>
      </div>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content (Left Column) */}
          <div className="lg:col-span-2 space-y-6">
            <AIRiskPredictorWidget projectId={currentProject.id} />

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About this project</h2>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {currentProject.description || 'No description provided.'}
              </p>
            </div>

            <AIInsightsWidget projectId={Number(currentProject.id)} />
          </div>

          {/* Sidebar Info (Right Column) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Project Details</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Progress</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{currentProject.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500 ease-out" 
                      style={{ 
                        width: `${currentProject.progress}%`,
                        backgroundColor: currentProject.color || '#4f46e5' 
                      }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-2">
                    <Flag className="w-4 h-4" />
                    Priority
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${getPriorityColor(currentProject.priority)}`}>
                    {currentProject.priority}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-2">
                    <Eye className="w-4 h-4" />
                    Visibility
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentProject.visibility}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-2">
                    <Calendar className="w-4 h-4" />
                    Timeline
                  </div>
                  <div className="flex justify-between items-center text-sm ml-6">
                    <span className="text-gray-500 dark:text-gray-400">Start:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{new Date(currentProject.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm ml-6">
                    <span className="text-gray-500 dark:text-gray-400">End:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{new Date(currentProject.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {currentProject.tags && currentProject.tags.length > 0 && (
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-2 mb-3">
                      <Tag className="w-4 h-4" />
                      Tags
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentProject.tags.map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'board' ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 p-6 overflow-hidden">
          <Board />
        </div>
      ) : (
        <GanttTimelineView tasks={tasks} />
      )}

      {isEditModalOpen && (
        <CreateProjectModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          projectToEdit={currentProject}
        />
      )}

      {isAiModalOpen && (
        <AIAssistantModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          projectId={Number(currentProject.id)}
          projectName={currentProject.name}
          projectDescription={currentProject.description}
        />
      )}

      {isAutomationModalOpen && (
        <AutomationModal
          isOpen={isAutomationModalOpen}
          onClose={() => setIsAutomationModalOpen(false)}
          projectId={currentProject.id}
        />
      )}

      {isExportModalOpen && (
        <ExportReportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          projectId={currentProject.id}
          projectName={currentProject.name}
        />
      )}

      {isSchedulerModalOpen && (
        <AISchedulerModal
          isOpen={isSchedulerModalOpen}
          onClose={() => setIsSchedulerModalOpen(false)}
          projectId={Number(currentProject.id)}
          onApplySchedule={() => dispatch(fetchProjectById(id!))}
        />
      )}
    </div>
  );
};
