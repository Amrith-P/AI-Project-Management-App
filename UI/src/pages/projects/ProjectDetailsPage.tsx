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
  AlertCircle
} from 'lucide-react';
import { CreateProjectModal } from '../../components/projects/CreateProjectModal';
import { Board } from '../../components/board/Board';
import { AIAssistantModal } from '../../components/ai/AIAssistantModal';
import { AIInsightsWidget } from '../../components/ai/AIInsightsWidget';
import { AIRiskPredictorWidget } from '../../components/ai/AIRiskPredictorWidget';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'board'>('overview');
  const dispatch = useDispatch<AppDispatch>();
  const { currentProject, isLoading, error } = useSelector((state: RootState) => state.projects);

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
    }
    return () => {
      dispatch(clearCurrentProject());
    };
  }, [dispatch, id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Planning': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'Archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
      <div className="flex flex-col gap-4 pb-6 border-b border-gray-200">
        <div>
          <Link to="/projects" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors mb-4">
            <ArrowLeft className="mr-1 w-4 h-4" />
            Back to Projects
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: currentProject.color || '#4f46e5' }}
              >
                <FolderKanban className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {currentProject.name}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Created {new Date(currentProject.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(currentProject.status)}`}>
                {currentProject.status}
              </span>
              <button 
                onClick={() => setIsAiModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-sm text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:-translate-y-0.5"
              >
                <span className="mr-2">✨</span>
                AI Task Breakdown
              </button>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Edit Project
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('board')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'board'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Board
          </button>
        </nav>
      </div>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          <AIRiskPredictorWidget projectId={currentProject.id} />

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">About this project</h2>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
              {currentProject.description || 'No description provided.'}
            </p>
          </div>

          {/* Real AI Summary & Insights Widget */}
          <AIInsightsWidget projectId={Number(currentProject.id)} />
        </div>

        {/* Sidebar Info (Right Column) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Project Details</h3>
            
            <div className="space-y-4">
              {/* Progress */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-500">Progress</span>
                  <span className="text-sm font-semibold text-gray-900">{currentProject.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500 ease-out" 
                    style={{ 
                      width: `${currentProject.progress}%`,
                      backgroundColor: currentProject.color || '#4f46e5' 
                    }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500 gap-2">
                  <Flag className="w-4 h-4" />
                  Priority
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${getPriorityColor(currentProject.priority)}`}>
                  {currentProject.priority}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500 gap-2">
                  <Eye className="w-4 h-4" />
                  Visibility
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {currentProject.visibility}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                <div className="flex items-center text-sm text-gray-500 gap-2">
                  <Calendar className="w-4 h-4" />
                  Timeline
                </div>
                <div className="flex justify-between items-center text-sm ml-6">
                  <span className="text-gray-500">Start:</span>
                  <span className="font-medium text-gray-900">{new Date(currentProject.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm ml-6">
                  <span className="text-gray-500">End:</span>
                  <span className="font-medium text-gray-900">{new Date(currentProject.endDate).toLocaleDateString()}</span>
                </div>
              </div>

              {currentProject.tags && currentProject.tags.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500 gap-2 mb-3">
                    <Tag className="w-4 h-4" />
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentProject.tags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
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
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden">
          <Board />
          
        </div>
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
    </div>
  );
};
