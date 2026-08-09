import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserPlus, Trash2, Mail, Shield, CheckSquare, BarChart2 } from 'lucide-react';
import type { AppDispatch, RootState } from '../../store';
import { fetchTeam, removeMember, updateMemberRole } from '../../store/slices/teamSlice';
import { fetchUserAllTasks } from '../../store/slices/taskSlice';
import { InviteMemberModal } from './InviteMemberModal';
import { Button } from '../../components/ui/Button';
import type { TeamRole, TeamMember } from '../../types/team';

export const TeamPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { members, isLoading } = useSelector((state: RootState) => state.team);
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTeam());
    dispatch(fetchUserAllTasks());
  }, [dispatch]);

  const handleRoleChange = async (id: number, newRole: TeamRole) => {
    await dispatch(updateMemberRole({ id, role: newRole }));
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this member from your team?')) {
      await dispatch(removeMember(id));
    }
  };

  const getMemberAssignedTasks = (memberId: number) => {
    return tasks.filter(t => t.assigneeId === memberId);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Team & Workload Workspace</h1>
          <p className="mt-1 text-sm text-gray-500">Manage team collaborators, roles, and monitor assigned task workloads.</p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Team Member
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">No team members invited yet</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-6 text-sm">
            Invite collaborators to assign tasks, share AI insights, and accelerate team velocity.
          </p>
          <Button onClick={() => setIsInviteModalOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Your First Member
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Workload Summary Bar */}
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-300" />
                Team Capacity & Workload
              </h3>
              <p className="text-xs text-indigo-200 mt-1">
                {members.length} active collaborators across projects.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-center">
                <span className="block text-xl font-extrabold">{tasks.length}</span>
                <span className="text-[10px] text-indigo-200 uppercase font-semibold">Total Tasks</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-center">
                <span className="block text-xl font-extrabold">{tasks.filter(t => t.assigneeId).length}</span>
                <span className="text-[10px] text-indigo-200 uppercase font-semibold">Assigned</span>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="bg-white shadow-xs rounded-2xl border border-gray-200 overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {members.map((member: TeamMember) => {
                const assigned = getMemberAssignedTasks(member.id);
                const completed = assigned.filter(t => t.status === 'Done').length;

                return (
                  <li key={member.id} className="p-4 sm:p-5 hover:bg-gray-50/80 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                          {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            {member.name || <span className="text-gray-400 italic">Name pending</span>}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              member.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {member.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </div>
                      </div>

                      {/* Workload stats */}
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <span className="text-xs font-semibold text-gray-800 flex items-center gap-1">
                            <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                            {assigned.length} Tasks ({completed} Done)
                          </span>
                          <div className="w-24 bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
                            <div 
                              className="bg-indigo-600 h-1.5 transition-all" 
                              style={{ width: `${assigned.length > 0 ? (completed / assigned.length) * 100 : 0}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value as TeamRole)}
                            className="text-xs font-semibold border-gray-200 rounded-lg p-1.5 focus:ring-indigo-500 bg-gray-50 outline-none"
                          >
                            <option value="Member">Member</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </div>

                        <button
                          onClick={() => handleDelete(member.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                          title="Remove Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

        </div>
      )}

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
};
