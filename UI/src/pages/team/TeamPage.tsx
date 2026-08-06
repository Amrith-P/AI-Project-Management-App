import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserPlus, Trash2, Mail, Shield } from 'lucide-react';
import type { AppDispatch, RootState } from '../../store';
import { fetchTeam, removeMember, updateMemberRole } from '../../store/slices/teamSlice';
import { InviteMemberModal } from './InviteMemberModal';
import { Button } from '../../components/ui/Button';
import type { TeamRole } from '../../types/team';

export const TeamPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { members, isLoading } = useSelector((state: RootState) => state.team);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTeam());
  }, [dispatch]);

  const handleRoleChange = async (id: number, newRole: TeamRole) => {
    await dispatch(updateMemberRole({ id, role: newRole }));
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this member from your team?')) {
      await dispatch(removeMember(id));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your team members, roles, and permissions.</p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No team members yet</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            Invite colleagues to your team to start collaborating on projects and tasks together.
          </p>
          <Button onClick={() => setIsInviteModalOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Your First Member
          </Button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {members.map((member) => (
              <li key={member.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {member.name || <span className="text-gray-400 italic">Name pending</span>}
                      </div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {member.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as TeamRole)}
                        className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-transparent"
                      >
                        <option value="Member">Member</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleDelete(member.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                      title="Remove Member"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
};
