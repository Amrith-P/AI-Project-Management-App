import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, Lock, User } from 'lucide-react';
import axios from 'axios';
import { setCredentials } from '../../store/slices/authSlice';
import { registerSchema } from '../../utils/validation/auth.schema';
import type { RegisterFormData } from '../../utils/validation/auth.schema';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

import { API_BASE_URL } from '../../utils/config';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
      dispatch(setCredentials({ user: response.data.user, token: response.data.token }));
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 text-center mb-6">
        Create a new account
      </h3>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          icon={User}
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Select Your Role
          </label>
          <select
            {...register('role')}
            className="w-full text-xs p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="Project Manager">Project Manager (Full Workspace Access)</option>
            <option value="Tech Lead">Tech Lead (Assigned Projects & Backlogs)</option>
            <option value="Developer">Developer (Assigned Tasks & Sprint Kanban)</option>
            <option value="Designer">Designer (Assigned UI Tasks & Assets)</option>
            <option value="QA Engineer">QA Engineer (Testing Tasks & Checklist QA)</option>
          </select>
        </div>

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
          Create account
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-500">Already have an account? </span>
        <Link
          to="/login"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Sign in instead
        </Link>
      </div>
    </div>
  );
};
