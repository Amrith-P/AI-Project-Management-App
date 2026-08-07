import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, Lock } from 'lucide-react';
import axios from 'axios';
import { setCredentials } from '../../store/slices/authSlice';
import { loginSchema } from '../../utils/validation/auth.schema';
import type { LoginFormData } from '../../utils/validation/auth.schema';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', data);
      dispatch(setCredentials({ user: response.data.user, token: response.data.token }));
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div>
      <h3 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">
        Hello,<br />
        Welcome
      </h3>
      <p className="text-sm text-gray-500 mb-8">
        Hey, welcome back to your special place
      </p>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label=""
          type="email"
          placeholder="stanley@gmail.com"
          icon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label=""
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link
              to="/forgot-password"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-base rounded-xl" isLoading={isSubmitting}>
          Sign In
        </Button>
      </form>

      <div className="mt-8 text-center text-sm">
        <span className="text-gray-500">
          Don't have an account?{' '}
        </span>
        <Link
          to="/register"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
};
