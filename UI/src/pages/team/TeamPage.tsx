import React from 'react';
import { Users, UserPlus, Shield } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const TeamPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your team members, roles, and permissions.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="mx-auto w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
          <Users className="w-12 h-12 text-indigo-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Team Features Coming Soon</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          We're working on advanced team management capabilities, including role-based access control, 
          guest invites, and department grouping. 
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left mb-8">
          <div className="border border-gray-100 rounded-lg p-5 bg-gray-50">
            <UserPlus className="w-6 h-6 text-indigo-500 mb-3" />
            <h3 className="font-medium text-gray-900">Invite Members</h3>
            <p className="text-sm text-gray-500 mt-1">Easily invite colleagues via email to collaborate on projects.</p>
          </div>
          <div className="border border-gray-100 rounded-lg p-5 bg-gray-50">
            <Shield className="w-6 h-6 text-indigo-500 mb-3" />
            <h3 className="font-medium text-gray-900">Role Management</h3>
            <p className="text-sm text-gray-500 mt-1">Assign admin, editor, or viewer roles to control access.</p>
          </div>
        </div>

        <Button disabled className="mx-auto">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Team Member
        </Button>
      </div>
    </div>
  );
};
