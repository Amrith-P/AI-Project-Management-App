import React from 'react';
import { Search, X, User, Tag, AlertCircle } from 'lucide-react';
import type { TeamMember } from '../../types/team';

interface BoardFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedPriority: string;
  onPriorityChange: (p: string) => void;
  selectedAssignee: string;
  onAssigneeChange: (a: string) => void;
  selectedLabel: string;
  onLabelChange: (l: string) => void;
  teamMembers?: TeamMember[];
  availableLabels?: string[];
  onClearFilters: () => void;
  filteredCount?: number;
  totalCount?: number;
}

export const BoardFilterBar: React.FC<BoardFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  selectedAssignee,
  onAssigneeChange,
  selectedLabel,
  onLabelChange,
  teamMembers = [],
  availableLabels = ['Bug', 'Feature', 'UI/UX', 'Backend', 'DevOps', 'QA'],
  onClearFilters,
  filteredCount,
  totalCount,
}) => {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedPriority !== 'All' ||
    selectedAssignee !== 'All' ||
    selectedLabel !== 'All';

  return (
    <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs mb-5 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-3">
      {/* Left: Search input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter tasks by title or keyword..."
          className="w-full pl-9 pr-8 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right: Dropdowns */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Priority Filter */}
        <div className="relative flex items-center">
          <AlertCircle className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
          <select
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="pl-8 pr-6 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Assignee Filter */}
        {teamMembers.length > 0 && (
          <div className="relative flex items-center">
            <User className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
            <select
              value={selectedAssignee}
              onChange={(e) => onAssigneeChange(e.target.value)}
              className="pl-8 pr-6 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
            >
              <option value="All">All Assignees</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.email}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tag Filter */}
        <div className="relative flex items-center">
          <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
          <select
            value={selectedLabel}
            onChange={(e) => onLabelChange(e.target.value)}
            className="pl-8 pr-6 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
          >
            <option value="All">All Tags</option>
            {availableLabels.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold transition-colors flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}

        {/* Counter */}
        {filteredCount !== undefined && totalCount !== undefined && (
          <span className="text-[11px] font-medium text-gray-400 ml-1">
            Showing {filteredCount}/{totalCount}
          </span>
        )}
      </div>
    </div>
  );
};
