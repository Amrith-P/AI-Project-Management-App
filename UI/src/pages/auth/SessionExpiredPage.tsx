import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const SessionExpiredPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Session Expired
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your security token has expired. Please log in again to continue.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <Button 
            className="w-full justify-center" 
            onClick={() => navigate('/login')}
          >
            <LogIn className="w-5 h-5 mr-2" />
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  );
};
