import React from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left side: Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center gap-2 mb-10">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">AI Project Management</h2>
          </div>
          
          <Outlet />
        </div>
      </div>

      {/* Right side: Illustration */}
      <div className="hidden lg:block relative w-0 flex-1 bg-purple-50">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="/auth-illustration.png"
          alt="Secure authentication illustration"
        />
      </div>
    </div>
  );
};
